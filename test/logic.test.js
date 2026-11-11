const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic');

const jobs = [
  { t: 'Data', s: ['SQL', 'Python'] },
  { t: 'Data', s: ['SQL', 'Python', 'Power BI'] },
  { t: 'Data', s: ['SQL'] },
  { t: 'Web', s: ['JavaScript', 'React'] },
  { t: 'Web', s: ['JavaScript', 'React', 'Git', 'SQL'] },
];

test('coverage is the share of the job skills the user has', () => {
  assert.strictEqual(L.coverage(jobs[1], new Set(['SQL'])), 1 / 3);
  assert.strictEqual(L.coverage(jobs[0], new Set(['SQL', 'Python', 'Java'])), 1);
});

test('countMatches respects the threshold', () => {
  const have = new Set(['SQL']);
  assert.strictEqual(L.countMatches(jobs, have, 1), 1);    // only the SQL-only job
  assert.strictEqual(L.countMatches(jobs, have, 0.5), 2);  // + SQL/Python
});

test('nextSkills ranks by new matches', () => {
  const next = L.nextSkills(jobs, new Set(['SQL']), 1);
  assert.strictEqual(next[0].skill, 'Python');
  assert.strictEqual(next[0].gain, 1);
  assert.ok(!next.some((x) => x.skill === 'SQL'));
});

test('nextSkills uses "closer" when the gain is the same', () => {
  // with nothing learned and a 100% threshold only SQL unlocks a job
  const next = L.nextSkills(jobs, new Set(), 1);
  assert.strictEqual(next[0].skill, 'SQL');
  // JavaScript and React both unlock 0 jobs but each gets 2 jobs closer; Power BI only 1
  const names = next.map((x) => x.skill);
  assert.ok(names.indexOf('JavaScript') < names.indexOf('Power BI'));
});

test('learningPath adds skills one at a time and the total never goes down', () => {
  const path = L.learningPath(jobs, new Set(), 1, 3);
  assert.deepStrictEqual(path.map((p) => p.skill), ['SQL', 'Python', 'Power BI']);
  assert.deepStrictEqual(path.map((p) => p.total), [1, 2, 3]);
});

test('learningPath stops when nothing is left to learn', () => {
  const all = new Set(L.allSkills(jobs));
  assert.deepStrictEqual(L.learningPath(jobs, all, 1, 3), []);
});

test('matchesByTrack counts per track', () => {
  const rows = L.matchesByTrack(jobs, new Set(['SQL', 'Python']), 1);
  assert.deepStrictEqual(rows[0], { track: 'Data', total: 3, match: 2 });
  assert.deepStrictEqual(rows[1], { track: 'Web', total: 2, match: 0 });
});

test('real data loads and has the expected shape', () => {
  const real = require('../data/jobs.json');
  assert.ok(real.length > 200);
  assert.ok(real.every((j) => j.t && Array.isArray(j.s) && j.s.length > 0));
});
