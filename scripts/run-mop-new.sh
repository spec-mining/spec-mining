#!/bin/bash
if [ -z "$1" ]
  then
    echo "No argument supplied"
    echo "Usage: ./run-mop-new.sh <path-to-project> <extra-args>"
    exit 1
fi

call_pymop(){
    algo="$1"
    folder="$2"
    report="$3"
    shift 3
    extra_args="$@"
    
    echo "--->Running MOP for $folder with algo $algo and extra args $extra_args"

    #run and print this command
    set -x
    timeout 10800 pytest -p pythonmop -p monitor -rA  --path=/projects/mop-with-dynapt/specs-new/ --algo $algo \
    --continue-on-collection-errors --json-report --json-report-indent=2  --description ALGO_$algo --statistics --statistics_file="$algo".json $extra_args &> $report/pymop_$algo.out
    # if process stop by timeout, then print timeout
    if [ $? -eq 124 ]; then
        echo "PROJECT TIMEOUT: ALGO_$algo" > $report/TIMEOUT-pymop_$algo.out
    fi
    set +x
    

    mv .report.json $report/$algo.report.json
    mv "$algo"-full.json $report/$algo-full.json
    mv "$algo"-violations.json $report/$algo-violations.json


    gzip -f $report/$algo.report.json $report/pymop_$algo.out

}

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
report_folder=$HERE/reports
mkdir -p $report_folder

project_dir="$1"
shift 1
extra_args="$@"
project_dir=${project_dir%*/}
echo "Running MOP for $project_dir"

report="$report_folder/$project_dir"
mkdir -p $report


cd "$project_dir" || exit
# Navigate into the folder
rm -f .pymon
source env/bin/activate

#algos=("ORIGINAL" "A" "B" "C" "C+" "D")
#algos=("B")
algos=("ORIGINAL" "D")

# Iterate over the strings using a for loop
for algo in "${algos[@]}"; do
    echo "----------"
    echo "Current algo: $algo"
    call_pymop $algo $project_dir $report $extra_args
done

cp .pymon $report/db.pymon
gzip $report/db.pymon
deactivate


echo "--->END"