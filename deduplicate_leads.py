#!/usr/bin/env python3

import pandas as pd
import sys

def deduplicate_leads():
    try:
        # Read both CSV files
        print("Reading leads.csv...")
        leads_df = pd.read_csv('leads.csv')
        print(f"Found {len(leads_df)} records in leads.csv")
        
        print("Reading newRoger.csv...")
        new_roger_df = pd.read_csv('newRoger.csv')
        print(f"Found {len(new_roger_df)} records in newRoger.csv")
        
        # Extract unique identifiers from leads.csv
        leads_emails = set(leads_df['Email'].str.lower().dropna())
        leads_linkedin = set(leads_df['linkedIn'].str.lower().dropna())
        
        print(f"Found {len(leads_emails)} unique emails in leads.csv")
        print(f"Found {len(leads_linkedin)} unique LinkedIn URLs in leads.csv")
        
        # Function to check if a record from newRoger is a duplicate
        def is_duplicate(row):
            email_match = pd.notna(row['email']) and row['email'].lower() in leads_emails
            linkedin_match = pd.notna(row['linkedinUrl']) and row['linkedinUrl'].lower() in leads_linkedin
            return email_match or linkedin_match
        
        # Filter out duplicates from newRoger.csv
        print("Identifying duplicates...")
        original_count = len(new_roger_df)
        new_roger_filtered = new_roger_df[~new_roger_df.apply(is_duplicate, axis=1)]
        duplicates_removed = original_count - len(new_roger_filtered)
        
        print(f"Removed {duplicates_removed} duplicate records")
        print(f"Remaining records in newRoger.csv: {len(new_roger_filtered)}")
        
        # Save the filtered data back to newRoger.csv
        new_roger_filtered.to_csv('newRoger.csv', index=False)
        print("Updated newRoger.csv with deduplicated data")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = deduplicate_leads()
    sys.exit(0 if success else 1)