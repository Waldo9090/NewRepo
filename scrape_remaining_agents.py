#!/usr/bin/env python3

import time
import sys

# Base URL pattern for Compass Florida agents
base_url = "https://www.compass.com/agents/locations/florida/192324/?page={}"

# Agents collected so far (from pages 21-24)
new_agents = [
    # Page 21 agents
    "Chip Falkanger,561-702-0691,chip.falkanger@compass.com,Senior Real Estate Agent,FL",
    "Angela Falletta,954-461-8088,angela.falletta@compass.com,Senior Real Estate Agent,FL", 
    "Michael Falsetto,305-632-9797,michael.falsetto@compass.com,Senior Real Estate Agent,FL",
    "Carla Fanelli O'Reilly,917-841-7491,carla.fanelli@compass.com,Senior Real Estate Agent,FL",
    "Paquita Fano,561-251-3018,paquita.fano@compass.com,Senior Real Estate Agent,FL",
    "Maria Fanto,607-725-2459,maria.fanto@compass.com,Senior Real Estate Agent,FL",
    "Yvonne Faraci,720-987-7956,yvonne.faraci@compass.com,Senior Real Estate Agent,FL",
    "Soraia Farah,786-201-3830,soraia.farah@compass.com,Senior Real Estate Agent,FL",
    "Nevan Farias,512-970-9532,nevan.farias@compass.com,Senior Real Estate Agent,FL",
    "Chris Farrugia,239-248-8171,chris.farrugia@compass.com,Senior Real Estate Agent,FL",
    
    # Page 22 agents
    "Jon Fincher,813-404-1215,jon.fincher@compass.com,Senior Real Estate Agent,FL",
    "Sam Fingold,561-562-0663,samuel.fingold@compass.com,Senior Real Estate Agent,FL",
    "Andrew Fink,917-496-3270,andy.fink@compass.com,Senior Real Estate Agent,FL",
    "Miriam Fink,917-734-1644,miriam.fink@compass.com,Senior Real Estate Agent,FL",
    "Dustin Fink,561-788-4579,dustin.fink@compass.com,Senior Real Estate Agent,FL",
    "Kristina Fink,305-281-3093,kristinafink@compass.com,Senior Real Estate Agent,FL",
    "Stephanie Finley,561-235-8964,stephanie.finley@compass.com,Senior Real Estate Agent,FL",
    "Gina Finsilver,561-702-3115,gina.finsilver@compass.com,Senior Real Estate Agent,FL",
    "Joy Fischer,954-254-0646,joy.fischer@compass.com,Senior Real Estate Agent,FL",
    "Rebecca Fischer,651-402-8946,rebecca.fischer@compass.com,Senior Real Estate Agent,FL",
    
    # Page 23 agents  
    "Crystal Fowler,941-769-7966,crystal.fowler@compass.com,Senior Real Estate Agent,FL",
    "Kylie Fowler,603-583-6842,kylie.fowler@compass.com,Senior Real Estate Agent,FL",
    "Mike Fowler,239-564-3590,mike.fowler@compass.com,Senior Real Estate Agent,FL",
    "Wendy Fox,617-470-5033,wendy.fox@compass.com,Senior Real Estate Agent,FL",
    "Donna Fox,850-217-6072,donna.fox@compass.com,Senior Real Estate Agent,FL",
    "Jason Fox,954-253-2752,jason.fox@compass.com,Senior Real Estate Agent,FL",
    "Randi Fox,954-253-7746,randi.fox@compass.com,Senior Real Estate Agent,FL",
    "Victor Franco,239-777-1895,victor.franco@compass.com,Senior Real Estate Agent,FL",
    
    # Page 24 agents
    "Andrea Gallagher,260-602-1608,andrea.gallagher@compass.com,Senior Real Estate Agent,FL",
    "Victoria Gallant,904-758-8003,victoria.gallant@compass.com,Senior Real Estate Agent,FL",
    "Sarah Galperin,818-606-1860,sarah.galperin@compass.com,Senior Real Estate Agent,FL",
    "Charlie Galvin,239-247-9178,charlie.galvin@compass.com,Senior Real Estate Agent,FL",
    "Colin Galvin,724-705-5962,colin.galvin@compass.com,Senior Real Estate Agent,FL",
    "Carl Gambino,646-465-1766,carl.gambino@compass.com,Senior Real Estate Agent,FL",
    "Vyoma Gandhi,305-905-9584,vyoma.gandhi@compass.com,Senior Real Estate Agent,FL",
    "Liv Gandy,561-339-0912,liv.gandy@compass.com,Senior Real Estate Agent,FL"
]

# Write additional agents to file
print(f"Adding {len(new_agents)} new agents to the existing file...")

# For pages 25-75, we need to use WebFetch tool to get the data
# This script serves as a template for the remaining work

remaining_pages = list(range(25, 76))
print(f"Still need to process {len(remaining_pages)} pages: {remaining_pages[0]} through {remaining_pages[-1]}")

# Write current batch to temporary file
with open('additional_agents_batch1.csv', 'w') as f:
    for agent in new_agents:
        f.write(agent + '\n')

print("Batch 1 agents written to additional_agents_batch1.csv")
print("Continue with WebFetch tool for remaining pages...")