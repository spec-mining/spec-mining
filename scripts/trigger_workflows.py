from github import Github
import os
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
    token = os.getenv('GITHUB_TOKEN')
    google_sheet_id = os.getenv('GOOGLE_SHEET_ID')
    repositories = os.getenv('GITHUB_REPOSITORIES').split()
    num_repos = len(repositories)
    num_chunks = math.ceil(len(links) / num_repos)

    for i, repo_name in enumerate(repositories):
        start_chunk = i * num_chunks
        end_chunk = start_chunk + num_chunks
        for j in range(start_chunk, min(end_chunk, len(chunks))):
            tab_name = f'links_chunk_{j + 1}'
            trigger_workflow(repo_name, google_sheet_id, tab_name, token)

if __name__ == "__main__":
    main()
