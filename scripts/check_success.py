import os
from .parse_reports import get_result_line

def check_success():
    file_name = os.environ.get('REPORT_FILE')
    result_line = get_result_line(file_name)
    if result_line is None:
        exit(1)