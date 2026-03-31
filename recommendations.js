// Compute recommendations using the weighted classification model and render

const CLUSTERS = [
  { id: 'software', name: 'Software Engineering', weights: { scores: { score10: 0.1, score12: 0.15, cgpa: 0.2 }, apt: { quant: 0.2, verbal: 0.05, logical: 0.25, spatial: 0.05 }, traits: { analytical: 0.25, creative: 0.05, social: 0.05, leadership: 0.05 }, interests: { tech: 0.4 }, skills: { programming: 0.35, python: 0.15, javascript: 0.15, java: 0.1 } }, roles: ['Software Developer', 'Full-Stack Engineer', 'Mobile App Developer'], education: ['B.Tech/BE in CSE/IT', 'MCA', 'MS in CS (optional)'], courses: ['Data Structures & Algorithms', 'System Design', 'Web Dev (React/Node)'] },
  { id: 'datascience', name: 'Data Science & AI/ML', weights: { scores: { score10: 0.1, score12: 0.15, cgpa: 0.2 }, apt: { quant: 0.25, verbal: 0.05, logical: 0.25, spatial: 0.05 }, traits: { analytical: 0.3, creative: 0.05, social: 0.05, leadership: 0.05 }, interests: { data: 0.4, research: 0.2 }, skills: { python: 0.2, stats: 0.25, ml: 0.3, sql: 0.1 } }, roles: ['Data Scientist', 'ML Engineer', 'Data Analyst'], education: ['B.Tech/BE, BSc, MSc in DS/AI/Stats', 'MS/PG in AI/ML'], courses: ['Python for Data Science', 'Statistics', 'ML/DL Fundamentals'] },
  { id: 'business', name: 'Business & Management', weights: { scores: { score10: 0.1, score12: 0.15, cgpa: 0.15 }, apt: { quant: 0.1, verbal: 0.2, logical: 0.1, spatial: 0.05 }, traits: { analytical: 0.15, creative: 0.05, social: 0.25, leadership: 0.25 }, interests: { business: 0.35 }, skills: { communication: 0.25, leadership: 0.2 } }, roles: ['Business Analyst', 'Product Manager', 'Operations Manager'], education: ['BBA/B.Com', 'MBA/PGDM'], courses: ['Business Analytics', 'Marketing', 'Finance Basics'] },
  { id: 'design', name: 'Design & UX', weights: { scores: { score10: 0.05, score12: 0.05, cgpa: 0.1 }, apt: { quant: 0.05, verbal: 0.1, logical: 0.05, spatial: 0.25 }, traits: { analytical: 0.05, creative: 0.35, social: 0.1, leadership: 0.05 }, interests: { design: 0.4 }, skills: { design: 0.35, communication: 0.15 } }, roles: ['UX Designer', 'Product Designer', 'UI Developer'], education: ['B.Des', 'M.Des', 'HCI/Interaction Design'], courses: ['User Research', 'Figma', 'Interaction Design'] },
  { id: 'health', name: 'Healthcare & Bio', weights: { scores: { score10: 0.1, score12: 0.2, cgpa: 0.15 }, apt: { quant: 0.1, verbal: 0.1, logical: 0.1, spatial: 0.1 }, traits: { analytical: 0.2, creative: 0.05, social: 0.2, leadership: 0.05 }, interests: { health: 0.4 }, skills: { biology: 0.35, communication: 0.1 } }, roles: ['Clinical Research Associate', 'Biomedical Engineer', 'Public Health Analyst'], education: ['MBBS/BDS', 'B.Pharm/BPT', 'Biotech/Biomedical'], courses: ['Biostatistics', 'Public Health', 'Bioinformatics'] },
  { id: 'research', name: 'Research & Academia', weights: { scores: { score10: 0.1, score12: 0.1, cgpa: 0.25 }, apt: { quant: 0.15, verbal: 0.15, logical: 0.15, spatial: 0.1 }, traits: { analytical: 0.25, creative: 0.15, social: 0.05, leadership: 0.05 }, interests: { research: 0.5 }, skills: { stats: 0.15, programming: 0.1 } }, roles: ['Research Assistant', 'PhD Scholar', 'Lecturer'], education: ['MSc/MTech', 'PhD'], courses: ['Research Methods', 'Academic Writing', 'Advanced Statistics'] },
  { id: 'coreeng', name: 'Core Engineering', weights: { scores: { score10: 0.1, score12: 0.1, cgpa: 0.2 }, apt: { quant: 0.2, verbal: 0.05, logical: 0.2, spatial: 0.15 }, traits: { analytical: 0.2, creative: 0.1, social: 0.05, leadership: 0.05 }, interests: { tech: 0.2, research: 0.1 }, skills: { mechanical: 0.3 } }, roles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer'], education: ['B.Tech/BE in Core Branches'], courses: ['Thermo/Mechanics', 'Circuit Design', 'CAD/CAM'] },
  { id: 'finance', name: 'Finance', weights: { scores: { score10: 0.1, score12: 0.15, cgpa: 0.15 }, apt: { quant: 0.25, verbal: 0.1, logical: 0.2, spatial: 0.05 }, traits: { analytical: 0.25, creative: 0.05, social: 0.1, leadership: 0.1 }, interests: { finance: 0.4, business: 0.2 }, skills: { finance: 0.35, stats: 0.1 } }, roles: ['Financial Analyst', 'Investment Banking Analyst', 'Risk Analyst'], education: ['B.Com/BBA', 'MBA (Finance)', 'CFA/FRM'], courses: ['Corporate Finance', 'Financial Modeling', 'Accounting'] },
  { id: 'marketing', name: 'Marketing & Communications', weights: { scores: { score10: 0.08, score12: 0.12, cgpa: 0.12 }, apt: { quant: 0.05, verbal: 0.25, logical: 0.1, spatial: 0.05 }, traits: { analytical: 0.1, creative: 0.25, social: 0.3, leadership: 0.15 }, interests: { marketing: 0.45, business: 0.2 }, skills: { marketing: 0.35, communication: 0.25 } }, roles: ['Digital Marketer', 'Content Strategist', 'Brand Manager'], education: ['BA/BBA', 'MBA (Marketing)'], courses: ['SEO/SEM', 'Content Strategy', 'Brand Management'] }
];

function loadProfile() {
  const raw = localStorage.getItem('career_mvp_profile_v1');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function normalizeProfile(profile) {
  return {
    scores: { score10: profile.score10 / 100, score12: profile.score12 / 100, cgpa: profile.cgpa / 10 },
    apt: { quant: profile.apt.quant / 100, verbal: profile.apt.verbal / 100, logical: profile.apt.logical / 100, spatial: profile.apt.spatial / 100 },
    traits: { analytical: profile.traits.analytical / 5, creative: profile.traits.creative / 5, social: profile.traits.social / 5, leadership: profile.traits.leadership / 5 },
    interests: new Set(profile.interests),
    skills: new Set(profile.skills)
  };
}

function scoreCluster(cluster, p) {
  let score = 0;
  const w = cluster.weights;
  if (w.scores) for (const k in w.scores) score += (p.scores[k] || 0) * w.scores[k];
  if (w.apt) for (const k in w.apt) score += (p.apt[k] || 0) * w.apt[k];
  if (w.traits) for (const k in w.traits) score += (p.traits[k] || 0) * w.traits[k];
  if (w.interests) for (const k in w.interests) score += (p.interests.has(k) ? 1 : 0) * w.interests[k];
  if (w.skills) for (const k in w.skills) score += (p.skills.has(k) ? 1 : 0) * w.skills[k];
  return score;
}

function classify(profile) {
  const normalized = normalizeProfile(profile);
  const scored = CLUSTERS.map(c => ({ cluster: c, score: scoreCluster(c, normalized) }));
  scored.sort((a, b) => b.score - a.score);
  return { normalized, scored, top: scored.slice(0, 3) };
}

function renderResults(result) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'card';
  heading.innerHTML = `<h3>Top Recommendations</h3><p class="badge">Model: weighted classification</p>`;
  container.appendChild(heading);
  result.top.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const pct = Math.round(item.score * 100);
    card.innerHTML = `
      <h3>${index + 1}. ${item.cluster.name}</h3>
      <p class="badge">Fit score: ${pct}/100</p>
      <div><strong>Roles:</strong> ${item.cluster.roles.join(', ')}</div>
      <div><strong>Higher education:</strong> ${item.cluster.education.join(', ')}</div>
      <div><strong>Skill-building:</strong> ${item.cluster.courses.join(', ')}</div>
    `;
    container.appendChild(card);
  });
}

(function init() {
  const profile = loadProfile();
  if (!profile) return;
  const res = classify(profile);
  localStorage.setItem('career_mvp_results_v1', JSON.stringify({ top: res.top.map(t => ({ id: t.cluster.id, score: t.score })) }));
  renderResults(res);
})();


