#!/bin/bash

# Define the ranges for algo, instance_count, event_count, and raises_violation
algorithms=("D" "C+" "C" "B") # removed "A" because I want to test the other algorithms
#instance_counts=(1 25 50 75 100)
instance_counts=(1000)
#event_counts=(5 100 500 750 1000)
event_counts=(500)
violations=("True" "False")

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo,instance_count,event_count,raises_violation,time"

echo "$header" > "$output_file"

# Iterate over all algorithms

    # Iterate over all combinations of instance_count, event_count, and raises_violation
for instance in "${instance_counts[@]}"; do
    for event in "${event_counts[@]}"; do
        for violation in "${violations[@]}"; do
            for algo in "${algorithms[@]}"; do
                echo Running: $algo $instance $event $violation
                # Run the Python script and capture the output
                output=$(python3 ./fake_spec.py "$algo" "$instance" "$event" "$violation")
                
                # Extract the time from the output
                time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
                echo "  Time: $time"
                
                # Add the time to the current row
                row="$algo,$instance,$event,$violation,$time"
                echo "$row" >> "$output_file"
            done
        done
    done    
done
