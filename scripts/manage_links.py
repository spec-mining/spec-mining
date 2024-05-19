import json
import math
import os
import pygsheets

def calculate_chunk_size(total_links, num_repositories):
    # Start by checking max possible chunk size
    for size in range(256, 39, -1):  # from 256 down to 40
        if total_links / size >= num_repositories:
            return size
    return 40  # Minimum size if no ideal size found within range

def authenticate_gsheets():
    # Authenticate using service account credentials from an environment variable or a file
    gc = pygsheets.authorize(service_account_env_var='GOOGLE_CREDENTIALS')  # Ensure GOOGLE_CREDENTIALS is set in your env
    return gc

def prepare_chunks(links, repos, prefix, gc, sheet_id):
    num_repos = len(repos)
    chunk_size = calculate_chunk_size(links, num_repos)

    # Create chunks
    chunks = [links[i:i + chunk_size] for i in range(0, links, chunk_size)]

    add_data_to_sheet(gc, sheet_id, prefix, chunks)

    return len(chunks)

def add_data_to_sheet(gc, sheet_id, prefix, chunks):
    sheet = gc.open_by_key(sheet_id)
    for index, chunk in enumerate(chunks):
        tab_name = f'{prefix}{index + 1}'
        try:
            # Try to get the worksheet if it exists
            wks = sheet.worksheet_by_title(tab_name)
        except pygsheets.WorksheetNotFound:
            # If it does not exist, create a new one
            wks = sheet.add_worksheet(title=tab_name, rows=len(chunk), cols=1)
            # If a new worksheet is created, resize it if the chunk is smaller than the default number of rows
            if len(chunk) < 1000:  # Default number of rows is typically 1000
                wks.rows = len(chunk)

        # Prepare the range to be updated
        cell_range = f'A1:A{len(chunk)}'
        values = [[link] for link in chunk]  # Format the links as a list of lists for the update_cells method

        # Perform a batch update
        wks.update_values(crange=cell_range, values=values)

def main():
    with open('links.json', 'r') as file:
        data = file.read()
        links = json.loads(data)
        print('links:\n', links)
    
    with open('pro_github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        proRepoNamesList = repoNames.split()
        print('pro repos:\n', proRepoNamesList)
    
    with open('regular_github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        regularRepoNamesList = repoNames.split()
        print('regular repos:\n', regularRepoNamesList)

    # Authenticate and write to Google Sheets
    gc = authenticate_gsheets()
    sheet_id = os.getenv('GOOGLE_SHEET_ID')  # Ensure GOOGLE_SHEET_ID is set in your env

    pro_repo_count = len(proRepoNamesList)
    reg_repo_count = len(regularRepoNamesList)

    total_concurrency = pro_repo_count * 4 + reg_repo_count
    links_per_concurrent_job = len(links) / total_concurrency

    num_links_for_pro = math.ceil(links_per_concurrent_job * pro_repo_count * 4)
    links_for_pro = links[:num_links_for_pro]
    links_for_regular = links[num_links_for_pro:]

    pro_chunks = prepare_chunks(links_for_pro, proRepoNamesList, 'pro_links_chunk_', gc, sheet_id)
    regular_chunks = prepare_chunks(links_for_regular, regularRepoNamesList, 'reg_links_chunk_',gc, sheet_id)

    # Output the number of chunks to be used in later steps
    print(f"::set-output name=pro_chunk_count::{len(pro_chunks)}")
    print(f"::set-output name=reg_chunk_count::{len(regular_chunk_size)}")

if __name__ == "__main__":
    main()
