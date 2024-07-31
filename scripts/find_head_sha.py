import os
import pygsheets
import requests
import time

def authenticate_gsheets():
    gc = pygsheets.authorize(service_account_env_var='GOOGLE_CREDENTIALS')
    return gc

def get_github_shas(repo_links, batch_size=50, retries=15, wait=30):
    github_token = os.getenv('GITHUB_TOKEN')
    headers = {'Authorization': f'bearer {github_token}'}
    
    def create_query(repos):
        query_parts = []
        for owner, name in repos:
            query_parts.append(f"""
                {name}: repository(owner: "{owner}", name: "{name}") {{
                    defaultBranchRef {{
                        target {{
                            oid
                        }}
                    }}
                }}
            """)
        query = "query {" + " ".join(query_parts) + "}"
        return query

    shas = {}
    for i in range(0, len(repo_links), batch_size):
        batch = repo_links[i:i + batch_size]
        repo_names = [link.split('github.com/')[1] for link in batch]
        repos = [tuple(repo.split('/')) for repo in repo_names]
        print(f'Processing repos {i}-{i+batch_size}/{len(repo_links)}')
        try_count = 0
        while try_count < retries:
            query = create_query(repos)
            print('Will query:\n', query)
            try:
                response = requests.post(
                    'https://api.github.com/graphql',
                    json={'query': query},
                    headers=headers
                )
                response.raise_for_status()

                data = response.json()
                print(f'Batch {i} response', data)

                for repo in repos:
                    name = repo[1]
                    repo_data = data['data'].get(name)
                    if repo_data:
                        sha = repo_data['defaultBranchRef']['target']['oid']
                        shas[f"{repo[0]}/{repo[1]}"] = sha
                break  # Break the retry loop if the request is successful

            except requests.RequestException as e:
                if response.status_code == 403 and 'rate limit exceeded' in str(e).lower():
                    print(f"Rate limit exceeded. Retrying in {wait} seconds...")
                    time.sleep(wait)
                    try_count += 1
                else:
                    print(f"Failed to fetch SHAs for batch {i // batch_size + 1}: {e}")
                    break


    return shas

def update_google_sheet_in_bulk(gc, sheet_id, sha_values):
    sheet = gc.open_by_key(sheet_id)
    wks = sheet.sheet1
    sha_values = [['' if sha is None else sha] for sha in sha_values]
    wks.update_values(crange=f'B1:B{len(sha_values)}', values=sha_values)

def main():
    gc = authenticate_gsheets()
    sheet_id = os.getenv('GOOGLE_SHEET_ID')
    sheet = gc.open_by_key(sheet_id)
    wks = sheet.sheet1
    
    repo_links = wks.get_col(1, include_tailing_empty=False)
    shas = get_github_shas(repo_links)

    sha_values = [shas.get(link.split('github.com/')[1], None) for link in repo_links]
    update_google_sheet_in_bulk(gc, sheet_id, sha_values)

if __name__ == "__main__":
    main()
