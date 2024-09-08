#!/bin/bash

# Define the ranges for algo, instance_count, and event_count
algorithms=("A" "B" "C" "C+" "D")
instance_counts=(1 50 100 200 400 800 1600 3200 6400)
event_counts=(5 100 500 750 1000)

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo,instance_count,event_count,time"

echo "$header" > "$output_file"

# Iterate over all combinations of instance_count, event_count, and algo
for instance in "${instance_counts[@]}"; do
    for event in "${event_counts[@]}"; do
        for algo in "${algorithms[@]}"; do
            echo Running: $algo $instance $event
            # Run the Python script and capture the output
            output=$(python3 ./fake_spec.py "$algo" "$instance" "$event")
            
            # Extract the time from the output
            time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
            echo "  Time: $time"
            
            # Add the time to the current row
            row="$algo,$instance,$event,$time"
            echo "$row" >> "$output_file"
        done
    done    
done