import re
import sys

##################
# THE CODES FROM THIS FILE HAVE BEEN MOVED TO parse_reports.py
##################


def convert_to_bytes(value, unit):
    units = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 ** 2,
        'GB': 1024 ** 3,
        'TB': 1024 ** 4,
        'KiB': 1024,
        'MiB': 1024 ** 2,
        'GiB': 1024 ** 3,
        'TiB': 1024 ** 4,
    }
    return value * units[unit]


def process_memory_file(file_path):
    total_memory_bytes = 0
    regex = re.compile(r"Total memory allocated: (\d+\.?\d*)([a-zA-Z]+)")

    with open(file_path, 'r') as file:
        for line in file:
            match = regex.search(line)
            if match:
                value = float(match.group(1))
                unit = match.group(2)

                # convert to bytes
                total_memory_bytes += convert_to_bytes(value, unit)

    return total_memory_bytes


if len(sys.argv) != 2:
    print('Usage: python3 memory_parser.py <file_path>')
    sys.exit(1)

file_path = sys.argv[1]
total_memory = process_memory_file(file_path)
total_memory_kb = round(total_memory / 1024, 2)
print(f'Total memory allocated: {total_memory_kb} KB')
