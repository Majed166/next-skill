"""
Builds data/jobs.json from the cleaned file of my other project
(saudi-tech-jobs-analysis -> data/tech_jobs.csv).

Only what the site needs is kept: track, level, min years and the skills of each posting.
No titles and no company names.

run:  python scripts/build_data.py path/to/tech_jobs.csv
"""
import json
import sys
import pandas as pd

LANG = {"Arabic language", "English language"}

df = pd.read_csv(sys.argv[1])
jobs = []
for _, row in df.iterrows():
    skills = [s for s in str(row["skills_found"]).split(";") if s and s != "nan" and s not in LANG]
    if not skills:
        continue  # a posting with no skills can't be matched
    jobs.append({
        "t": row["track"],
        "l": row["level"],
        "y": None if pd.isna(row["min_years"]) else int(row["min_years"]),
        "s": sorted(skills),
    })

with open("data/jobs.json", "w", encoding="utf-8") as f:
    json.dump(jobs, f, ensure_ascii=False, separators=(",", ":"))
print(len(jobs), "postings saved")
