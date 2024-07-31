import os
import pygsheets
import requests

def authenticate_gsheets():
    gc = pygsheets.authorize(service_account_env_var='GOOGLE_CREDENTIALS')
    return gc

def get_github_sha(repo_link):
    try:
        api_url = f"https://api.github.com/repos/{repo_link.split('github.com/')[1]}/commits"
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an error for bad responses
        sha = response.json()[0]['sha']
        return sha
    except requests.RequestException as e:
        print(f"Failed to fetch SHA for {repo_link}: {e}")
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
    sha_values = [get_github_sha(repo_link) for repo_link in repo_links]

    update_google_sheet_in_bulk(gc, sheet_id, sha_values)

if __name__ == "__main__":
    main()
