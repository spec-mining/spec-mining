import json
import math
import os

def calculate_chunk_size(total_links, num_repositories):
    # Start by checking max possible chunk size
    for size in range(256, 39, -1):  # from 256 down to 40
        if total_links / size >= num_repositories:
            return size
    return 40  # Minimum size if no ideal size found within range

def main():
    with open('links.json', 'r') as file:
        data = file.read()
        links = json.loads(data)
        print('links:\n', links)
    
    with open('github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        repoNamesList = repoNames.split()
        print('repos:\n', repoNamesList)

    num_repositories = len(repoNamesList)
    total_links = len(links)
    chunk_size = calculate_chunk_size(total_links, num_repositories)


    # Calculate the number of chunks each repository should get
    total_chunks = math.ceil(total_links / chunk_size)
    chunks_per_repo = math.ceil(total_chunks / num_repositories)

    # Create chunks
    chunks = [links[i:i + chunk_size] for i in range(0, total_links, chunk_size)]
    commands = []
    
    for index, chunk in enumerate(chunks):
        tab_name = f'links_chunk_{index + 1}'
        commands.append({
            "command": "addWorksheet",
            "args": {"title": tab_name, "rows": len(chunk), "cols": 1}
        })
        row_commands = [{"command": "setRowData", "args": {"worksheetTitle": tab_name, "row": i+1, "values": [link]}} for i, link in enumerate(chunk)]
        commands.extend(row_commands)

    # Save commands to JSON file
    with open('commands.json', 'w') as file:
        json.dump(commands, file)

    commandsString = json.dumps(commands)

    print(f"::set-output name=commands::{commandsString}")

if __name__ == "__main__":
    main()
