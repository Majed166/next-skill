// Page code: reads the choices, calls logic.js, draws the result.
const L = window.NextSkill;

const TEXT = {
  ar: {
    title: 'المهارة الجاية',
    lead: 'اختر المهارات اللي عندك، وشوف أي مهارة وحدة لو تعلمتها تفتح لك أكبر عدد من إعلانات الوظائف التقنية بالسعودية.',
    s1: 'وش المسار اللي تبيه؟', s2: 'وش المهارات اللي عندك الحين؟', s3: 'النتيجة',
    track: 'المسار', all: 'كل المسارات',
    strict: 'متى نعتبر الإعلان مناسب لك؟',
    t50: 'عندي نص مهاراته', t60: 'عندي 60% من مهاراته', t80: 'عندي 80% من مهاراته', t100: 'عندي كل مهاراته',
    clear: 'مسح الاختيارات',
    countText: (n) => `إعلان مناسب لك من أصل ${n}`,
    nextTitle: 'أفضل مهارة تتعلمها الحين', nextHint: 'عدد الإعلانات الجديدة اللي تفتحها كل مهارة لو أضفتها لمهاراتك.',
    gain: (n) => `${n} إعلان جديد`, add: 'أضفها',
    pathTitle: 'خطة من 3 مهارات', pathHint: 'كل خطوة تختار أفضل مهارة بعد إضافة اللي قبلها.',
    pathRow: (g, t) => `${g} جديد، المجموع ${t}`,
    tracksTitle: 'وين تناسب أكثر؟', thTrack: 'المسار', thMatch: 'مناسب لك', thTotal: 'الإعلانات',
    none: 'ما بقى مهارة تزيد العدد. جرّب مسار ثاني أو خفف الشرط.',
    about: 'البيانات: 234 إعلان وظيفة تقنية من Bayt (نوفمبر 2024 إلى أبريل 2025) فيها مهارات واضحة. عينة صغيرة، خذها كمؤشر مو كحقيقة مطلقة.',
    code: 'الكود على GitHub', lang: 'English',
  },
  en: {
    title: 'Next Skill',
    lead: 'Pick the skills you have and see which single skill would open the most tech job postings in Saudi Arabia.',
    s1: 'Which track do you want?', s2: 'Which skills do you have now?', s3: 'Result',
    track: 'Track', all: 'All tracks',
    strict: 'When does a posting count as a match?',
    t50: 'I have half of its skills', t60: 'I have 60% of its skills', t80: 'I have 80% of its skills', t100: 'I have all of its skills',
    clear: 'Clear selection',
    countText: (n) => `postings match you, out of ${n}`,
    nextTitle: 'Best skill to learn next', nextHint: 'How many new postings each skill opens if you add it to what you have.',
    gain: (n) => `+${n} postings`, add: 'Add',
    pathTitle: 'A 3-skill plan', pathHint: 'Each step picks the best skill after adding the one before it.',
    pathRow: (g, t) => `+${g} → total ${t}`,
    tracksTitle: 'Where do you fit best?', thTrack: 'Track', thMatch: 'Match', thTotal: 'Postings',
    none: 'No skill adds more postings. Try another track or a looser rule.',
    about: 'Data: 234 tech job postings from Bayt (Nov 2024 to Apr 2025) that list clear skills. It is a small sample, so read it as a hint, not as the truth.',
    code: 'Code on GitHub', lang: 'العربية',
  },
};

const TRACK_AR = {
  'Data & AI': 'البيانات والذكاء الاصطناعي', 'Software Development': 'تطوير البرمجيات', 'Cybersecurity': 'الأمن السيبراني',
  'Cloud & DevOps': 'السحابة و DevOps', 'Networks & IT Support': 'الشبكات والدعم الفني', 'ERP & Business Systems': 'أنظمة ERP وتحليل الأعمال',
  'QA & Testing': 'الاختبار وضمان الجودة', 'UI/UX & Product': 'تجربة المستخدم والمنتج', 'IT Management': 'إدارة تقنية المعلومات',
};

const $ = (id) => document.getElementById(id);
const state = { lang: 'ar', track: 'all', threshold: 0.6, have: new Set() };
let allJobs = [];

// localStorage can be blocked (private mode), the site still works without it
function save() {
  try {
    localStorage.setItem('next-skill', JSON.stringify({ ...state, have: [...state.have] }));
  } catch (e) { /* ignore */ }
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem('next-skill'));
    if (saved) Object.assign(state, saved, { have: new Set(saved.have) });
  } catch (e) { /* ignore */ }
}

const t = (key) => TEXT[state.lang][key];
const trackName = (name) => (state.lang === 'ar' ? TRACK_AR[name] || name : name);
const jobsInTrack = () => (state.track === 'all' ? allJobs : allJobs.filter((j) => j.t === state.track));

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  children.forEach((c) => node.append(c));
  return node;
}

function drawStatic() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  $('lang').textContent = t('lang');

  const tracks = [...new Set(allJobs.map((j) => j.t))];
  $('track').replaceChildren(
    el('option', { value: 'all', textContent: t('all') }),
    ...tracks.map((name) => el('option', { value: name, textContent: trackName(name) })),
  );
  $('track').value = state.track;
  $('threshold').value = String(state.threshold);
}

function drawSkills() {
  // skills of the chosen track first, so the list is relevant
  const skills = L.allSkills(jobsInTrack());
  const rest = L.allSkills(allJobs).filter((s) => !skills.includes(s) && state.have.has(s));
  $('skills').replaceChildren(...[...skills, ...rest].map((s) => {
    const chip = el('button', { type: 'button', className: 'chip', textContent: s });
    chip.setAttribute('aria-pressed', state.have.has(s));
    chip.onclick = () => toggle(s);
    return chip;
  }));
}

function drawResult() {
  const jobs = jobsInTrack();
  const n = L.countMatches(jobs, state.have, state.threshold);
  $('count').textContent = n;
  $('countText').textContent = t('countText')(jobs.length);
  $('meterFill').style.inlineSize = (jobs.length ? (n / jobs.length) * 100 : 0) + '%';

  const next = L.nextSkills(jobs, state.have, state.threshold).filter((x) => x.gain > 0).slice(0, 6);
  const max = next.length ? next[0].gain : 1;
  $('next').replaceChildren(...(next.length ? next.map((x) => {
    const fill = el('div', { className: 'fill' });
    fill.style.inlineSize = (x.gain / max) * 100 + '%';
    const add = el('button', { type: 'button', className: 'ghost', textContent: t('add') });
    add.onclick = () => toggle(x.skill);
    return el('li', {}, [
      el('span', { className: 'name', textContent: x.skill }),
      el('div', { className: 'track' }, [fill]),
      el('span', { className: 'num' }, [t('gain')(x.gain) + ' ', add]),
    ]);
  }) : [el('li', { className: 'empty', textContent: t('none') })]));

  const path = L.learningPath(jobs, state.have, state.threshold, 3);
  $('path').replaceChildren(...(path.length ? path.map((p, i) => el('li', {}, [
    el('span', { className: 'name', textContent: `${i + 1}. ${p.skill}` }),
    el('span', { textContent: t('pathRow')(p.gain, p.total) }),
  ])) : [el('li', { className: 'empty', textContent: t('none') })]));

  const rows = L.matchesByTrack(allJobs, state.have, state.threshold);
  $('tracks').replaceChildren(
    el('tr', {}, [
      el('th', { textContent: t('thTrack') }),
      el('th', { className: 'n', textContent: t('thMatch') }),
      el('th', { className: 'n', textContent: t('thTotal') }),
    ]),
    ...rows.map((r) => el('tr', {}, [
      el('td', { textContent: trackName(r.track) }),
      el('td', { className: 'n', textContent: r.match }),
      el('td', { className: 'n', textContent: r.total }),
    ])),
  );
}

function toggle(skill) {
  if (state.have.has(skill)) state.have.delete(skill); else state.have.add(skill);
  redraw();
}
function redraw() {
  save();
  drawSkills();
  drawResult();
}

$('track').onchange = (e) => { state.track = e.target.value; redraw(); };
$('threshold').onchange = (e) => { state.threshold = Number(e.target.value); redraw(); };
$('clear').onclick = () => { state.have.clear(); redraw(); };
$('lang').onclick = () => { state.lang = state.lang === 'ar' ? 'en' : 'ar'; drawStatic(); redraw(); };

fetch('data/jobs.json')
  .then((r) => r.json())
  .then((jobs) => {
    allJobs = jobs;
    load();
    drawStatic();
    redraw();
  })
  .catch(() => {
    document.querySelector('main').textContent = 'Could not load data/jobs.json. Open the site through a local server, not as a file.';
  });
