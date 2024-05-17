from github import Github
import os
import math
import json

def trigger_workflow(repo_name, google_sheet_id, tab_name, token):
    print(f'Triggering: {repo_name} {google_sheet_id} {tab_name}')
    # g = Github(token)
    # repo = g.get_repo(repo_name)
    # payload = {
    #     'google_sheet_id': google_sheet_id,
    #     'links_tab_name': tab_name
    # }
    # repo.create_dispatch_event(event_type='trigger-workflow-event', client_payload=payload)

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
    for chunk in range(int(chunk_count)):
        tab_name = f'links_chunk_{j + 1}'
        repo_name = repoNamesList[latestRepoIndex]
        trigger_workflow(repo_name, google_sheet_id, tab_name, token)
        latestRepoIndex = latestRepoIndex + 1 % num_repos

if __name__ == "__main__":
    main()
