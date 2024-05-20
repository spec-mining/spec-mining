import csv
import json
import sys

csv.field_size_limit(sys.maxsize)

def read_csv_to_list_dict(file_name):
    with open(file_name) as file:
        reader = csv.DictReader(file)
        return list(reader)


def sanity_check(lines):
    # lopp through all lines, create a dict by project and add the lines to the dict
    projects = {}
    new_projects = {}
    problems = 0
    NUM_LINES_PER_PROJECT = 6
    for l in lines:
        project = l["project"]
        if project not in projects:
            projects[project] = []
        projects[project].append(l)

    # check if all projects have 6 lines
    for p in projects:
        if len(projects[p]) != NUM_LINES_PER_PROJECT:
            problems += 1
            print('---')
            print(f"Project {p} has {len(projects[p])} lines")
            algos = []
            # print(projects[p])
            for line in projects[p]:
                algos.append(line['algorithm'])
            print(algos)
        else:
            new_projects[p] = projects[p]

    print(f"num of problems: {problems}")

    print(
        f"saving new csv, with only projects with {NUM_LINES_PER_PROJECT} lines")

    file_name = 'new-results.csv'
    original_keys = lines[0].keys()
    save_new_csv(file_name, new_projects, original_keys)
    print("saved new csv, file name: new-results.csv")


def save_new_csv(file_name, new_projects, original_keys):
    with open(file_name, mode='w') as file:
        fieldnames = original_keys
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for p in new_projects:
            for line in new_projects[p]:
                writer.writerow(line)


def main():
    lines = read_csv_to_list_dict("results.csv")
    sanity_check(lines)


main()