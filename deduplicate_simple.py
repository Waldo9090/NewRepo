FFFFFF

FF
F
FF

FF#!/usr/bin/env python3

import csv
import sys

def deduplicate_leads():
    try:
        # Read leads.csv to get existing emails and LinkedIn URLs
        leads_emails = set()
        leads_linkedin = set()
        
        print("Reading leads.csv...")
        with open('leads.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('Email'):
                    leads_emails.add(row['Email'].lower().strip())
                if row.get('linkedIn'):
                    leads_linkedin.add(row['linkedIn'].lower().strip())
        
        print(f"Found {len(leads_emails)} emails and {len(leads_linkedin)} LinkedIn URLs in leads.csv")
        
        # Read newRoger.csv and filter out duplicates
        print("Processing newRoger.csv...")
        filtered_rows = []
        duplicates_count = 0
        total_count = 0
        
        with open('newRoger.csv', 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            
            for row in reader:
                total_count += 1
                is_duplicate = False
                
                # Check email match
                if row.get('email') and row['email'].lower().strip() in leads_emails:
                    is_duplicate = True
                
                # Check LinkedIn match
                if row.get('linkedinUrl') and row['linkedinUrl'].lower().strip() in leads_linkedin:
                    is_duplicate = True
                
                if not is_duplicate:
                    filtered_rows.append(row)
                else:
                    duplicates_count += 1
        
        print(f"Original records: {total_count}")
        print(f"Duplicates removed: {duplicates_count}")
        print(f"Remaining records: {len(filtered_rows)}")
        
        # Write filtered data back to newRoger.csv
        with open('newRoger.csv', 'w', encoding='utf-8', newline='') as f:
            if filtered_rows:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(filtered_rows)
        
        print("newRoger.csv updated successfully!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = deduplicate_leads()
    sys.exit(0 if success else 1)