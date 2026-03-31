// Profile page logic: read, validate, classify and save

const inputIds = {
  score10: 'score10',
  score12: 'score12',
  cgpa: 'cgpa',
  interests: 'interest-group',
  skills: 'skills-group',
  resume: {
    file: 'resume-file',
    text: 'resume-text',
    analyzeBtn: 'analyze-resume-btn',
    status: 'resume-status',
    insights: 'resume-insights'
  },
  personal: {
    name: 'full-name',
    email: 'email',
    phone: 'phone',
    location: 'location',
    linkedin: 'linkedin',
    github: 'github',
    portfolio: 'portfolio'
  },
  eduExp: {
    degree: 'degree',
    college: 'college',
    gradYear: 'grad-year',
    expYears: 'exp-years',
    lastRole: 'last-role',
    lastCompany: 'last-company'
  },
  projects: {
    highlights: 'project-highlights',
    certs: 'certifications'
  },
  preferences: {
    roles: 'preferred-roles',
    locations: 'preferred-locations'
  },
  traits: {
    analytical: 'trait-analytical',
    creative: 'trait-creative',
    social: 'trait-social',
    leadership: 'trait-leadership'
  },
  apt: {
    quant: 'apt-quant',
    verbal: 'apt-verbal',
    logical: 'apt-logical',
    spatial: 'apt-spatial'
  }
};

function getCheckedValues(containerId) {
  const container = document.getElementById(containerId);
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
}

function readProfileFromForm() {
  const score10 = parseFloat(document.getElementById(inputIds.score10).value);
  const score12 = parseFloat(document.getElementById(inputIds.score12).value);
  const cgpa = parseFloat(document.getElementById(inputIds.cgpa).value);
  const interests = getCheckedValues(inputIds.interests);
  const skills = getCheckedValues(inputIds.skills);
  const personal = {
    name: document.getElementById(inputIds.personal.name)?.value?.trim() || '',
    email: document.getElementById(inputIds.personal.email)?.value?.trim() || '',
    phone: document.getElementById(inputIds.personal.phone)?.value?.trim() || '',
    location: document.getElementById(inputIds.personal.location)?.value?.trim() || '',
    linkedin: document.getElementById(inputIds.personal.linkedin)?.value?.trim() || '',
    github: document.getElementById(inputIds.personal.github)?.value?.trim() || '',
    portfolio: document.getElementById(inputIds.personal.portfolio)?.value?.trim() || ''
  };
  const eduExp = {
    degree: document.getElementById(inputIds.eduExp.degree)?.value?.trim() || '',
    college: document.getElementById(inputIds.eduExp.college)?.value?.trim() || '',
    gradYear: parseInt(document.getElementById(inputIds.eduExp.gradYear)?.value || '0', 10) || null,
    expYears: parseFloat(document.getElementById(inputIds.eduExp.expYears)?.value || '0') || 0,
    lastRole: document.getElementById(inputIds.eduExp.lastRole)?.value?.trim() || '',
    lastCompany: document.getElementById(inputIds.eduExp.lastCompany)?.value?.trim() || ''
  };
  const projects = {
    highlights: document.getElementById(inputIds.projects.highlights)?.value || '',
    certifications: document.getElementById(inputIds.projects.certs)?.value || ''
  };
  const preferences = {
    roles: document.getElementById(inputIds.preferences.roles)?.value?.trim() || '',
    locations: document.getElementById(inputIds.preferences.locations)?.value?.trim() || ''
  };
  const traits = {
    analytical: parseInt(document.getElementById(inputIds.traits.analytical).value, 10),
    creative: parseInt(document.getElementById(inputIds.traits.creative).value, 10),
    social: parseInt(document.getElementById(inputIds.traits.social).value, 10),
    leadership: parseInt(document.getElementById(inputIds.traits.leadership).value, 10)
  };
  const apt = {
    quant: parseInt(document.getElementById(inputIds.apt.quant).value, 10),
    verbal: parseInt(document.getElementById(inputIds.apt.verbal).value, 10),
    logical: parseInt(document.getElementById(inputIds.apt.logical).value, 10),
    spatial: parseInt(document.getElementById(inputIds.apt.spatial).value, 10)
  };
  return { score10, score12, cgpa, interests, skills, personal, eduExp, projects, preferences, traits, apt };
}

function validateProfile(profile) {
  const errors = [];
  if (Number.isNaN(profile.score10) || profile.score10 < 0 || profile.score10 > 100) errors.push('10th % must be 0–100');
  if (Number.isNaN(profile.score12) || profile.score12 < 0 || profile.score12 > 100) errors.push('12th % must be 0–100');
  if (Number.isNaN(profile.cgpa) || profile.cgpa < 0 || profile.cgpa > 10) errors.push('CGPA must be 0–10');
  if (errors.length) return { ok: false, errors };
  return { ok: true };
}

function saveProfile(profile) {
  localStorage.setItem('career_mvp_profile_v1', JSON.stringify(profile));
}

function classifyAndSave(profile) {
  // Minimal classifier stub: store and redirect to recommendations page. The detailed
  // scoring occurs there to keep a single source of truth.
  saveProfile(profile);
  window.location.href = 'recommendations.html';
}

document.getElementById('profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = readProfileFromForm();
  const valid = validateProfile(profile);
  const formStatus = document.getElementById('form-status');
  if (!valid.ok) {
    formStatus.textContent = 'Fix: ' + valid.errors.join(', ');
    return;
  }
  classifyAndSave(profile);
});

document.getElementById('clear').addEventListener('click', () => {
  localStorage.removeItem('career_mvp_profile_v1');
  localStorage.removeItem('career_mvp_results_v1');
  document.getElementById('profile-form').reset();
  document.getElementById('form-status').textContent = 'Cleared.';
  const insights = document.getElementById(inputIds.resume?.insights || 'resume-insights');
  if (insights) insights.innerHTML = '<p class="help">Detected skills, interests, and details will appear here.</p>';
});

// Prefill from storage if available
(function initProfileForm() {
  const raw = localStorage.getItem('career_mvp_profile_v1');
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    document.getElementById(inputIds.score10).value = p.score10 ?? '';
    document.getElementById(inputIds.score12).value = p.score12 ?? '';
    document.getElementById(inputIds.cgpa).value = p.cgpa ?? '';
    Array.from(document.getElementById(inputIds.interests).querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.checked = (p.interests || []).includes(cb.value));
    Array.from(document.getElementById(inputIds.skills).querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.checked = (p.skills || []).includes(cb.value));
    document.getElementById(inputIds.traits.analytical).value = p.traits?.analytical ?? 3;
    document.getElementById(inputIds.traits.creative).value = p.traits?.creative ?? 3;
    document.getElementById(inputIds.traits.social).value = p.traits?.social ?? 3;
    document.getElementById(inputIds.traits.leadership).value = p.traits?.leadership ?? 3;
    document.getElementById(inputIds.apt.quant).value = p.apt?.quant ?? 70;
    document.getElementById(inputIds.apt.verbal).value = p.apt?.verbal ?? 70;
    document.getElementById(inputIds.apt.logical).value = p.apt?.logical ?? 70;
    document.getElementById(inputIds.apt.spatial).value = p.apt?.spatial ?? 70;
  } catch {}
})();

// Live summary meters
function updateMeters() {
  const score10 = parseFloat(document.getElementById(inputIds.score10).value) || 0;
  const score12 = parseFloat(document.getElementById(inputIds.score12).value) || 0;
  const cgpa = parseFloat(document.getElementById(inputIds.cgpa).value) || 0;
  const academic = Math.min(100, Math.round((score10 + score12) / 2 * 0.7 + (cgpa * 10) * 0.3));
  const quant = parseInt(document.getElementById(inputIds.apt.quant).value || '0', 10);
  const logical = parseInt(document.getElementById(inputIds.apt.logical).value || '0', 10);
  const interestsCount = document.querySelectorAll('#' + inputIds.interests + ' input:checked').length;
  const skillsCount = document.querySelectorAll('#' + inputIds.skills + ' input:checked').length;
  const personalFilled = [inputIds.personal?.name, inputIds.personal?.email]
    .map(id => id ? document.getElementById(id)?.value?.trim() : '')
    .filter(Boolean).length;
  const extraBoost = Math.min(50, personalFilled * 10 + ((document.getElementById(inputIds.projects?.highlights || '')?.value || '').trim() ? 10 : 0));
  const completeness = Math.min(100, Math.round((interestsCount / 6) * 40 + (skillsCount / 8) * 40 + extraBoost));

  const setWidth = (id, v) => { const el = document.getElementById(id); if (el) el.style.width = v + '%'; };
  setWidth('meter-academic', academic);
  setWidth('meter-quant', quant);
  setWidth('meter-logical', logical);
  setWidth('meter-complete', completeness);
}

document.addEventListener('input', (e) => {
  const t = e.target;
  if (!t) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName)) updateMeters();
});

document.addEventListener('DOMContentLoaded', updateMeters);


// ===== Resume analysis =====
const RESUME_SKILL_MAP = {
  python: ['python', 'numpy', 'pandas', 'scikit', 'tensorflow', 'pytorch'],
  java: ['java', 'spring', 'hibernate'],
  javascript: ['javascript', 'js', 'es6', 'node', 'react', 'vue', 'angular', 'next.js', 'node.js'],
  typescript: ['typescript', 'ts'],
  react: ['react', 'react.js', 'next.js'],
  node: ['node', 'node.js', 'express'],
  django: ['django', 'rest framework', 'drf'],
  sql: ['sql', 'mysql', 'postgres', 'postgresql', 'sqlite', 'sqlserver', 'pl/sql'],
  git: ['git', 'github', 'gitlab'],
  docker: ['docker', 'container'],
  kubernetes: ['kubernetes', 'k8s'],
  aws: ['aws', 's3', 'ec2', 'lambda', 'cloudformation']
};
const RESUME_INTEREST_MAP = {
  tech: ['software', 'engineering', 'developer', 'programming', 'coding'],
  data: ['data science', 'machine learning', 'ml', 'ai', 'deep learning', 'analytics'],
  business: ['business', 'management', 'operations', 'product'],
  design: ['ui', 'ux', 'design', 'figma', 'prototype'],
  health: ['healthcare', 'medical', 'bio', 'biomedical'],
  research: ['research', 'publication', 'paper'],
  finance: ['finance', 'financial', 'accounting', 'investment', 'trading', 'cfa'],
  marketing: ['marketing', 'brand', 'content', 'seo', 'sem'],
  security: ['security', 'cybersecurity', 'infosec', 'pentest'],
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'devops'],
  mobile: ['android', 'ios', 'mobile', 'flutter', 'react native'],
  iot: ['iot', 'embedded', 'arduino'],
  gaming: ['game', 'unity', 'unreal']
};

function detectSkillsAndInterests(text) {
  const t = text.toLowerCase();
  const skills = new Set();
  Object.keys(RESUME_SKILL_MAP).forEach(key => {
    if (RESUME_SKILL_MAP[key].some(k => t.includes(k))) skills.add(key);
  });
  const interests = new Set();
  Object.keys(RESUME_INTEREST_MAP).forEach(key => {
    if (RESUME_INTEREST_MAP[key].some(k => t.includes(k))) interests.add(key);
  });
  return { skills: Array.from(skills), interests: Array.from(interests) };
}

function extractContacts(text) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+\d{1,3}[- ]?)?\d{10,12}/);
  const linkedinMatch = text.match(/https?:\/\/[\w.-]*linkedin\.com\/[\w\/-]+/i);
  const githubMatch = text.match(/https?:\/\/[\w.-]*github\.com\/[\w\/-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(?!.*(linkedin|github)\.com)[\w.-]+\.[a-z]{2,}(?:\/[\w\/-]+)?/i);
  return {
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0] || '',
    linkedin: linkedinMatch?.[0] || '',
    github: githubMatch?.[0] || '',
    portfolio: portfolioMatch?.[0] || ''
  };
}

function extractEducation(text) {
  const t = text.toLowerCase();
  const degreeMatch = t.match(/(b\.tech|be|bsc|b\.sc|mtech|m\.tech|msc|m\.sc|mba|mca|bca|phd)/i);
  const gradYearMatch = text.match(/(?:20\d{2}|19\d{2})/g);
  const degree = degreeMatch ? degreeMatch[0].toUpperCase() : '';
  let gradYear = null;
  if (gradYearMatch) {
    const years = gradYearMatch.map(Number).filter(y => y >= 1990 && y <= 2099);
    if (years.length) gradYear = Math.max(...years);
  }
  return { degree, gradYear };
}

function populateFromResumeExtraction(extraction) {
  const { skills, interests, contacts, education } = extraction;
  const skillsContainer = document.getElementById(inputIds.skills);
  Array.from(skillsContainer.querySelectorAll('input[type="checkbox"]').values()).forEach(cb => {
    cb.checked = skills.includes(cb.value) || cb.checked;
  });
  const interestsContainer = document.getElementById(inputIds.interests);
  Array.from(interestsContainer.querySelectorAll('input[type="checkbox"]').values()).forEach(cb => {
    cb.checked = interests.includes(cb.value) || cb.checked;
  });
  if (contacts.email) document.getElementById(inputIds.personal.email).value = document.getElementById(inputIds.personal.email).value || contacts.email;
  if (contacts.phone) document.getElementById(inputIds.personal.phone).value = document.getElementById(inputIds.personal.phone).value || contacts.phone;
  if (contacts.linkedin) document.getElementById(inputIds.personal.linkedin).value = document.getElementById(inputIds.personal.linkedin).value || contacts.linkedin;
  if (contacts.github) document.getElementById(inputIds.personal.github).value = document.getElementById(inputIds.personal.github).value || contacts.github;
  if (contacts.portfolio) document.getElementById(inputIds.personal.portfolio).value = document.getElementById(inputIds.personal.portfolio).value || contacts.portfolio;
  if (education.degree) document.getElementById(inputIds.eduExp.degree).value = document.getElementById(inputIds.eduExp.degree).value || education.degree;
  if (education.gradYear) document.getElementById(inputIds.eduExp.gradYear).value = document.getElementById(inputIds.eduExp.gradYear).value || education.gradYear;
  updateMeters();
}

function renderResumeInsights(extraction) {
  const wrap = document.getElementById(inputIds.resume.insights);
  if (!wrap) return;
  const skillBadges = extraction.skills.map(s => `<span class=\"badge\">${s}</span>`).join(' ');
  const interestBadges = extraction.interests.map(s => `<span class=\"badge\">${s}</span>`).join(' ');
  const contactList = [
    extraction.contacts.email && `<div><strong>Email:</strong> ${extraction.contacts.email}</div>`,
    extraction.contacts.phone && `<div><strong>Phone:</strong> ${extraction.contacts.phone}</div>`,
    extraction.contacts.linkedin && `<div><strong>LinkedIn:</strong> ${extraction.contacts.linkedin}</div>`,
    extraction.contacts.github && `<div><strong>GitHub:</strong> ${extraction.contacts.github}</div>`,
    extraction.contacts.portfolio && `<div><strong>Portfolio:</strong> ${extraction.contacts.portfolio}</div>`
  ].filter(Boolean).join('');
  const edu = extraction.education;
  wrap.innerHTML = `
    <div><strong>Detected skills:</strong> ${skillBadges || '—'}</div>
    <div><strong>Detected interests:</strong> ${interestBadges || '—'}</div>
    ${contactList || ''}
    ${(edu.degree || edu.gradYear) ? `<div><strong>Education:</strong> ${[edu.degree, edu.gradYear].filter(Boolean).join(', ')}</div>` : ''}
  `;
}

function renderResumeInsightsWithML(extraction) {
  const wrap = document.getElementById(inputIds.resume.insights);
  if (!wrap) return;
  const skillBadges = extraction.skills.map(s => `<span class=\"badge\">${s}</span>`).join(' ');
  const interestBadges = extraction.interests.map(s => `<span class=\"badge\">${s}</span>`).join(' ');
  const contactList = [
    extraction.contacts.email && `<div><strong>Email:</strong> ${extraction.contacts.email}</div>`,
    extraction.contacts.phone && `<div><strong>Phone:</strong> ${extraction.contacts.phone}</div>`,
    extraction.contacts.linkedin && `<div><strong>LinkedIn:</strong> ${extraction.contacts.linkedin}</div>`,
    extraction.contacts.github && `<div><strong>GitHub:</strong> ${extraction.contacts.github}</div>`,
    extraction.contacts.portfolio && `<div><strong>Portfolio:</strong> ${extraction.contacts.portfolio}</div>`
  ].filter(Boolean).join('');
  const edu = extraction.education;
  const ml = extraction.ml;
  const xp = extraction.xp;
  const probPct = Math.round((ml?.top?.prob || 0) * 100);

  // Missing skills suggestion based on cluster's required skills vs detected
  const required = (RESUME_CLUSTER_SEEDS.find(c => c.id === ml?.top?.id)?.requiredSkills || []);
  const missing = required.filter(s => !extraction.skills.includes(s));
  const missingBadges = missing.map(s => `<span class=\"badge\">${s}</span>`).join(' ');

  wrap.innerHTML = `
    <div class=\"card\" style=\"margin-bottom:8px\"> 
      <div><strong>Top domain fit:</strong> ${ml?.top?.name || '—'} <span class=\"badge\">${probPct}% confidence</span></div>
      ${ml?.ranked?.length ? `<div><strong>Next best:</strong> ${ml.ranked.slice(1).map(r => `${r.name} (${Math.round(r.prob*100)}%)`).join(', ')}</div>` : ''}
      ${xp ? `<div><strong>Experience:</strong> ${xp.seniority}${xp.years != null ? ` (${xp.years} years)` : ''}</div>` : ''}
    </div>
    <div><strong>Detected skills:</strong> ${skillBadges || '—'}</div>
    <div><strong>Detected interests:</strong> ${interestBadges || '—'}</div>
    ${missing.length ? `<div><strong>Suggested to learn:</strong> ${missingBadges}</div>` : ''}
    ${contactList || ''}
    ${(edu.degree || edu.gradYear) ? `<div><strong>Education:</strong> ${[edu.degree, edu.gradYear].filter(Boolean).join(', ')}</div>` : ''}
  `;
}

// ===== Simple ML classifier (Multinomial NB-style) over seeded terms =====
const RESUME_CLUSTER_SEEDS = [
  { id: 'software', name: 'Software Engineering',
    terms: ['software', 'developer', 'programmer', 'backend', 'frontend', 'full stack', 'react', 'node', 'express', 'javascript', 'typescript', 'java', 'spring', 'kotlin', 'c++', 'api', 'rest', 'git', 'docker', 'kubernetes'],
    requiredSkills: ['javascript', 'react', 'node'] },
  { id: 'datascience', name: 'Data Science & AI/ML',
    terms: ['data', 'machine learning', 'ml', 'ai', 'deep learning', 'pandas', 'numpy', 'scikit', 'tensorflow', 'pytorch', 'statistics', 'sql', 'nlp', 'computer vision'],
    requiredSkills: ['python', 'sql', 'ml'] },
  { id: 'business', name: 'Business & Management',
    terms: ['business', 'management', 'operations', 'strategy', 'stakeholder', 'product', 'roadmap', 'market', 'finance', 'kpi'],
    requiredSkills: ['communication', 'leadership'] },
  { id: 'design', name: 'Design & UX',
    terms: ['ux', 'ui', 'design', 'figma', 'wireframe', 'prototype', 'usability', 'interaction'],
    requiredSkills: ['design', 'communication'] },
  { id: 'health', name: 'Healthcare & Bio',
    terms: ['healthcare', 'clinical', 'biomedical', 'pharma', 'public health', 'biology'],
    requiredSkills: ['biology', 'communication'] },
  { id: 'research', name: 'Research & Academia',
    terms: ['research', 'publication', 'paper', 'thesis', 'experiment', 'statistical analysis'],
    requiredSkills: ['stats', 'programming'] },
  { id: 'coreeng', name: 'Core Engineering',
    terms: ['mechanical', 'electrical', 'civil', 'cad', 'cam', 'circuit', 'thermo'],
    requiredSkills: ['mechanical'] },
  { id: 'finance', name: 'Finance',
    terms: ['finance', 'financial', 'valuation', 'modeling', 'accounting', 'investment', 'risk'],
    requiredSkills: ['finance', 'stats'] },
  { id: 'marketing', name: 'Marketing & Communications',
    terms: ['marketing', 'content', 'seo', 'sem', 'brand', 'campaign', 'social media'],
    requiredSkills: ['marketing', 'communication'] }
];

function tokenizeText(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9+\s\.\-]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens;
}

function classifyResumeWithNB(text) {
  const tokens = tokenizeText(text);
  const tokenSet = new Set(tokens);
  // Include phrase detection by raw includes
  const tLower = text.toLowerCase();
  const alpha = 1; // Laplace smoothing
  const V = 2000; // pseudo vocabulary size
  const prior = 1 / RESUME_CLUSTER_SEEDS.length;
  const results = RESUME_CLUSTER_SEEDS.map(cluster => {
    let logScore = Math.log(prior);
    let matched = 0;
    cluster.terms.forEach(term => {
      const isPhrase = term.includes(' ');
      const present = isPhrase ? tLower.includes(term) : tokenSet.has(term);
      const termCount = present ? 1 : 0;
      // Likelihood contribution
      const likelihood = (termCount + alpha) / (1 + alpha * V);
      logScore += Math.log(likelihood);
      if (present) matched++;
    });
    return { id: cluster.id, name: cluster.name, logScore, matched };
  });
  // Softmax to probabilities
  const maxLog = Math.max(...results.map(r => r.logScore));
  const exps = results.map(r => Math.exp(r.logScore - maxLog));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const scored = results.map((r, i) => ({ id: r.id, name: r.name, score: r.logScore, prob: exps[i] / sumExp, matched: r.matched }))
    .sort((a, b) => b.prob - a.prob);
  return { top: scored[0], ranked: scored.slice(0, 3) };
}

function extractExperience(text) {
  const matchYears = text.match(/(\d+)(?:\+)?\s*(?:years|yrs)/i);
  const matchIntern = /(intern|internship)/i.test(text);
  let years = null;
  if (matchYears) years = parseInt(matchYears[1], 10);
  const seniority = years == null ? (matchIntern ? 'Intern/Fresher' : 'Unknown') : years >= 3 ? 'Mid/Senior' : years >= 1 ? 'Junior' : 'Fresher';
  return { years, seniority };
}

// ===== Stronger ML: TF-IDF + Bigrams + Skill boosts + NB ensemble =====
let TFIDF_CACHE = null;

function tokenizeWithBigrams(text) {
  const base = tokenizeText(text);
  const bigrams = [];
  for (let i = 0; i < base.length - 1; i++) {
    const a = base[i];
    const b = base[i + 1];
    if (a.length >= 2 && b.length >= 2) bigrams.push(a + '_' + b);
  }
  return base.concat(bigrams);
}

function computeTf(tokens) {
  const tf = Object.create(null);
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => { tf[k] = tf[k] / total; });
  return tf;
}

function buildTfidfModel() {
  if (TFIDF_CACHE) return TFIDF_CACHE;
  // Build vocabulary from cluster seeds (include phrase tokens as joined bigrams)
  const docs = RESUME_CLUSTER_SEEDS.map(c => c.terms.map(t => t.includes(' ') ? t.toLowerCase().replace(/\s+/g, '_') : t.toLowerCase()));
  const vocabSet = new Set();
  docs.forEach(d => d.forEach(tok => vocabSet.add(tok)));
  const vocab = Array.from(vocabSet);
  const N = docs.length;
  const df = Object.create(null);
  vocab.forEach(v => { df[v] = 0; });
  docs.forEach(d => {
    const s = new Set(d);
    s.forEach(tok => { if (df[tok] != null) df[tok] += 1; });
  });
  const idf = Object.create(null);
  vocab.forEach(v => { idf[v] = Math.log((1 + N) / (1 + (df[v] || 0))) + 1; });
  // Cluster centroid vectors (TF-IDF over terms document)
  const clusterVectors = RESUME_CLUSTER_SEEDS.map((c, idx) => {
    const tf = computeTf(docs[idx]);
    const vec = Object.create(null);
    Object.keys(tf).forEach(t => { vec[t] = tf[t] * (idf[t] || 0); });
    return { id: c.id, name: c.name, vec };
  });
  TFIDF_CACHE = { vocab, idf, clusterVectors };
  return TFIDF_CACHE;
}

function toTfidfVector(tokens, idf) {
  const tf = computeTf(tokens);
  const vec = Object.create(null);
  Object.keys(tf).forEach(t => { if (idf[t] != null) vec[t] = tf[t] * idf[t]; });
  return vec;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const k in a) { const va = a[k]; na += va * va; if (b[k] != null) dot += va * b[k]; }
  for (const k in b) { const vb = b[k]; nb += vb * vb; }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}

function softmaxScores(scores) {
  const max = Math.max(...scores.map(s => s.score));
  const exps = scores.map(s => Math.exp(s.score - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return scores.map((s, i) => ({ ...s, prob: exps[i] / sum }));
}

const SKILL_CLUSTER_BOOST = {
  software: { javascript: 0.12, react: 0.12, node: 0.12, java: 0.12, typescript: 0.08, git: 0.06, docker: 0.06, kubernetes: 0.05 },
  datascience: { python: 0.18, sql: 0.12, aws: 0.05 },
  business: { },
  design: { design: 0.15 },
  health: { },
  research: { python: 0.06, sql: 0.06 },
  coreeng: { },
  finance: { sql: 0.08 },
  marketing: { }
};

function classifyResumeStrong(text, detectedSkills = []) {
  const { idf, clusterVectors } = buildTfidfModel();
  const tokens = tokenizeWithBigrams(text);
  const resumeVec = toTfidfVector(tokens, idf);
  // Cosine similarity per cluster
  let simScores = clusterVectors.map(c => ({ id: c.id, name: c.name, score: cosineSim(resumeVec, c.vec) }));
  // NB-style probabilities
  const nb = classifyResumeWithNB(text);
  const nbMap = Object.create(null);
  nb.ranked.forEach(r => { nbMap[r.id] = r.prob; });
  // Skill boosts
  const boostMap = Object.create(null);
  simScores.forEach(s => { boostMap[s.id] = 0; });
  detectedSkills.forEach(sk => {
    for (const cid in SKILL_CLUSTER_BOOST) {
      const boost = SKILL_CLUSTER_BOOST[cid][sk];
      if (boost) boostMap[cid] = (boostMap[cid] || 0) + boost;
    }
  });
  // Ensemble raw scores
  const wSim = 0.6, wNb = 0.3, wBoost = 0.1;
  const combined = simScores.map(s => ({
    id: s.id,
    name: s.name,
    score: wSim * s.score + wNb * (nbMap[s.id] || 0) + wBoost * (boostMap[s.id] || 0)
  }));
  const withProb = softmaxScores(combined).sort((a, b) => b.prob - a.prob);
  return { top: withProb[0], ranked: withProb.slice(0, 3) };
}

async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => resolve(fr.result);
    fr.readAsArrayBuffer(file);
  });
}
async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => resolve(fr.result);
    fr.readAsText(file);
  });
}

async function extractTextFromPdf(file) {
  try {
    if (!window.pdfjsLib) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
        s.onload = () => res();
        s.onerror = () => rej(new Error('pdf.js load failed'));
        document.head.appendChild(s);
      });
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const data = await readFileAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(' ') + '\n';
    }
    return text;
  } catch (e) {
    return '';
  }
}

async function analyzeResume() {
  const status = document.getElementById(inputIds.resume.status);
  const fileEl = document.getElementById(inputIds.resume.file);
  const textEl = document.getElementById(inputIds.resume.text);
  status.textContent = 'Analyzing resume...';
  let text = (textEl?.value || '').trim();
  const file = fileEl?.files?.[0] || null;
  try {
    if (!text && file) {
      if (file.type === 'text/plain') {
        text = await readFileAsText(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await extractTextFromPdf(file);
      }
    }
    if (!text) {
      status.textContent = 'Please upload a PDF/TXT or paste resume text.';
      return;
    }
    const detected = detectSkillsAndInterests(text);
    const contacts = extractContacts(text);
    const education = extractEducation(text);
    const xp = extractExperience(text);
    const nb = classifyResumeWithNB(text);
    const strong = classifyResumeStrong(text, detected.skills);
    const extraction = { ...detected, contacts, education };
    populateFromResumeExtraction(extraction);
    renderResumeInsightsWithML({ ...extraction, ml: strong, xp });
    status.textContent = 'Resume analyzed with ML insights.';
  } catch (err) {
    status.textContent = 'Failed to analyze resume. Paste text as fallback.';
  }
}

document.getElementById(inputIds.resume.analyzeBtn)?.addEventListener('click', analyzeResume);
