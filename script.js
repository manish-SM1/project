// AI Career Guidance MVP — simple scoring classifier + rule-based NLP chatbot

// Tabs
const tabButtons = [
  document.getElementById('tabbtn-profile'),
  document.getElementById('tabbtn-recommendations'),
  document.getElementById('tabbtn-chat')
];
const panels = [
  document.getElementById('tab-profile'),
  document.getElementById('tab-recommendations'),
  document.getElementById('tab-chat')
];
tabButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => activateTab(idx));
});
function activateTab(index) {
  tabButtons.forEach((b, i) => {
    const selected = i === index;
    b.classList.toggle('active', selected);
    b.setAttribute('aria-selected', String(selected));
    panels[i].classList.toggle('active', selected);
  });
}

// Form elements
const form = document.getElementById('profile-form');
const formStatus = document.getElementById('form-status');
const clearBtn = document.getElementById('clear');
const resultsContainer = document.getElementById('results');

// Inputs
const inputIds = {
  score10: 'score10',
  score12: 'score12',
  cgpa: 'cgpa',
  interests: 'interest-group',
  skills: 'skills-group',
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

// Local storage keys
const STORAGE_KEY_PROFILE = 'career_mvp_profile_v1';
const STORAGE_KEY_RESULTS = 'career_mvp_results_v1';

// Career clusters with weights over features
const CLUSTERS = [
  {
    id: 'software',
    name: 'Software Engineering',
    weights: {
      scores: { score10: 0.1, score12: 0.15, cgpa: 0.2 },
      apt: { quant: 0.2, verbal: 0.05, logical: 0.25, spatial: 0.05 },
      traits: { analytical: 0.25, creative: 0.05, social: 0.05, leadership: 0.05 },
      interests: { tech: 0.4 },
      skills: { programming: 0.35, python: 0.15 }
    },
    roles: ['Software Developer', 'Full-Stack Engineer', 'Mobile App Developer'],
    education: ['B.Tech/BE in CSE/IT', 'MCA', 'MS in CS (optional)'],
    courses: ['Data Structures & Algorithms', 'System Design', 'Web Dev (React/Node)']
  },
  {
    id: 'datascience',
    name: 'Data Science & AI/ML',
    weights: {
      scores: { score10: 0.1, score12: 0.15, cgpa: 0.2 },
      apt: { quant: 0.25, verbal: 0.05, logical: 0.25, spatial: 0.05 },
      traits: { analytical: 0.3, creative: 0.05, social: 0.05, leadership: 0.05 },
      interests: { data: 0.4, research: 0.2 },
      skills: { python: 0.2, stats: 0.25, ml: 0.3 }
    },
    roles: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    education: ['B.Tech/BE, BSc, MSc in DS/AI/Stats', 'MS/PG in AI/ML'],
    courses: ['Python for Data Science', 'Statistics', 'ML/DL Fundamentals']
  },
  {
    id: 'business',
    name: 'Business & Management',
    weights: {
      scores: { score10: 0.1, score12: 0.15, cgpa: 0.15 },
      apt: { quant: 0.1, verbal: 0.2, logical: 0.1, spatial: 0.05 },
      traits: { analytical: 0.15, creative: 0.05, social: 0.25, leadership: 0.25 },
      interests: { business: 0.35 },
      skills: { communication: 0.25, leadership: 0.2 }
    },
    roles: ['Business Analyst', 'Product Manager', 'Operations Manager'],
    education: ['BBA/B.Com', 'MBA/PGDM'],
    courses: ['Business Analytics', 'Marketing', 'Finance Basics']
  },
  {
    id: 'design',
    name: 'Design & UX',
    weights: {
      scores: { score10: 0.05, score12: 0.05, cgpa: 0.1 },
      apt: { quant: 0.05, verbal: 0.1, logical: 0.05, spatial: 0.25 },
      traits: { analytical: 0.05, creative: 0.35, social: 0.1, leadership: 0.05 },
      interests: { design: 0.4 },
      skills: { design: 0.35, communication: 0.15 }
    },
    roles: ['UX Designer', 'Product Designer', 'UI Developer'],
    education: ['B.Des', 'M.Des', 'HCI/Interaction Design'],
    courses: ['User Research', 'Figma', 'Interaction Design']
  },
  {
    id: 'health',
    name: 'Healthcare & Bio',
    weights: {
      scores: { score10: 0.1, score12: 0.2, cgpa: 0.15 },
      apt: { quant: 0.1, verbal: 0.1, logical: 0.1, spatial: 0.1 },
      traits: { analytical: 0.2, creative: 0.05, social: 0.2, leadership: 0.05 },
      interests: { health: 0.4 },
      skills: { biology: 0.35, communication: 0.1 }
    },
    roles: ['Clinical Research Associate', 'Biomedical Engineer', 'Public Health Analyst'],
    education: ['MBBS/BDS', 'B.Pharm/BPT', 'Biotech/Biomedical'],
    courses: ['Biostatistics', 'Public Health', 'Bioinformatics']
  },
  {
    id: 'research',
    name: 'Research & Academia',
    weights: {
      scores: { score10: 0.1, score12: 0.1, cgpa: 0.25 },
      apt: { quant: 0.15, verbal: 0.15, logical: 0.15, spatial: 0.1 },
      traits: { analytical: 0.25, creative: 0.15, social: 0.05, leadership: 0.05 },
      interests: { research: 0.5 },
      skills: { stats: 0.15, programming: 0.1 }
    },
    roles: ['Research Assistant', 'PhD Scholar', 'Lecturer'],
    education: ['MSc/MTech', 'PhD'],
    courses: ['Research Methods', 'Academic Writing', 'Advanced Statistics']
  },
  {
    id: 'coreeng',
    name: 'Core Engineering',
    weights: {
      scores: { score10: 0.1, score12: 0.1, cgpa: 0.2 },
      apt: { quant: 0.2, verbal: 0.05, logical: 0.2, spatial: 0.15 },
      traits: { analytical: 0.2, creative: 0.1, social: 0.05, leadership: 0.05 },
      interests: { tech: 0.2, research: 0.1 },
      skills: { mechanical: 0.3 }
    },
    roles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer'],
    education: ['B.Tech/BE in Core Branches'],
    courses: ['Thermo/Mechanics', 'Circuit Design', 'CAD/CAM']
  },
  {
    id: 'finance',
    name: 'Finance',
    weights: {
      scores: { score10: 0.1, score12: 0.15, cgpa: 0.15 },
      apt: { quant: 0.25, verbal: 0.1, logical: 0.2, spatial: 0.05 },
      traits: { analytical: 0.25, creative: 0.05, social: 0.1, leadership: 0.1 },
      interests: { finance: 0.4, business: 0.2 },
      skills: { finance: 0.35, stats: 0.1 }
    },
    roles: ['Financial Analyst', 'Investment Banking Analyst', 'Risk Analyst'],
    education: ['B.Com/BBA', 'MBA (Finance)', 'CFA/FRM'],
    courses: ['Corporate Finance', 'Financial Modeling', 'Accounting']
  },
  {
    id: 'marketing',
    name: 'Marketing & Communications',
    weights: {
      scores: { score10: 0.08, score12: 0.12, cgpa: 0.12 },
      apt: { quant: 0.05, verbal: 0.25, logical: 0.1, spatial: 0.05 },
      traits: { analytical: 0.1, creative: 0.25, social: 0.3, leadership: 0.15 },
      interests: { marketing: 0.45, business: 0.2 },
      skills: { marketing: 0.35, communication: 0.25 }
    },
    roles: ['Digital Marketer', 'Content Strategist', 'Brand Manager'],
    education: ['BA/BBA', 'MBA (Marketing)'],
    courses: ['SEO/SEM', 'Content Strategy', 'Brand Management']
  }
];

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
  return { score10, score12, cgpa, interests, skills, traits, apt };
}

function validateProfile(profile) {
  const errors = [];
  if (Number.isNaN(profile.score10) || profile.score10 < 0 || profile.score10 > 100) errors.push('10th % must be 0–100');
  if (Number.isNaN(profile.score12) || profile.score12 < 0 || profile.score12 > 100) errors.push('12th % must be 0–100');
  if (Number.isNaN(profile.cgpa) || profile.cgpa < 0 || profile.cgpa > 10) errors.push('CGPA must be 0–10');
  if (errors.length) return { ok: false, errors };
  return { ok: true };
}

function normalizeProfile(profile) {
  return {
    scores: {
      score10: profile.score10 / 100,
      score12: profile.score12 / 100,
      cgpa: profile.cgpa / 10
    },
    apt: {
      quant: profile.apt.quant / 100,
      verbal: profile.apt.verbal / 100,
      logical: profile.apt.logical / 100,
      spatial: profile.apt.spatial / 100
    },
    traits: {
      analytical: profile.traits.analytical / 5,
      creative: profile.traits.creative / 5,
      social: profile.traits.social / 5,
      leadership: profile.traits.leadership / 5
    },
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

function classify(profileRaw) {
  const normalized = normalizeProfile(profileRaw);
  const scored = CLUSTERS.map(c => ({ cluster: c, score: scoreCluster(c, normalized) }));
  scored.sort((a, b) => b.score - a.score);
  return { normalized, scored, top: scored.slice(0, 3) };
}

function renderResults(result) {
  resultsContainer.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'card';
  heading.innerHTML = `<h3>Top Recommendations</h3><p class="badge">Model: weighted classification</p>`;
  resultsContainer.appendChild(heading);

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
    resultsContainer.appendChild(card);
  });
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}
function saveResults(res) {
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify({ top: res.top.map(t => ({ id: t.cluster.id, score: t.score })) }));
}
function loadProfile() {
  const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function loadResults() {
  const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function fillForm(profile) {
  if (!profile) return;
  document.getElementById(inputIds.score10).value = profile.score10 ?? '';
  document.getElementById(inputIds.score12).value = profile.score12 ?? '';
  document.getElementById(inputIds.cgpa).value = profile.cgpa ?? '';
  // interests
  const interestContainer = document.getElementById(inputIds.interests);
  Array.from(interestContainer.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
    cb.checked = (profile.interests || []).includes(cb.value);
  });
  // skills
  const skillsContainer = document.getElementById(inputIds.skills);
  Array.from(skillsContainer.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
    cb.checked = (profile.skills || []).includes(cb.value);
  });
  // traits
  document.getElementById(inputIds.traits.analytical).value = profile.traits?.analytical ?? 3;
  document.getElementById(inputIds.traits.creative).value = profile.traits?.creative ?? 3;
  document.getElementById(inputIds.traits.social).value = profile.traits?.social ?? 3;
  document.getElementById(inputIds.traits.leadership).value = profile.traits?.leadership ?? 3;
  // apt
  document.getElementById(inputIds.apt.quant).value = profile.apt?.quant ?? 70;
  document.getElementById(inputIds.apt.verbal).value = profile.apt?.verbal ?? 70;
  document.getElementById(inputIds.apt.logical).value = profile.apt?.logical ?? 70;
  document.getElementById(inputIds.apt.spatial).value = profile.apt?.spatial ?? 70;
}

// Chatbot — simple rule-based intent detection
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function appendMsg(role, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.innerHTML = `<div class="role">${role}</div><div class="bubble">${text}</div>`;
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function getTopClusterFromStorage() {
  const saved = loadResults();
  if (!saved?.top?.length) return null;
  const id = saved.top[0].id;
  return CLUSTERS.find(c => c.id === id) || null;
}

function handleUserQuery(q) {
  const text = q.trim().toLowerCase();
  const top = getTopClusterFromStorage();
  if (!text) return 'Please enter a message.';

  // Simple intents
  if (/(eligib|percent|cgpa|criteria|qualif)/.test(text)) {
    if (top) {
      return `For ${top.name}, strong foundations help. Aim for >= 70% in 10/12 and CGPA >= 7.5. Build the listed skills and projects. Work on the aptitude areas emphasized in recommendations.`;
    }
    return 'Eligibility varies. As a rule of thumb, aim for >= 70% in school and CGPA >= 7.0. Build relevant skills and internships.';
  }
  if (/(roadmap|how to start|start|path|plan)/.test(text)) {
    if (top) {
      return `Roadmap for ${top.name}: 1) Cover fundamentals 2) Take 2-3 courses (${top.courses.join(', ')}) 3) Build 2 projects 4) Publish on GitHub/portfolio 5) Apply for internships.`;
    }
    return 'Pick a target area (e.g., Data Science or Software), take 2-3 core courses, and build small projects to demonstrate skills.';
  }
  if (/(course|skill|learn)/.test(text)) {
    if (top) {
      return `Recommended skills/courses for ${top.name}: ${top.courses.join(', ')}. Practice via projects and online platforms.`;
    }
    return 'Take foundational courses in your area of interest and practice via projects.';
  }
  if (/(job|role|career)/.test(text)) {
    if (top) {
      return `Common roles in ${top.name}: ${top.roles.join(', ')}.`;
    }
    return 'Common graduate roles include Software Developer, Data Analyst, Business Analyst, UX Designer, and more.';
  }
  if (/(compare|vs|difference)/.test(text)) {
    return 'Compare by your strengths: Software favors logical/programming; Data Science favors stats/ML; Design favors creativity/spatial; Business favors leadership/communication.';
  }

  return 'I can help with eligibility, roadmaps, courses, and roles. Try asking: "What is the roadmap?" or "Which skills should I learn?"';
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = chatInput.value;
  if (!msg.trim()) return;
  appendMsg('You', msg);
  const reply = handleUserQuery(msg);
  appendMsg('Advisor', reply);
  chatInput.value = '';
});

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = readProfileFromForm();
  const valid = validateProfile(profile);
  if (!valid.ok) {
    formStatus.textContent = 'Fix: ' + valid.errors.join(', ');
    return;
  }
  saveProfile(profile);
  const res = classify(profile);
  renderResults(res);
  saveResults(res);
  formStatus.textContent = 'Analysis complete. See recommendations tab.';
  activateTab(1);
});

clearBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY_PROFILE);
  localStorage.removeItem(STORAGE_KEY_RESULTS);
  form.reset();
  resultsContainer.innerHTML = '<p>Cleared. Fill the profile and click Analyze.</p>';
  formStatus.textContent = 'Cleared.';
});

// Initial load
(function init() {
  const saved = loadProfile();
  if (saved) fillForm(saved);
  const savedRes = loadResults();
  if (savedRes?.top?.length) {
    const joined = savedRes.top.map(t => CLUSTERS.find(c => c.id === t.id)).filter(Boolean).map((c, i) => ({ cluster: c, score: savedRes.top[i].score }));
    renderResults({ top: joined });
  }
  appendMsg('Advisor', 'Hello! I can help with career guidance. First, fill your profile and click Analyze. Then ask me about roadmaps, eligibility, or skills.');
})();

// --- LOGIN SYSTEM LOGIC ---
const USER_KEY = 'career_mvp_user_v1';
const SESSION_KEY = 'career_mvp_session_v1';

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
}
function saveUserToStorage(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearUserStorage() {
  localStorage.removeItem(USER_KEY);
}
function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

// Modal logic
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const loginFields = modal.querySelector('.modal-login-fields');
  const signupFields = modal.querySelector('.modal-signup-fields');
  const errorDiv = document.getElementById('login-error');
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const loginLink = modal.querySelector('.modal-login-link');
  const signupLink = modal.querySelector('.modal-signup-link');
  let inSignup = false;
  // Show modal logic
  function showAuthModal(show, wantSignup = false) {
    modal.style.display = show ? 'flex' : 'none';
    document.getElementById('auth-overlay').style.display = show ? 'block' : 'none';
    document.body.style.overflow = show ? 'hidden' : '';
    if (show) {
      inSignup = wantSignup;
      switchFormMode(wantSignup);
      errorDiv.textContent = '';
    }
  }
  function switchFormMode(isSignup) {
    inSignup = isSignup;
    if (isSignup) {
      loginFields.style.display = 'none';
      signupFields.style.display = '';
      modalTitle.textContent = 'Create Account';
      submitBtn.textContent = 'Create Account';
      loginLink.style.display = 'none';
      signupLink.style.display = '';
    } else {
      loginFields.style.display = '';
      signupFields.style.display = 'none';
      modalTitle.textContent = 'Login';
      submitBtn.textContent = 'Login';
      loginLink.style.display = '';
      signupLink.style.display = 'none';
    }
    errorDiv.textContent = '';
    loginForm.reset();
  }
  showSignup.addEventListener('click', e => { e.preventDefault(); switchFormMode(true); });
  showLogin.addEventListener('click', e => { e.preventDefault(); switchFormMode(false); });

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!inSignup) {
      // LOGIN
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const user = getUserFromStorage();
      if (!user || user.email !== email || user.password !== password) {
        errorDiv.textContent = 'Invalid credentials.';
        return;
      }
      setSession(email);
      showAuthModal(false);
      // Hide login link, show logout
      const loginNavLink = document.getElementById('login-nav-link');
      if (loginNavLink) loginNavLink.style.display = 'none';
      // Restore tab nav and links
      document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
        el.tabIndex = '';
      });
      // extra: forcibly hide overlay
      try { document.getElementById('auth-overlay').style.display = 'none'; } catch(e){}
      document.body.style.overflow = '';
      renderLogoutLink(user); // show logout option
    } else {
      // SIGNUP
      const first = document.getElementById('signup-first').value.trim();
      const last = document.getElementById('signup-last').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      if (!first || !last || !email || !password) {
        errorDiv.textContent = 'All fields are required.';
        return;
      }
      const user = getUserFromStorage();
      if (user && user.email === email) {
        errorDiv.textContent = 'Account already exists with this email.';
        return;
      }
      saveUserToStorage({ first, last, email, password });
      setSession(email);
      showAuthModal(false);
      // Hide login link, show logout
      const loginNavLink = document.getElementById('login-nav-link');
      if (loginNavLink) loginNavLink.style.display = 'none';
      // Restore tab nav and links
      document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
        el.tabIndex = '';
      });
      // extra: forcibly hide overlay
      try { document.getElementById('auth-overlay').style.display = 'none'; } catch(e){}
      document.body.style.overflow = '';
      renderLogoutLink({ first, last, email });
    }
  });
  // Show modal on startup unless session
  const loginNavLink = document.getElementById('login-nav-link');
  if (!getSession()) {
    // Show login link in nav
    if (loginNavLink) loginNavLink.style.display = '';
    // Optionally show modal, or let users click login link
    // showAuthModal(true);
    // Block tab nav and links
    // document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    //   if (!el.closest('#auth-modal')) el.tabIndex = -1;
    // });
  } else {
    // Already logged in, hide login link and show logout
    if (loginNavLink) loginNavLink.style.display = 'none';
    let user = getUserFromStorage();
    renderLogoutLink(user);
  }
});
// Add logout link on header
function renderLogoutLink(user) {
  let existing = document.getElementById('logout-link');
  if (existing) existing.remove();
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const a = document.createElement('a');
  a.id = 'logout-link';
  a.style.marginLeft = '22px';
  a.style.color = 'var(--primary)';
  a.style.cursor = 'pointer';
  a.textContent = user?.first ? `Logout (${user.first})` : 'Logout';
  a.addEventListener('click', function(e) {
    e.preventDefault();
    clearSession();
    // Optionally clear user: clearUserStorage();
    // Show login link again
    const loginNavLink = document.getElementById('login-nav-link');
    if (loginNavLink) loginNavLink.style.display = '';
    location.reload();
  });
  nav.appendChild(a);
}


