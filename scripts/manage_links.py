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

def add_data_to_sheet(gc, sheet_id, chunks):
    sheet = gc.open_by_key(sheet_id)
    for index, chunk in enumerate(chunks):
        tab_name = f'links_chunk_{index + 1}'
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
    
    with open('github_repos.txt') as repoFile:
        repoNames = repoFile.read()
        repoNamesList = repoNames.split()
        print('repos:\n', repoNamesList)

    num_repositories = len(repoNamesList)
    total_links = len(links)
    chunk_size = calculate_chunk_size(total_links, num_repositories)

    # Create chunks
    chunks = [links[i:i + chunk_size] for i in range(0, total_links, chunk_size)]

    # Authenticate and write to Google Sheets
    gc = authenticate_gsheets()
    sheet_id = os.getenv('GOOGLE_SHEET_ID')  # Ensure GOOGLE_SHEET_ID is set in your env
    add_data_to_sheet(gc, sheet_id, chunks)

    # Output the number of chunks to be used in later steps
    print(f"::set-output name=chunk_count::{len(chunks)}")

if __name__ == "__main__":
    main()
