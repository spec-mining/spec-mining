import json
import csv
from typing import Any, Dict, List
import os

ALGOS = ['B', 'C', 'C+', 'D']

def load_json(input_file: str) -> Dict[str, Any]:
    """Load JSON data from a file."""
    with open(input_file, "r") as f:
        return json.load(f)

def calculate_time_test(test: Dict[str, Any]) -> float:
    """Calculate the total time for a test."""
    durations = [
        test.get("setup", {}).get("duration", 0.0),
        test.get("call", {}).get("duration", 0.0),
        test.get("teardown", {}).get("duration", 0.0)
    ]
    return round(sum(durations), 4)

def extract_test_times(data: Dict[str, Any], algo: str) -> Dict[str, float]:
    """Extract test names and their times for a specific algorithm."""
    test_times = {}
    for test in data.get("tests", []):
        test_name = test.get("nodeid", "N/A")
        time_test = calculate_time_test(test)
        test_times[test_name] = time_test
    return test_times

def merge_test_results(project: str, all_test_times: Dict[str, Dict[str, float]]) -> List[Dict[str, Any]]:
    """Combine test times across algorithms into one row per test."""
    merged_results = []
    all_test_names = set()
    for algo_times in all_test_times.values():
        all_test_names.update(algo_times.keys())
    
    for test_name in all_test_names:
        row = {"project": project, "test_name": test_name}
        for algo in ALGOS:
            row[f"time_{algo}"] = all_test_times.get(algo, {}).get(test_name, None)
        merged_results.append(row)
    
    return merged_results

def process_project(project: str) -> List[Dict[str, Any]]:
    """Process all algorithm results for a project."""
    all_test_times = {}
    for algo in ALGOS:
        file_path = os.path.join(project, f"{algo}.report.json")
        if os.path.isfile(file_path):
            print(f"Processing file {file_path}")
            data = load_json(file_path)
            all_test_times[algo] = extract_test_times(data, algo)
        else:
            print(f"ERROR: File {file_path} not found")
    return merge_test_results(project, all_test_times)

def save_to_csv(merged_results: List[Dict[str, Any]], output_file: str) -> None:
    """Save merged results to a CSV file."""
    with open(output_file, "w", newline="") as csvfile:
        fieldnames = ["project", "test_name"] + [f"time_{algo}" for algo in ALGOS]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(merged_results)

def process_folders(results_after_sanity: str) -> None:
    """Process all projects and generate the final CSV."""
    projects = set()
    with open(results_after_sanity, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            projects.add(row['project'])

    merged_results = []
    for project in projects:
        if os.path.isdir(project):
            print(f"Processing project {project}")
            merged_results.extend(process_project(project))
        else:
            print(f"ERROR: Project folder {project} not found")

    save_to_csv(merged_results, "results_tests.csv")
    print(f"Results saved to results_tests.csv")

process_folders("sanity-check-results.csv")
