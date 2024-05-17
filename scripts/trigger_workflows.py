from github import Github
import os
import math
import json
import time
import requests

def trigger_workflow(repo_name, google_sheet_id, tab_name, token):
    """Trigger a GitHub repository dispatch event using HTTP requests."""
    print(f'Triggering: {repo_name} with sheet ID: {google_sheet_id} and tab: {tab_name}')

    url = f"https://api.github.com/repos/{repo_name}/dispatches"

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }

    payload = {
        "event_type": "run-multiple-repos",
        "client_payload": {
            "google_sheet_id": google_sheet_id,
            "links_worksheetTitle": tab_name
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 204:
        print(f"Dispatch event successfully triggered for {repo_name}.")
    else:
        print(f"Failed to trigger dispatch event: {response.status_code} - {response.text}")


def main():
    with open('github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        repoNamesList = repoNames.split()
        print('repos:\n', repoNamesList)

    token = os.getenv('GITHUB_TOKEN')
    google_sheet_id = os.getenv('GOOGLE_SHEET_ID')
    chunk_count = os.getenv('CHUNK_COUNT')
    num_repos = len(repoNamesList)

    # interate over all chunks and distribute them among repos
    latestRepoIndex = 0
    for j in range(int(chunk_count)):
        tab_name = f'links_chunk_{j + 1}'
        repo_name = repoNamesList[latestRepoIndex]

        trigger_workflow(repo_name, google_sheet_id, tab_name, token)
        latestRepoIndex = (latestRepoIndex + 1) % num_repos

        if j < int(chunk_count) - 1:  # Avoid sleeping after the last iteration
            time.sleep(15)

if __name__ == "__main__":
    main()
