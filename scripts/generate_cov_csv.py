import os
import csv
import json

def generate_csv(directory):
    csv_file = os.path.join(directory, 'coverage_report.csv')
    with open(csv_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        header = [
            'project_link', 'sha', 'covered_lines', 'num_statements', 'percent_covered',
            'percent_covered_display', 'missing_lines', 'excluded_lines', 'num_branches',
            'num_partial_branches', 'covered_branches', 'missing_branches'
        ]
        writer.writerow(header)

        for folder in os.listdir(directory):
            try:
                folder_path = os.path.join(directory, folder)
                if os.path.isdir(folder_path):
                    project_info_path = os.path.join(folder_path, 'project_info.txt')
                    coverage_json_path = os.path.join(folder_path, 'coverage.json')

                    if os.path.isfile(project_info_path) and os.path.isfile(coverage_json_path):
                        with open(project_info_path, 'r') as project_info_file:
                            project_info = project_info_file.read().strip()
                            project_link = project_info.split('@')[0]
                            sha = project_info.split('@')[1]

                        with open(coverage_json_path, 'r') as coverage_json_file:
                            coverage_data = json.load(coverage_json_file).get('totals', {})

                        row = [
                            project_link,
                            sha,
                            coverage_data.get('covered_lines', ''),
                            coverage_data.get('num_statements', ''),
                            coverage_data.get('percent_covered', ''),
                            coverage_data.get('percent_covered_display', ''),
                            coverage_data.get('missing_lines', ''),
                            coverage_data.get('excluded_lines', ''),
                            coverage_data.get('num_branches', ''),
                            coverage_data.get('num_partial_branches', ''),
                            coverage_data.get('covered_branches', ''),
                            coverage_data.get('missing_branches', '')
                        ]
                        writer.writerow(row)
            except Exception as e:
                row = [
                    project_link,
                    sha,
                    '', '', '', '', '', '', '', '', '', '', ''
                ]
                writer.writerow(row)

if __name__ == "__main__":
    generate_csv('.')

