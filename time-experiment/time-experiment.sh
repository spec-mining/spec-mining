#!/bin/bash

# Define the ranges for algo, instance_count, and event_count
algorithms=("B" "C" "C+" "D")
instance_counts=(8192 16384)
event_counts=(50 100)
creation_event_percents=(100 50 10 0)
enable_event_percents=(100 50 10 0)

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo,instance_count,requested_event_count,creation_event_percent,enable_event_percent,registered_event_count,monitor_count,time"

echo "$header" > "$output_file"

# Iterate over all combinations of instance_count, event_count, and algo
for instance in "${instance_counts[@]}"; do
    for event in "${event_counts[@]}"; do
        for creation_event_percent in "${creation_event_percents[@]}"; do
            for enable_event_percent in "${enable_event_percents[@]}"; do
                for algo in "${algorithms[@]}"; do
                    # echo Running: $algo $instance $event
                    # Run the Python script and capture the output
                    output=$(python3 ./fake_spec_3.py "$algo" "$instance" "$event" "$creation_event_percent" "$enable_event_percent")
                    
                    # Extract the time from the output
                    time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
                    registered_event_count=$(echo "$output" | grep -oP 'Registered Event count:\s*\K[\d.]+')
                    monitor_count=$(echo "$output" | grep -oP 'Monitor Count:\s*\K[\d.]+')

                    # print full output
                    echo "$output"
                    
                    # Add the time to the current row
                    row="$algo,$instance,$event,$creation_event_percent,$enable_event_percent,$registered_event_count,$monitor_count,$time"
                    echo "$row" >> "$output_file"

                    # delete the trace file named trace_......txt
                    rm -f ./trace_*.txt
                done
            done
        done
    done    
done
