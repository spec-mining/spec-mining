import json
import math
import os
import pygsheets

def calculate_chunk_size(total_links, num_repositories, min):
    # Start by checking max possible chunk size
    for size in range(256, 39, -1):  # from 256 down to 40
        if total_links / size >= num_repositories:
            return size
    return min  # Minimum size if no ideal size found within range

def authenticate_gsheets():
    # Authenticate using service account credentials from an environment variable or a file
    gc = pygsheets.authorize(service_account_env_var='GOOGLE_CREDENTIALS')  # Ensure GOOGLE_CREDENTIALS is set in your env
    return gc

def prepare_chunks(link_sha_tuples, repos, isPro, gc, sheet_id):
    num_repos = len(repos)

    if (isPro):
        prefix = 'pro_links_chunk_'
        min = 6 # each link corresponds to 6 jobs, so 40/6
    else:
        prefix = 'reg_links_chunk_'
        min = 3 # each link corresponds to 6 jobs, so 20/6

    chunk_size = calculate_chunk_size(len(link_sha_tuples), num_repos, min)

    # Create chunks
    chunks = [link_sha_tuples[i:i + chunk_size] for i in range(0, len(link_sha_tuples), chunk_size)]

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
            wks = sheet.add_worksheet(title=tab_name, rows=len(chunk), cols=2)
            # If a new worksheet is created, resize it if the chunk is smaller than the default number of rows
            if len(chunk) < 1000:  # Default number of rows is typically 1000
                wks.rows = len(chunk)

        links = [chunk[i][0] for i, _ in enumerate(chunk)]
        shas = [chunk[i][1] for i, _ in enumerate(chunk)]

        # ======= write the links =========
        # Prepare the range to be updated
        cell_range = f'A1:A{len(links)}'
        values = [[link] for link in links]  # Format the links as a list of lists for the update_cells method
        # Perform a batch update
        wks.update_values(crange=cell_range, values=values)

        # ======= write the shas ========
        cell_range2 = f'B1:B{len(shas)}'
        values2 = [[sha] for sha in shas]
        wks.update_values(crange=cell_range2, values=values2)

def main():
    # Authenticate and write to Google Sheets
    gc = authenticate_gsheets()
    sheet_id = os.getenv('GOOGLE_SHEET_ID')  # Ensure GOOGLE_SHEET_ID is set in your env
    links_tab_name = os.getenv('LINKS_TAB_NAME') # Ensure LINKS_TAB_NAME is set in your env

    with open('pro_github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        proRepoNamesList = repoNames.split()
        print('pro repos:\n', proRepoNamesList)
    
    with open('regular_github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        regularRepoNamesList = repoNames.split()
        print('regular repos:\n', regularRepoNamesList)

    sheet = gc.open_by_key(sheet_id)

    print('the sheet: ', sheet)
    print('the tab name: ', links_tab_name)

    wks = sheet.worksheet_by_title(links_tab_name)

    print('wks: ', wks)
    
    repo_links = wks.get_col(1, include_tailing_empty=False)
    repo_shas = wks.get_col(2, include_tailing_empty=False)

    link_sha_tuples = []

    for idx, link in enumerate(repo_links):
        sha = repo_shas[idx]
        link_sha_tuples.append((link, sha))

    pro_repo_count = len(proRepoNamesList)
    reg_repo_count = len(regularRepoNamesList)

    total_concurrency = pro_repo_count * 3 + reg_repo_count
    links_per_concurrent_job = len(link_sha_tuples) / total_concurrency

    num_links_for_pro = math.ceil(links_per_concurrent_job * pro_repo_count * 3)
    link_sha_tuples_for_pro = link_sha_tuples[:num_links_for_pro]
    link_sha_tuples_for_regular = link_sha_tuples[num_links_for_pro:]

    pro_chunks = prepare_chunks(link_sha_tuples_for_pro, proRepoNamesList, True, gc, sheet_id)
    regular_chunks = prepare_chunks(link_sha_tuples_for_regular, regularRepoNamesList, False,gc, sheet_id)

    # Output the number of chunks to be used in later steps
    print(f"::set-output name=pro_chunk_count::{pro_chunks}")
    print(f"::set-output name=reg_chunk_count::{regular_chunks}")

if __name__ == "__main__":
    main()
