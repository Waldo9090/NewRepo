import pandas as pd

# Read both CSV files
leads5_file = '/Users/adityamahna/Downloads/AnalyticsDashboard-67ac6c7c6f37b741115dbb7f828e81a4a06adda9 2/leads-5.csv'
modu_file = '/Users/adityamahna/Downloads/AnalyticsDashboard-67ac6c7c6f37b741115dbb7f828e81a4a06adda9 2/new modu/leads-4.csv'

df_leads5 = pd.read_csv(leads5_file)
df_modu = pd.read_csv(modu_file)

print(f"Leads-5.csv contains: {len(df_leads5)} leads")
print(f"New modu/leads-4.csv contains: {len(df_modu)} leads")
print()

# Find duplicates based on email addresses
leads5_emails = set(df_leads5['Email'].str.lower())
modu_emails = set(df_modu['Email'].str.lower())

duplicate_emails = leads5_emails.intersection(modu_emails)

print(f"Number of duplicate emails found: {len(duplicate_emails)}")
print()

if duplicate_emails:
    print("Duplicate emails found:")
    for email in sorted(duplicate_emails):
        print(f"  - {email}")
    
    # Create a detailed comparison showing the duplicate entries
    print("\nDetailed comparison of duplicate entries:")
    print("=" * 80)
    
    for email in sorted(duplicate_emails):
        print(f"\nEmail: {email}")
        print("-" * 40)
        
        # Find entry in leads-5
        leads5_entry = df_leads5[df_leads5['Email'].str.lower() == email].iloc[0]
        print(f"In leads-5.csv:")
        print(f"  Name: {leads5_entry['First Name']} {leads5_entry['Last Name']}")
        print(f"  Campaign: {leads5_entry['Campaign Name']}")
        print(f"  Status: {leads5_entry['Lead Status']}")
        
        # Find entry in modu
        modu_entry = df_modu[df_modu['Email'].str.lower() == email].iloc[0]
        print(f"In new modu/leads-4.csv:")
        print(f"  Name: {modu_entry['First Name']} {modu_entry['Last Name']}")
        print(f"  Campaign: {modu_entry['Campaign Name']}")
        print(f"  Status: {modu_entry['Lead Status']}")
        print(f"  Company: {modu_entry.get('companyName', 'N/A')}")
        print(f"  Job Title: {modu_entry.get('jobTitle', 'N/A')}")
        
else:
    print("No duplicate emails found between the two lists.")