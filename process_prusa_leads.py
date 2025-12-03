import pandas as pd
import os

# Read the CSV file
input_file = '/Users/adityamahna/Downloads/AnalyticsDashboard-67ac6c7c6f37b741115dbb7f828e81a4a06adda9 2/prusa external list/leads-4.csv'
df = pd.read_csv(input_file)

# Create output directory
output_dir = '/Users/adityamahna/Downloads/AnalyticsDashboard-67ac6c7c6f37b741115dbb7f828e81a4a06adda9 2/prusa external list'

# Filter leads who opened emails (contains "opened" in Lead Status)
opened_leads = df[df['Lead Status'].str.contains('opened', case=False, na=False)]
opened_leads.to_csv(os.path.join(output_dir, 'leads_opened.csv'), index=False)

# Filter leads who responded (only actual replies, not just opens)
responded_leads = df[df['Lead Status'].str.contains('Reply received', case=False, na=False)]
responded_leads.to_csv(os.path.join(output_dir, 'leads_responded.csv'), index=False)

# Filter leads that were just sent or bounced (contains "Contacted" or "Bounced" but NOT "opened")
sent_or_bounced = df[
    (df['Lead Status'].str.contains('Contacted|Bounced', case=False, na=False)) &
    (~df['Lead Status'].str.contains('opened', case=False, na=False))
]
sent_or_bounced.to_csv(os.path.join(output_dir, 'leads_sent_or_bounced.csv'), index=False)

print(f"Processing complete!")
print(f"Total leads: {len(df)}")
print(f"Leads who opened emails: {len(opened_leads)}")
print(f"Leads who responded: {len(responded_leads)}")
print(f"Leads sent to or bounced: {len(sent_or_bounced)}")