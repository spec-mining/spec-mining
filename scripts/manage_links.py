import json
import math

def main():
    with open('links.json', 'r') as file:
        data = file.read()
        print('loaded file', len(data))
        links = json.load(file)
    
    print('the links:\n', links)
    
    max_chunk_size = 256
    num_repositories = len(os.getenv('GITHUB_REPOSITORIES').split())
    chunks = [links[i:i + max_chunk_size] for i in range(0, len(links), max_chunk_size)]
    commands = []
    
    for index, chunk in enumerate(chunks):
        tab_name = f'links_chunk_{index + 1}'
        commands.append({
            "command": "addWorksheet",
            "args": {"title": tab_name, "rows": len(chunk), "cols": 1}
        })
        row_commands = [{"command": "setRowData", "args": {"worksheetTitle": tab_name, "row": i+1, "values": [link]}} for i, link in enumerate(chunk)]
        commands.extend(row_commands)

    with open('commands.json', 'w') as file:
        json.dump(commands, file)
    print(f"::set-output name=commands::$(cat commands.json)")

if __name__ == "__main__":
    main()
