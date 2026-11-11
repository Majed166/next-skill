// The maths of the site. No DOM here, so it can be tested with node.
//
// job  = { t: track, l: level, y: min years, s: [skills] }
// have = Set of skills the user already has
// A job "matches" when the user has at least `threshold` of its skills (0.6 = 60%).

function coverage(job, have) {
  let hit = 0;
  for (const s of job.s) if (have.has(s)) hit++;
  return hit / job.s.length;
}

function countMatches(jobs, have, threshold) {
  let n = 0;
  for (const job of jobs) if (coverage(job, have) >= threshold) n++;
  return n;
}

// every skill that appears in the jobs, most common first
function allSkills(jobs) {
  const count = {};
  for (const job of jobs) for (const s of job.s) count[s] = (count[s] || 0) + 1;
  return Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b));
}

// For each skill the user does not have: how many NEW jobs match if they learn it.
// "closer" = jobs that do not match yet but get nearer, used to break ties.
function nextSkills(jobs, have, threshold) {
  const base = countMatches(jobs, have, threshold);
  const out = [];
  for (const skill of allSkills(jobs)) {
    if (have.has(skill)) continue;
    const plus = new Set(have).add(skill);
    const gain = countMatches(jobs, plus, threshold) - base;
    let closer = 0;
    for (const job of jobs) {
      if (job.s.includes(skill) && coverage(job, plus) < threshold) closer++;
    }
    out.push({ skill, gain, closer });
  }
  return out.sort((a, b) => b.gain - a.gain || b.closer - a.closer || a.skill.localeCompare(b.skill));
}

// Greedy plan: take the best skill, add it, repeat.
// It is not guaranteed to be the best possible combination, but it is simple and close.
function learningPath(jobs, have, threshold, steps) {
  const mine = new Set(have);
  const path = [];
  for (let i = 0; i < steps; i++) {
    const best = nextSkills(jobs, mine, threshold)[0];
    if (!best || (best.gain === 0 && best.closer === 0)) break;
    mine.add(best.skill);
    path.push({ skill: best.skill, gain: best.gain, total: countMatches(jobs, mine, threshold) });
  }
  return path;
}

// matches split by track, to show where the user fits best
function matchesByTrack(jobs, have, threshold) {
  const rows = {};
  for (const job of jobs) {
    if (!rows[job.t]) rows[job.t] = { track: job.t, total: 0, match: 0 };
    rows[job.t].total++;
    if (coverage(job, have) >= threshold) rows[job.t].match++;
  }
  return Object.values(rows).sort((a, b) => b.match - a.match || b.total - a.total);
}

const NextSkill = { coverage, countMatches, allSkills, nextSkills, learningPath, matchesByTrack };
if (typeof module !== 'undefined') module.exports = NextSkill;
else window.NextSkill = NextSkill;
