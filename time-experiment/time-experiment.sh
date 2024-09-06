#!/bin/bash

# Define the ranges for algo, instance_count, event_count, and raises_violation
algorithms=("A" "B" "C" "C+" "D")
# instance_counts=(1 100 500 1000 5000)
instance_counts=(1 100)
# event_counts=(5 500 2500 5000 25000)
event_counts=(5 500)
violations=("True" "False")

# Create the CSV file and write the header row
output_file="time-experiment-results.csv"
header="algo"
for instance in "${instance_counts[@]}"; do
    for event in "${event_counts[@]}"; do
        for violation in "${violations[@]}"; do
            header+=",${instance}_${event}_${violation}"
        done
    done
done
echo "$header" > "$output_file"

# Iterate over all algorithms
for algo in "${algorithms[@]}"; do
    row="$algo"
    
    # Iterate over all combinations of instance_count, event_count, and raises_violation
    for instance in "${instance_counts[@]}"; do
        for event in "${event_counts[@]}"; do
            for violation in "${violations[@]}"; do
                
                # Run the Python script and capture the output
                output=$(python3 ./fake_spec.py "$algo" "$instance" "$event" "$violation")
                
                # Extract the time from the output
                time=$(echo "$output" | grep -oP 'Time:\s*\K[\d.]+')
                
                # Add the time to the current row
                row+=",$time"
            done
        done
    done
    
    # Write the row to the CSV file
    echo "$row" >> "$output_file"
done
