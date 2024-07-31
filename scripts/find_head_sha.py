import os
import pygsheets
import requests
import time

def authenticate_gsheets():
    gc = pygsheets.authorize(service_account_env_var='GOOGLE_CREDENTIALS')
    return gc

def get_github_sha(repo_link, retries=15, wait=30):
    try_count = 0
    while try_count < retries:
        try:
            api_url = f"https://api.github.com/repos/{repo_link.split('github.com/')[1]}/commits"
            response = requests.get(api_url)
            response.raise_for_status()  # Raise an error for bad responses
            sha = response.json()[0]['sha']
            print(f'Fetched SHA for {api_url}:{sha}')
            return sha
        except requests.RequestException as e:
            if response.status_code == 403 and 'rate limit exceeded' in str(e).lower():
                print(f"Rate limit exceeded for {repo_link}. Retrying in {wait} seconds...")
                time.sleep(wait)
                try_count += 1
            else:
                print(f"Failed to fetch SHA for {repo_link}: {e}")
                return None
    print(f"Exceeded maximum retries for {repo_link}")
    return None

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
    repo_count = len(repo_links)

    sha_values = []
    cur_repo_index = 1
    for repo_link in repo_links:
        print(f'Processing {cur_repo_index}/{repo_count}')
        sha_values.append(get_github_sha(repo_link))
        cur_repo_index = cur_repo_index + 1

    update_google_sheet_in_bulk(gc, sheet_id, sha_values)

if __name__ == "__main__":
    main()
