#!/bin/bash
set -x

# check if the user has provided a URL
if [ -z "$1" ]; then
    echo "Please provide a URL to the git repository"
    exit 1
fi

# Clone project and create environment
url=$1
git clone --depth=5 $url
folder=$(basename $url .git)

# Navigate to project directory
cd $folder || exit

# Create and activate virtual environment
python3 -m venv env
source env/bin/activate

# Install dependencies
pip3 install .[dev,test]

# Install additional requirements if available
for file in requirements.txt requirements-dev.txt requirements-test.txt dev-requirements.txt; do
    if [ -f "$file" ]; then
        pip3 install -r "$file"
    fi
done

pip3 install pytest-json-report pytest-monitor

# Install pythonmop (assuming it's in a sibling directory named 'mop-with-dynapt')
cd ../mop-with-dynapt || exit
pip3 install .
sudo apt-get install python3-tk -y
cd -
deactivate