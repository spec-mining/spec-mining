#!/bin/bash

# Define an array of manifest file types
declare -a manifest_files=('*.txt' '*.ini' 'tox.ini')

# Flag file to track if TensorFlow is found
flag_file="tf_found.flag"

# Cleanup flag file at the start
rm -f "$flag_file"

# This function searches for TensorFlow in a given file
search_tensorflow() {
  local file=$1
  if grep -iq "tensorflow" "$file"; then
    echo "TensorFlow found in $file"
    # Touch a file to mark that TensorFlow was found
    touch "$flag_file"
  fi
}

export -f search_tensorflow
export flag_file

# Find and process manifest files, excluding directories named 'env'
find . -type d -name env -prune -o -type d -print -exec bash -c 'echo Searching in directory: "$0"' {} \; -o -type f \( $(printf -- "-name %s -o " "${manifest_files[@]}" | sed 's/-o $//') \) -exec bash -c 'search_tensorflow "$0"' {} \;

# Check if TensorFlow was never found
if [ ! -f "$flag_file" ]; then
  echo "TensorFlow not found anywhere, removing TfFunction_NoSideEffect"
  ls ../mop-with-dynapt/specs-new/
  rm ../mop-with-dynapt/specs-new/TfFunction_NoSideEffect.py
  ls ../mop-with-dynapt/specs-new/
fi

# Cleanup flag file at the end
rm -f "$flag_file"
