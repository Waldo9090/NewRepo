#!/usr/bin/env python3
import csv
import re

def split_name(full_name):
    """Split a full name into first name and last name."""
    # Remove common business suffixes and clean up
    name = full_name.strip()
    
    # Handle team/group/business names - return as is for first name, empty last name
    business_indicators = [
        'team', 'group', 'homes', 'realty', 'properties', 'collective', 
        'residential', 'luxury', 'real estate', 'lifestyle', 'logic',
        'compass', 'haven', 'horizon', 'elevated', 'cosmopolitan',
        'britannia', 'steele', 'sagebird', 'sage', 'torelli',
        'mandile lorimer', 'awad realty', 'avant residential',
        'hersey home', 'highview', 'linda takenaka', 'linda wells',
        'tom hughes', 'tommy pennington'
    ]
    
    name_lower = name.lower()
    for indicator in business_indicators:
        if indicator in name_lower:
            return name, ""
    
    # Handle names with titles/suffixes
    name = re.sub(r'\s+(jr\.?|sr\.?|ii|iii|iv|md|phd|pa)$', '', name, flags=re.IGNORECASE)
    
    # Split by whitespace
    parts = name.split()
    
    if len(parts) == 0:
        return "", ""
    elif len(parts) == 1:
        return parts[0], ""
    elif len(parts) == 2:
        return parts[0], parts[1]
    else:
        # For names with 3+ parts, first word is first name, rest is last name
        first_name = parts[0]
        last_name = " ".join(parts[1:])
        
        # Handle special cases like "Mary Ann Burke" - if second word looks like part of first name
        common_compound_first_names = [
            'mary ann', 'jean', 'lou', 'jo', 'sue', 'lynn', 'rose', 
            'marie', 'anne', 'lee', 'ray', 'joe', 'tom', 'jim', 'bob'
        ]
        
        first_two = f"{parts[0]} {parts[1]}".lower()
        if first_two in common_compound_first_names:
            first_name = f"{parts[0]} {parts[1]}"
            last_name = " ".join(parts[2:]) if len(parts) > 2 else ""
        
        return first_name, last_name

def process_csv():
    input_file = 'compass_agents_florida_complete.csv'
    output_file = 'compass_agents_with_split_names.csv'
    
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        # Read header
        header = next(reader)
        
        # Write new header with split names
        new_header = ['First Name', 'Last Name', 'Phone', 'Email', 'Title', 'Location']
        writer.writerow(new_header)
        
        # Process each row
        for row in reader:
            if len(row) >= 5:  # Ensure we have all columns
                full_name = row[0]
                first_name, last_name = split_name(full_name)
                
                # Write new row with split names
                new_row = [first_name, last_name, row[1], row[2], row[3], row[4]]
                writer.writerow(new_row)
    
    print(f"Processing complete! Output written to {output_file}")
    print(f"Original Name column split into First Name and Last Name columns")

if __name__ == "__main__":
    process_csv()
