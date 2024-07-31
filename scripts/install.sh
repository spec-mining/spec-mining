#!/bin/bash
set -x

# check if the user has provided a URL
if [ -z "$1" ]; then
    echo "Please provide a URL to the git repository"
    exit 1
fi

# Clone project and create environment

# Argument containing the link and SHA
input=$1

# Split the input into link and sha
IFS=':' read -r url target_sha <<< "$input"

# Output the url
echo "Url: $url"

git clone --depth=5 $url
folder=$(basename $url .git)

# Navigate to project directory
cd $folder || exit

# If sha is not empty, attempt to checkout the sha
if [ -n "$target_sha" ]; then
  echo "SHA exists: $target_sha"
  # Assuming you have already cloned the repo and are in the repo directory
  git checkout "$target_sha"
else
  echo "SHA is empty, no checkout performed."
fi

sha=$(git rev-parse HEAD | cut -c1-7)
echo "current sha commit: $sha"
echo "project url: $url"

# Create and activate virtual environment
python3 -m venv env
source env/bin/activate

# Install dependencies
pip3 install .[dev,test,tests,testing]

# Install additional requirements if available
for file in *.txt; do
    if [ -f "$file" ]; then
        pip3 install -r "$file"
    fi
done

#pip3 install pytest-json-report pytest-monitor pytest-cov pytest-env pytest-rerunfailures pytest-socket pytest-django
pip3 install pytest-json-report memray pytest-memray pytest-cov pytest-env pytest-rerunfailures pytest-socket pytest-django

# Install pythonmop (assuming it's in a sibling directory named 'mop-with-dynapt')
cd ../mop-with-dynapt || exit
pip3 install .
sudo apt-get install python3-tk -y
cd -
deactivate