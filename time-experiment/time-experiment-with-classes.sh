#!/bin/bash

# Define the ranges for algo, instance_count, event_count, and class_count
algorithms=("B" "C" "C+" "D") # removed "A" because I want to test the other algorithms
class_counts=(1 10 20 40)
instance_counts=(1 25 50)
event_counts=(5 100 250)

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo,class_count,instance_count,event_count,time"

echo "$header" > "$output_file"

# Iterate over all algorithms

    # Iterate over all combinations of instance_count, event_count, and class_count
for class_count in "${class_counts[@]}"; do
    for instance in "${instance_counts[@]}"; do
        for event in "${event_counts[@]}"; do
            for algo in "${algorithms[@]}"; do
                echo Running: $algo $class_count $instance $event
                # Run the Python script and capture the output
                output=$(python3 ./fake_spec.py "$algo" "$class_count" "$instance" "$event")
                
                # Extract the time from the output
                time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
                echo "  Time: $time"
                
                # Add the time to the current row
                row="$algo,$class_count,$instance,$event,$time"
                echo "$row" >> "$output_file"
            done
        done
    done    
done