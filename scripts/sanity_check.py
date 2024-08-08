import csv
import json
import sys

csv.field_size_limit(sys.maxsize)


def read_csv_to_list_dict(file_name):
    with open(file_name) as file:
        reader = csv.DictReader(file)
        return list(reader)


def is_results_diff(lines, name):
    columns = ['passed', 'failed', 'skipped', 'errors']
    # check if the diffs are the same for all lines for all columns
    for c in columns:
        results = set()
        for l in lines:
            # check if the value is a number using int
            try:
                results.add(int(l[c]))
            except:
                print(f'***Project {name} has non-integer {c} value')
                return True

            if len(results) != 1:
                print(f'!!!Project {name} has different {c} values. Algorithm: {l["algorithm"]}')
                return True
    return False


def sanity_check(lines):
    # lopp through all lines, create a dict by project and add the lines to the dict
    projects = {}
    new_projects = {}

    problems = 0
    problems_memory = 0
    problems_diff_values = 0

    NUM_LINES_PER_PROJECT = 6

    original_keys = lines[0].keys()

    for l in lines:
        project = l["project"]
        if project not in projects:
            projects[project] = []
        projects[project].append(l)

    del lines

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
            # for line in projects[p]:
            #     mem = line['memory']
            #     if mem in [None, '', ' '] or float(mem) == 0:
            #         line['memory'] = 1
            #         problems_memory += 1
            #     elif float(mem) < 0:
            #         line['memory'] = float(mem) * -1

            if not is_results_diff(projects[p], p):
                # add the project to the new dict
                new_projects[p] = projects[p]
            else:
                problems_diff_values += 1

    print(
        f"num of problems related to number of lines: {problems} (skip these projects)")
    print(
        f"num of problems related to memory: {problems_memory} (we add value 1)")
    print(
        f"num of problems related to different values across columns of the same project: {problems_diff_values} (skip these projects)")

    print(f'total input projects: {len(projects)}')
    print(f'total projects output: {len(new_projects)}')

    print(
        f"saving new csv, with only projects with {NUM_LINES_PER_PROJECT} lines")

    file_name = 'new-results.csv'
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
