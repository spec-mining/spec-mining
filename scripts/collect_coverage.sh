#!/bin/bash

# Check if exactly one repository URL is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <testing-repo-url>"
    exit 1
fi

# Assign the command line argument to the testing repository variable
repo_url_with_sha="$1"

# Split the input into link and sha
IFS=';' read -r TESTING_REPO_URL target_sha <<< "$repo_url_with_sha"

# Output the url
echo "Url: $TESTING_REPO_URL"
echo "Sha: $target_sha"

# Extract the repository name from the URL
TESTING_REPO_NAME=$(basename -s .git "$TESTING_REPO_URL")

# Create a new directory name by appending _ORIGINAL to the repository name
CLONE_DIR="${TESTING_REPO_NAME}_ORIGINAL"

# Create the directory if it does not exist
mkdir -p "$CLONE_DIR"

# Navigate to the project directory
cd "$CLONE_DIR" || { echo "Failed to enter directory $CLONE_DIR"; exit 1; }

# Clone the testing repository
git clone --depth 1 "$TESTING_REPO_URL" || { echo "Failed to clone $TESTING_REPO_URL"; exit 1; }

# Navigate to the testing project directory
cd "$TESTING_REPO_NAME" || { echo "Failed to enter directory $TESTING_REPO_NAME"; exit 1; }

# If sha is not empty, attempt to checkout the sha
if [ -n "$target_sha" ]; then
  echo "SHA exists: $target_sha"
  # Assuming you have already cloned the repo and are in the repo directory
  git fetch --depth 1 origin "$target_sha"
  git checkout "$target_sha"
else
  echo "SHA is empty, no checkout performed."
fi

# Create a virtual environment in the project directory using Python's built-in venv
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Announce setup of testing repository
echo "Setting up testing repository..."

# Install additional requirements if available
for file in *.txt; do
    if [ -f "$file" ]; then
        pip install -r "$file"
    fi
done

# Install dependencies
pip install .[dev,test,tests,testing]

# Install pytest and a few common plugins
pip install pytest
pip3 install pytest-json-report pytest-cov pytest-env pytest-rerunfailures pytest-socket pytest-django

# Record the start time of the instrumentation process
START_TIME=$(python -c 'import time; print(time.time())')

# Run tests with pytest
coverage run --source=. --branch -m pytest --continue-on-collection-errors --json-report --json-report-indent=2 > coverage_out.txt
coverage json --pretty-print

# Record the end time and calculate the instrumentation duration
END_TIME=$(python -c 'import time; print(time.time())')
END_TO_END_TIME=$(python -c "print($END_TIME - $START_TIME)")
TEST_TIME=$END_TO_END_TIME

# Deactivate the virtual environment
deactivate

# delete venv folder
rm -rf ./venv

# Save the instrumentation time, test time, and results to a new file
RESULTS_FILE="../../results/original/${TESTING_REPO_NAME}_original_results.txt"
TIME_RESULTS_FILE="../../results/original/${TESTING_REPO_NAME}_ORIGINAL-time.json"

# Write the instrumentation and test times to the results file
echo "End to End Time: ${END_TO_END_TIME}s" > $RESULTS_FILE
echo "Test Time: ${TEST_TIME}s" >> $RESULTS_FILE
echo "{\"test_duration\": ${TEST_TIME}}" > $TIME_RESULTS_FILE

mv ./out_original.txt ../../results/original/out_original.txt
mv ./coverage_out.txt ../../results/original/coverage_out.txt
mv ./coverage.json ../../results/original/coverage.json

# Return to the initial script directory
cd - || exit
