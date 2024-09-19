#!/bin/bash

# Define the ranges for algo, instance_count, and event_count
# get the following from command line args
# Parse command-line arguments
IFS=' ' read -r -a algorithms <<< "$1"
IFS=' ' read -r -a instance_counts <<< "$2"
IFS=' ' read -r -a event_counts <<< "$3"
IFS=' ' read -r -a creation_event_percents <<< "$4"
IFS=' ' read -r -a enable_event_percents <<< "$5"
IFS=' ' read -r -a python_file <<< "$6"

# Set default values
default_algorithms="A B C C+ D"
default_instance_counts="10 50 100"
default_event_counts="10 20 30"
default_creation_event_percents="100 50 0"
default_enable_event_percents="100 50 0"
default_python_file="FakeSpec.py"

# Use default values if arguments are not provided
algorithms=${1:-$default_algorithms}
instance_counts=${2:-$default_instance_counts}
event_counts=${3:-$default_event_counts}
creation_event_percents=${4:-$default_creation_event_percents}
enable_event_percents=${5:-$default_enable_event_percents}
python_file=${6:-$default_python_file}

# Convert string arguments to arrays
IFS=' ' read -r -a algorithms <<< "$algorithms"
IFS=' ' read -r -a instance_counts <<< "$instance_counts"
IFS=' ' read -r -a event_counts <<< "$event_counts"
IFS=' ' read -r -a creation_event_percents <<< "$creation_event_percents"
IFS=' ' read -r -a enable_event_percents <<< "$enable_event_percents"

echo "Using the following parameters:"
echo "Algorithms: ${algorithms[*]}"
echo "Instance counts: ${instance_counts[*]}"
echo "Event counts: ${event_counts[*]}"
echo "Creation event percentages: ${creation_event_percents[*]}"
echo "Enable event percentages: ${enable_event_percents[*]}"
echo "Python file: $python_file"

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo,instance_count,requested_event_count,creation_event_percent,enable_event_percent,registered_event_count,monitor_count,time"

echo "$header" > "$output_file"
echo $header

# Iterate over all combinations of instance_count, event_count, and algo
for instance in "${instance_counts[@]}"; do
    for event in "${event_counts[@]}"; do
        for creation_event_percent in "${creation_event_percents[@]}"; do
            for enable_event_percent in "${enable_event_percents[@]}"; do
                for algo in "${algorithms[@]}"; do
                    # echo Running: $algo $instance $event
                    # Run the Python script and capture the output
                    output=$(python3 ./"$python_file" "$algo" "$instance" "$event" "$creation_event_percent" "$enable_event_percent")
                    
                    # Extract the time from the output
                    time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
                    registered_event_count=$(echo "$output" | grep -oP 'Registered Event count:\s*\K[\d.]+')
                    monitor_count=$(echo "$output" | grep -oP 'Monitor Count:\s*\K[\d.]+')

                    # print full output
                    # echo "$output"
                    
                    # Add the time to the current row
                    row="$algo,$instance,$event,$creation_event_percent,$enable_event_percent,$registered_event_count,$monitor_count,$time"
                    echo "$row" >> "$output_file"
                    echo $row

                    # delete the trace file named trace_......txt
                    rm -f ./trace_*.txt
                done
            done
        done
    done    
done
