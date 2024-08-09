#!/bin/bash
if [ -z "$1" ]
  then
    echo "No argument supplied"
    echo "Usage: ./run-mop-new.sh <path-to-project> <algos> <extra-args>"
    exit 1
fi

call_pymop(){
    algo="$1"
    folder="$2"
    report="$3"
    shift 3
    extra_args="$@"

    echo ============= Specs being used are =============
    ls -al "$PWD"/../mop-with-dynapt/specs-new/
    echo ================================================ 
    
    echo "--->Running MOP for $folder with algo $algo and extra args $extra_args"

    #run and print this command
    set -x
    export PYTHONIOENCODING=utf8
    timeout 14400 pytest -v -p pythonmop  -rA  --path="$PWD"/../mop-with-dynapt/specs-new/ --algo $algo --memray --trace-python-allocators --most-allocations=0 --memray-bin-path=$report/MEM_$algo \
    --continue-on-collection-errors --json-report --json-report-indent=2 --statistics --statistics_file="$algo".json $extra_args &> $report/pymop_$algo.out
    # if process stop by timeout, then print timeout
    if [ $? -eq 124 ]; then
        echo "PROJECT TIMEOUT: ALGO_$algo" > $report/TIMEOUT-pymop_$algo.out
    fi
    set +x
    
    ls -l

    mv .report.json $report/$algo.report.json
    mv "$algo"-full.json $report/$algo-full.json
    mv "$algo"-violations.json $report/$algo-violations.json
    mv "$algo"-time.json $report/$algo-time.json

    gzip -f $report/$algo.report.json $report/pymop_$algo.out
}

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
report_folder=$HERE/reports
mkdir -p $report_folder

project_dir="$1"
algos="$2"
shift 2
extra_args="$@"

# Remove trailing slash if present
project_dir=${project_dir%*/}
echo "Running MOP for $project_dir"

report="$report_folder/$project_dir"
mkdir -p $report


cd "$project_dir" || exit
# Navigate into the folder

# add git infos:
sha=$(git rev-parse HEAD | cut -c1-7)
url=$(git remote get-url origin)
echo "sha-commit,$sha" > $report/project_info.out
echo "project-url,$url" >> $report/project_info.out

rm -f .pymon
source env/bin/activate

# Convert algos string into an array
IFS=',' read -r -a algo_array <<< "$algos"

# Iterate over the array using a for loop
for algo in "${algo_array[@]}"; do
    echo "----------"
    echo "Current algo: $algo"
    call_pymop $algo $project_dir $report $extra_args
done

deactivate

ls -l $report

echo "--->END"
