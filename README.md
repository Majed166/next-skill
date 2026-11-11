# Next Skill | المهارة الجاية

Pick the skills you already have and the site tells you **which single skill would open the most
tech job postings in Saudi Arabia**, based on real postings.

Most "top skills" lists only say what is popular. That didn't help me decide what to learn, because
the answer depends on what I already know. If I know JavaScript and React, learning one more thing
that completes many postings is worth more than learning the most popular skill on the list.
So this site calculates the gain of each skill for *your* set of skills.

## What it does

1. Choose a track (data, software, cybersecurity ...) and how strict the match is (50% to 100% of a posting's skills).
2. Tick the skills you have.
3. You get:
   - how many postings match you now
   - the skills ranked by how many **new** postings each one opens
   - a 3-skill plan (each step is chosen after adding the one before it)
   - a table of where you fit best across all tracks

Arabic and English, right-to-left and left-to-right, light and dark. Your choices are saved in the browser.

## How the calculation works

All of it is in [`logic.js`](logic.js), about 70 lines with no dependencies.

- A posting **matches** when you have at least X% of the skills it lists (X is the strictness you chose).
- For every skill you don't have, the site adds it to your set and counts the matches again.
  The difference is the **gain** of that skill.
- When two skills have the same gain, the one that gets more postings *closer* to matching wins.
- The plan is greedy: take the best skill, add it, repeat three times. It is not guaranteed to be the
  best possible combination of three, but checking every combination is much slower and the result is usually the same.

## Data

234 tech job postings from Bayt.com (Saudi Arabia, Nov 2024 to Apr 2025) that mention at least one known skill.
They come from my other project, [saudi-tech-jobs-analysis](https://github.com/Majed166/saudi-tech-jobs-analysis),
where the postings are cleaned and the skills are extracted. The original listings were collected by the
[DataMentes team](https://github.com/DataMentes/Job-Market-Insights-analysis).

`data/jobs.json` only has the track, level, years and skills of each posting. No titles, no companies.

## Limits

- 234 postings is small. Some tracks have very few (QA has 5), so the numbers there mean little.
- Skills were found with keywords, so a posting can be missing skills it really needs.
- A third of the postings list only one skill, which makes them easy to "match".
- "Match" only looks at skills. It ignores years of experience, degree and nationality rules.
- The data ends in April 2025.

## Run it

```
python -m http.server 8000     # or any static server
# open http://localhost:8000
```

It has to be opened through a server, because the page loads `data/jobs.json` with `fetch`.

```
npm test                       # 8 tests for logic.js, nothing to install
python scripts/build_data.py path/to/tech_jobs.csv   # rebuild the data file
```

## Files

```
index.html, style.css   the page (CSS uses logical properties, so one file serves both directions)
app.js                  reads the choices and draws the result
logic.js                the calculation
data/jobs.json          the postings
scripts/build_data.py   makes jobs.json from the other project's output
test/logic.test.js      tests
```
