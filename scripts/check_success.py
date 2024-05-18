import os

def get_result_line(filename):
    # get last line from file
    try:
        last_line = subprocess.check_output(
            ['tail', '-1', filename]).decode('utf-8').strip()
        # if the last line is not the one we want, get the last 100 lines and search
        if 'in' not in last_line or "passed" not in last_line:
            last_lines = subprocess.check_output(
                ['tail', '-500', filename]).decode('utf-8').strip().split('\n')
            for line in reversed(last_lines):
                if 'in' in line and "passed" in line:
                    last_line = line
                    return last_line
        else:
            return last_line
    except:
        return None

def check_success():
    file_name = os.environ.get('REPORT_FILE')
    result_line = get_result_line(file_name)

    print('Result Line: ', result_line)

    if result_line is None:
        print('exiting with an error')
        exit(1)
    else:
        print('exiting with success')
        exit(0)

if __name__ == '__main__':
    check_success()