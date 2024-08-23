import csv

def count_rows_with_value_in_column(csv_file, column_name, value):
    count = 0
    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row[column_name] == value:
                count += 1
    return count

def all_rows_grouped_by_project(csv_file):
    # go through all rows and add them to a dict based on the project name
    projects = {} # { [project_name]: [...rows] }

    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            project_name = row['project']
            if project_name not in projects:
                projects[project_name] = []
            projects[project_name].append(row)
    
    return projects

def get_projects_failed_due_to_exec_error(all_projects):
    # any project that has some value for "execution_problems" and no value for "passed"
    failed_projects = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in all_projects.items():
        for row in rows:
            if row['algorithm'] == 'ORIGINAL' and row['execution_problems'] and not row['passed']:
                failed_projects[project_name] = rows
                break
    
    return failed_projects

def get_projects_that_have_no_tests(projects_that_ran):
    # any project that has some value for "execution_problems" and no value for "passed"
    projects_with_no_tests = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in projects_that_ran.items():
        for row in rows:
            if row['algorithm'] == 'ORIGINAL' and row['passed'] == '0' and row['failed'] == '0' and row['errors'] == '0':
                projects_with_no_tests[project_name] = rows
                break
    
    return projects_with_no_tests

def get_projects_that_failed_to_collect_any_test(projects_that_ran):
    # any project that has some value for "execution_problems" and no value for "passed"
    projects_failed_to_collect_tests = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in projects_that_ran.items():
        for row in rows:
            try:
                error_count = int(row['errors'])

                if row['algorithm'] == 'ORIGINAL' and row['passed'] == '0' and row['failed'] == '0' and error_count > 0:
                    projects_failed_to_collect_tests[project_name] = rows
                    break
            except: pass
    
    return projects_failed_to_collect_tests

def get_projects_where_at_least_1_test_passed(projects_that_ran):
    # any project that has some value for "execution_problems" and no value for "passed"
    projects_with_no_tests = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in projects_that_ran.items():
        for row in rows:
            try:
                passed = int(row['passed'])

                if row['algorithm'] == 'ORIGINAL' and passed > 0:
                    projects_with_no_tests[project_name] = rows
                    break
            except: pass
    
    return projects_with_no_tests

def get_projects_failing_due_to_seg_fault(projects_that_failed_with_pymop):
    # any project that has some value for "execution_problems" and no value for "passed"
    projects_failed_with_seg_fault = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in projects_that_failed_with_pymop.items():
        for row in rows:
            if row['algorithm'] != 'ORIGINAL' and row['execution_problems'] and row['execution_problems'].find('Segmentation fault') != -1:
                projects_failed_with_seg_fault[project_name] = rows
                break
    
    return projects_failed_with_seg_fault

def get_projects_that_passed_at_least_1_test_with_algo(projects_with_at_least_1_passing_test, algo):
    # any project that has some value for "execution_problems" and no value for "passed"
    projects_that_passed_at_least_1_test_with_algo = {}

    # all_projects is a dict of the form { [project_name]: [...rows] }

    for project_name, rows in projects_with_at_least_1_passing_test.items():
        for row in rows:
            try:
                passed = int(row['passed'])
                if row['algorithm'] == algo and passed > 0:
                    projects_that_passed_at_least_1_test_with_algo[project_name] = rows
                    break
            except: pass

    
    return projects_that_passed_at_least_1_test_with_algo

def read_header(csv_file_path):
    with open(csv_file_path, mode='r') as file:
        reader = csv.DictReader(file)
        return reader.fieldnames

def output_to_csv(header, projects, file_name):
    with open(file_name, mode='w') as file:
        writer = csv.DictWriter(file, fieldnames=header)
        writer.writeheader()
        for project_name, rows in projects.items():
            for row in rows:
                writer.writerow(row)


TOTAL_PROJECT_COUNT = 4388
results_csv_file_path = './scripts/MASSIVE-4k-results.csv'
sanity_checked_results_csv_file_path = './scripts/MASSIVE-4k-sanity-check-results.csv'
column_name = 'algorithm'
value_to_find = 'D'

count = count_rows_with_value_in_column(results_csv_file_path, column_name, value_to_find)

all_projects = all_rows_grouped_by_project(results_csv_file_path)

header = read_header(results_csv_file_path)
projects_with_logs = len(all_projects)
projects_missing_logs = TOTAL_PROJECT_COUNT - projects_with_logs
print(f'1. {projects_missing_logs}/{TOTAL_PROJECT_COUNT} - { round(projects_missing_logs/TOTAL_PROJECT_COUNT*100, 2) }% : [without pymop] Missing projects. these projects failed to run in github actions for some reason (most likely due to timeout) but also failed to save logs.')


projects_failed_to_execute = get_projects_failed_due_to_exec_error(all_projects)

output_to_csv(header, projects_failed_to_execute, '2_projects_failed_to_execute.csv')
print(f'2. {len(projects_failed_to_execute)}/{TOTAL_PROJECT_COUNT} - { round(len(projects_failed_to_execute)/TOTAL_PROJECT_COUNT*100, 2) }% : [without pymop] Failed to start the test suite due to various errors but most likely related to missing dependencies.')


# everything in all_projects but not in project_failed_to_execute
projects_that_ran = {k: v for k, v in all_projects.items() if k not in projects_failed_to_execute}

projects_failed_to_collect_tests = get_projects_that_failed_to_collect_any_test(projects_that_ran)

output_to_csv(header, projects_failed_to_collect_tests, '3_projects_failed_to_collect_tests.csv')
print(f'3. {len(projects_failed_to_collect_tests)}/{TOTAL_PROJECT_COUNT} - { round(len(projects_failed_to_collect_tests)/TOTAL_PROJECT_COUNT*100, 2) }% : [without pymop] Projects that ran but failed to collect any test (passed == failed == 0 and errors > 0).')

projects_with_no_tests = get_projects_that_have_no_tests(projects_that_ran)

output_to_csv(header, projects_with_no_tests, '4_projects_with_no_tests.csv')
print(f'4. {len(projects_with_no_tests)}/{TOTAL_PROJECT_COUNT} - { round(len(projects_with_no_tests)/TOTAL_PROJECT_COUNT*100, 2) }% : [without pymop] Projects that ran but did not have any tests (passed == failed == errors == 0).')


projects_with_at_least_1_passing_test = get_projects_where_at_least_1_test_passed(projects_that_ran)

output_to_csv(header, projects_with_at_least_1_passing_test, '5_projects_with_at_least_1_passing_test.csv')
print(f'5. {len(projects_with_at_least_1_passing_test)}/{TOTAL_PROJECT_COUNT} - { round(len(projects_with_at_least_1_passing_test)/TOTAL_PROJECT_COUNT*100, 2) }% : [without pymop] Projects that ran and had at least 1 passing test (passed > 0).')


sanity_checked_projects = all_rows_grouped_by_project(sanity_checked_results_csv_file_path)

b_c_cplus_d_algos_ran_successfully = len(sanity_checked_projects)

print(f'5.1. {b_c_cplus_d_algos_ran_successfully}/{len(projects_with_at_least_1_passing_test)} - { round(b_c_cplus_d_algos_ran_successfully/len(projects_with_at_least_1_passing_test)*100, 2) }% : [with pymop] Projects that ran successfully with pymop.')

# everything in projects_with_at_least_1_passing_test but not in b_c_cplus_d_algos_ran_successfully
projects_that_failed_with_pymop = {k: v for k, v in projects_with_at_least_1_passing_test.items() if k not in sanity_checked_projects}

output_to_csv(header, projects_that_failed_with_pymop, '5.2_projects_that_failed_with_pymop.csv')
print(f'5.2. {len(projects_that_failed_with_pymop)}/{len(projects_with_at_least_1_passing_test)} - { round(len(projects_that_failed_with_pymop)/len(projects_with_at_least_1_passing_test)*100, 2) }% : [with pymop] Projects that failed with pymop.')


projects_failed_with_seg_fault = get_projects_failing_due_to_seg_fault(projects_that_failed_with_pymop)

output_to_csv(header, projects_failed_with_seg_fault, '5.2.1_projects_failed_with_seg_fault.csv')
print(f'5.2.1. {len(projects_failed_with_seg_fault)}/{len(projects_that_failed_with_pymop)} - { round(len(projects_failed_with_seg_fault)/len(projects_that_failed_with_pymop)*100, 2) }% : [with pymop] Projects that failed with a segmentation fault.')


for index, algo in enumerate(['A', 'B', 'C', 'C+', 'D']):
    # projects that ran at least one test on algo
    projects_that_ran_with_algo = get_projects_that_passed_at_least_1_test_with_algo(projects_with_at_least_1_passing_test, algo)

    output_to_csv(header, projects_that_ran_with_algo, f'5.{index+3}_projects_that_ran_with_algo_{algo}.csv')
    print(f'5.{index+3}. {len(projects_that_ran_with_algo)}/{len(projects_with_at_least_1_passing_test)} - { round(len(projects_that_ran_with_algo)/len(projects_with_at_least_1_passing_test)*100, 2) }% : [with pymop] Projects that ran at least one test with algorithm {algo}.')