// AI-like chat with typo correction, fuzzy intents, and typing effect

const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const webToggle = document.getElementById('web-use');
const webSettingsBtn = document.getElementById('web-settings-btn');
const webSettings = document.getElementById('web-settings');
const webProvider = document.getElementById('web-provider');
const webApiKey = document.getElementById('web-api-key');
const webCx = document.getElementById('web-cx');
// AI controls (were referenced but not defined)
const aiToggle = document.getElementById('ai-use');
const llmProvider = document.getElementById('llm-provider');
const llmModel = document.getElementById('llm-model');
const llmApiKey = document.getElementById('llm-api-key');

// Conversation memory (persisted)
const CHAT_MEMORY_KEY = 'career_mvp_chat_memory_v1';
const MAX_MEMORY_MESSAGES = 14; // ~7 turns
const CONVO_MEMORY = loadMemory();
function loadMemory() {
  try {
    const raw = localStorage.getItem(CHAT_MEMORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(-MAX_MEMORY_MESSAGES) : [];
  } catch { return []; }
}
function saveMemory() {
  try { localStorage.setItem(CHAT_MEMORY_KEY, JSON.stringify(CONVO_MEMORY.slice(-MAX_MEMORY_MESSAGES))); } catch {}
}
function pushMemory(role, content) {
  if (!content) return;
  const text = String(content).slice(0, 4000);
  CONVO_MEMORY.push({ role, content: text });
  while (CONVO_MEMORY.length > MAX_MEMORY_MESSAGES) CONVO_MEMORY.shift();
  saveMemory();
}
function getRecentMemory(maxTurns = 5) {
  const maxMessages = Math.max(2, Math.min(10, maxTurns * 2));
  return CONVO_MEMORY.slice(-maxMessages);
}
function extractLinks(text) {
  if (!text) return [];
  const urls = text.match(/https?:\/\/[^\s)]+/g) || [];
  // de-duplicate and clamp
  const unique = Array.from(new Set(urls));
  return unique.slice(0, 3);
}

const CLUSTERS_MAP = {
  software: { name: 'Software Engineering', roles: ['Software Developer', 'Full-Stack Engineer', 'Mobile App Developer'], courses: ['DSA', 'System Design', 'Web Dev (React/Node)'] },
  datascience: { name: 'Data Science & AI/ML', roles: ['Data Scientist', 'ML Engineer', 'Data Analyst'], courses: ['Python DS', 'Statistics', 'ML/DL'] },
  business: { name: 'Business & Management', roles: ['Business Analyst', 'Product Manager', 'Operations Manager'], courses: ['Business Analytics', 'Marketing', 'Finance Basics'] },
  design: { name: 'Design & UX', roles: ['UX Designer', 'Product Designer', 'UI Developer'], courses: ['User Research', 'Figma', 'Interaction Design'] },
  health: { name: 'Healthcare & Bio', roles: ['Clinical Research Associate', 'Biomedical Engineer', 'Public Health Analyst'], courses: ['Biostatistics', 'Public Health', 'Bioinformatics'] },
  research: { name: 'Research & Academia', roles: ['Research Assistant', 'PhD Scholar', 'Lecturer'], courses: ['Research Methods', 'Academic Writing', 'Advanced Statistics'] },
  coreeng: { name: 'Core Engineering', roles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer'], courses: ['Mechanics', 'Circuit Design', 'CAD/CAM'] },
  finance: { name: 'Finance', roles: ['Financial Analyst', 'Investment Banking Analyst', 'Risk Analyst'], courses: ['Corporate Finance', 'Financial Modeling', 'Accounting'] },
  marketing: { name: 'Marketing & Communications', roles: ['Digital Marketer', 'Content Strategist', 'Brand Manager'], courses: ['SEO/SEM', 'Content Strategy', 'Brand Management'] }
};

function appendMsg(role, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.innerHTML = `<div class="role">${role}</div><div class="bubble"></div>`;
  const bubble = wrap.querySelector('.bubble');
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
  return { bubble, wrap };
}

async function typeText(node, text, speed = 10) {
  node.textContent = '';
  for (let i = 0; i < text.length; i++) {
    node.textContent += text[i];
    await new Promise(r => setTimeout(r, speed));
  }
}

// Basic tokenizer for ML intent model
function tokenizeText(text) {
  const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9+#\.\-\s]/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean);
}

function loadTopCluster() {
  const raw = localStorage.getItem('career_mvp_results_v1');
  if (!raw) return null;
  try { const res = JSON.parse(raw); return res.top?.[0]?.id || null; } catch { return null; }
}

// Levenshtein distance
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

const KEYWORDS = [
  'eligibility','criteria','percent','percentage','cgpa','requirement','cutoff',
  'roadmap','start','path','plan','steps',
  'course','courses','skill','skills','learn',
  'job','jobs','role','roles','career','careers',
  'compare','difference','vs','versus','internship','internships','salary','salaries'
];

function autocorrect(input) {
  const tokens = input.split(/\s+/);
  const corrected = tokens.map(t => {
    if (t.length <= 3) return t;
    let best = t, bestDist = Infinity;
    for (const k of KEYWORDS) {
      const d = levenshtein(t.toLowerCase(), k);
      if (d < bestDist) { best = k; bestDist = d; }
    }
    return bestDist <= 2 ? best : t;
  });
  return corrected.join(' ');
}

function detectIntent(text) {
  const q = text.toLowerCase();
  const hasAny = (...words) => words.some(w => q.includes(w));
  if (hasAny('trend','trends','latest','demand','market','2025')) return 'trends';
  if (hasAny('roadmap','learning path','learn','how to become','syllabus','path','plan','steps')) return 'roadmap';
  if (hasAny('eligible','eligibility','criteria','percent','percentage','cgpa','requirement','cutoff')) return 'eligibility';
  if (hasAny('skill','skills','course','courses','learn')) return 'skills';
  if (hasAny('job','jobs','role','roles','career','careers')) return 'roles';
  if (hasAny('compare','difference','vs','versus')) return 'compare';
  if (hasAny('internship','internships')) return 'internship';
  if (hasAny('salary','salaries','ctc','pay','package')) return 'salary';
  if (hasAny('hello','hi','hey')) return 'greet';
  return 'generic';
}

function extractTopic(text) {
  const lower = text.toLowerCase();
  // Remove common intent words
  const stop = ['roadmap','learning','learn','path','plan','steps','guide','guides','trend','trends','latest','news','2025','for','in','to','a','an','the','about','of'];
  const tokens = lower.split(/[^a-z0-9.+#]+/).filter(Boolean).filter(t => !stop.includes(t));
  // Pick the longest remaining token as topic heuristic
  let topic = '';
  tokens.forEach(t => { if (t.length > topic.length) topic = t; });
  return topic || lower.trim();
}

function buildEnrichedQuery(intent, text) {
  const topic = extractTopic(text);
  if (intent === 'roadmap') return `${topic} roadmap 2025 syllabus learning path projects best practices`;
  if (intent === 'trends') return `${topic} latest trends 2025 demand jobs salary frameworks`; 
  return text;
}

function synthesizeRoadmap(topic) {
  const t = topic || 'the topic';
  return (
    `Roadmap for ${t} (practical):\n` +
    `1) Prerequisites: Programming basics, Git, CLI, VS Code/IDE\n` +
    `2) Core ${t}: Syntax, types, control flow, collections, OOP\n` +
    `3) Advanced ${t}: Generics, errors, concurrency/threads, I/O, performance\n` +
    `4) Build tools & testing: Build/run, unit tests, package management\n` +
    `5) Ecosystem: Popular frameworks/libraries, ORM/DB, HTTP/REST\n` +
    `6) Projects: 2 small + 1 capstone; deploy to cloud; README + tests\n` +
    `7) Quality: Clean code, debugging, profiling, logging, CI/CD\n` +
    `8) Portfolio & interview: Resume, GitHub, DSA/system design basics\n` +
    `Suggested weekly plan: 8–10 weeks; 70% hands-on, 30% theory.`
  );
}

function synthesizeTrends(topic) {
  const t = topic || 'technology';
  return (
    `Trends in ${t}:\n` +
    `- Hiring: Focus on practical experience, projects, and cloud-native skills\n` +
    `- Ecosystem: Framework consolidation, tooling maturity, security-by-default\n` +
    `- Platforms: Cloud, containerization, serverless, and managed services\n` +
    `- Data & AI: Integration into apps; MLOps and evaluation culture\n` +
    `- Careers: Portfolio > certificates; OSS contributions valued`
  );
}

// ===== Supervised intent classifier (NB + TF) and requirement extraction =====
const INTENT_TRAINING = [
  { label: 'roadmap', text: 'roadmap for java backend developer learning path java spring boot microservices projects syllabus' },
  { label: 'roadmap', text: 'how to learn react frontend roadmap steps guide 2025' },
  { label: 'roadmap', text: 'become data scientist roadmap python pandas machine learning ml projects' },
  { label: 'trends', text: 'latest trends in ai and machine learning 2025 market demand jobs frameworks' },
  { label: 'trends', text: 'current trends in java ecosystem spring quarkus kotlin adoption' },
  { label: 'compare', text: 'compare react vs angular vs vue differences which to choose' },
  { label: 'salary', text: 'software engineer salary packages ctc india usa 2025' },
  { label: 'internship', text: 'data science internship how to get internship tips' },
  { label: 'generic', text: 'explain what is microservices and monolith difference' },
  { label: 'generic', text: 'what is kubernetes and why use it' },
];

let NB_INTENT_MODEL = null;
function buildNbIntentModel() {
  if (NB_INTENT_MODEL) return NB_INTENT_MODEL;
  const alpha = 1;
  const docsByLabel = {};
  const vocab = new Set();
  for (const ex of INTENT_TRAINING) {
    const toks = tokenizeText(ex.text);
    docsByLabel[ex.label] = (docsByLabel[ex.label] || []).concat(toks);
    toks.forEach(t => vocab.add(t));
  }
  const labels = Object.keys(docsByLabel);
  const totalDocs = INTENT_TRAINING.length;
  const prior = {};
  labels.forEach(l => { prior[l] = Math.log((docsByLabel[l].length + alpha) / (totalDocs + alpha * labels.length)); });
  const cond = {};
  const V = vocab.size;
  labels.forEach(l => {
    const counts = Object.create(null);
    let total = 0;
    docsByLabel[l].forEach(t => { counts[t] = (counts[t] || 0) + 1; total++; });
    const table = Object.create(null);
    vocab.forEach(v => { table[v] = Math.log(((counts[v] || 0) + alpha) / (total + alpha * V)); });
    cond[l] = table;
  });
  NB_INTENT_MODEL = { labels, prior, cond, vocab, alpha, V };
  return NB_INTENT_MODEL;
}

function classifyIntentML(text) {
  const m = buildNbIntentModel();
  const toks = tokenizeText(text);
  const scores = m.labels.map(l => {
    let s = m.prior[l];
    toks.forEach(t => { if (m.cond[l][t] != null) s += m.cond[l][t]; });
    return { label: l, score: s };
  });
  // softmax probs
  const max = Math.max(...scores.map(s => s.score));
  const exps = scores.map(s => Math.exp(s.score - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  const ranked = scores.map((s, i) => ({ label: s.label, prob: exps[i] / sum, score: s.score }))
    .sort((a, b) => b.prob - a.prob);
  return { top: ranked[0], ranked };
}

function extractRequirements(text) {
  const lower = text.toLowerCase();
  const techList = ['java','python','javascript','typescript','react','angular','vue','node','spring','spring boot','django','flask','kotlin','go','rust','flutter','android','ios','aws','azure','gcp','devops','docker','kubernetes','ml','ai','data science','sql','mongodb'];
  let tech = '';
  for (const t of techList.sort((a,b)=>b.length-a.length)) {
    if (lower.includes(t)) { tech = t; break; }
  }
  let level = '';
  if (/beginner|entry|start/i.test(text)) level = 'beginner';
  else if (/intermediate|mid/i.test(text)) level = 'intermediate';
  else if (/advanced|expert/i.test(text)) level = 'advanced';
  const timeframeWeeks = (() => {
    const m = text.match(/(\d{1,2})\s*(weeks|week|wks)/i) || text.match(/(\d{1,2})\s*(months|month|mons)/i);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (!n) return null;
    return /month/i.test(m[2]) ? n * 4 : n;
  })();
  const year = (() => { const y = text.match(/20\d{2}/); return y ? parseInt(y[0],10) : null; })();
  const topic = extractTopic(text);
  return { tech, level, timeframeWeeks, year, topic };
}

function synthesizeRoadmapAdvanced(slots) {
  const { tech, level, timeframeWeeks, topic } = slots;
  const t = tech || topic || 'the topic';
  const weeks = timeframeWeeks || (level === 'beginner' ? 10 : level === 'advanced' ? 6 : 8);
  const header = `Roadmap for ${t} (${level || 'general'}, ~${weeks} weeks):`;
  const common = [
    `Setup: IDE, Git, CLI, project structure`,
    `Core ${t}: syntax, types, control flow, collections`,
    `Advanced ${t}: modules, errors, performance`,
    `Ecosystem: popular frameworks/libraries`,
    `Data & APIs: DB basics + HTTP/REST`,
    `Testing & quality: unit tests, linting, formatting`,
    `Deployment: simple cloud deploy`,
    `Projects: 2 small + 1 capstone with README and CI`
  ];
  let specialization = [];
  if (t.includes('java')) specialization = [`Backend: Spring Boot basics`, `Persistence: JPA/Hibernate`, `Build: Maven/Gradle`, `Security: Auth/JWT`, `Microservices overview`];
  else if (t.includes('react')) specialization = [`Frontend: React fundamentals (hooks, state)`, `Routing, forms, API calls`, `Bundling & performance`, `Testing with RTL`, `Deploy on Vercel/Netlify`];
  else if (t.includes('data') || t.includes('ml') || t.includes('ai') || t.includes('python')) specialization = [`Python DS stack: NumPy/Pandas`, `ML basics: scikit-learn`, `Model eval & validation`, `Mini MLOps: notebooks -> scripts`, `One end-to-end project`];
  const body = common.concat(specialization);
  return header + "\n- " + body.join("\n- ");
}

async function ddgSearch(q) {
  // Use DuckDuckGo Instant Answer API (JSON). Note: limited; may need CORS-friendly proxy.
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`; 
  const res = await fetch(url);
  if (!res.ok) throw new Error('DDG failed');
  const data = await res.json();
  const parts = [];
  if (data.AbstractText) parts.push(data.AbstractText);
  if (data.RelatedTopics && data.RelatedTopics.length) {
    const rt = data.RelatedTopics.slice(0, 3).map(rt => (rt.Text || '')).filter(Boolean);
    if (rt.length) parts.push('Related: ' + rt.join(' • '));
  }
  return parts.join('\n');
}

async function wikipediaSearch(q) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wikipedia failed');
  const data = await res.json();
  return data.extract || '';
}

async function tavilySearch(q, apiKey) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ query: q, include_answer: true })
  });
  if (!res.ok) throw new Error('Tavily failed');
  const data = await res.json();
  return data.answer || (data.results?.[0]?.content || '');
}

async function googleSearch(q, apiKey, cx) {
  // Google Custom Search JSON API
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google failed');
  const data = await res.json();
  const items = data.items || [];
  const snippets = items.slice(0, 3).map(it => `- ${it.title}: ${it.snippet} (${it.link})`).join('\n');
  return snippets || 'No results found on Google.';
}

async function webAnswer(q) {
  const provider = webProvider?.value || 'duckduckgo';
  try {
    if (provider === 'google') return await googleSearch(q, webApiKey?.value || '', webCx?.value || '');
    if (provider === 'tavily') return await tavilySearch(q, webApiKey?.value || '');
    if (provider === 'wikipedia') return await wikipediaSearch(q);
    return await ddgSearch(q);
  } catch (e) {
    // Fallback chain
    if (provider !== 'google') {
      try { return await googleSearch(q, webApiKey?.value || '', webCx?.value || ''); } catch {}
    }
    if (provider !== 'wikipedia') {
      try { return await wikipediaSearch(q); } catch {}
    }
    if (provider !== 'duckduckgo') {
      try { return await ddgSearch(q); } catch {}
    }
    return 'Sorry, web search failed due to network/CORS. Try a different provider or disable Use Internet.';
  }
}

async function aiAnswer(messagesOrPrompt, context = '') {
  const provider = llmProvider?.value || 'openrouter';
  const apiKey = llmApiKey?.value || '';
  const model = llmModel?.value || (provider === 'openai' ? 'gpt-4o-mini' : 'openrouter/auto');
  if (!apiKey) throw new Error('LLM key missing');
  const sys = 'You are an expert career and tech assistant. Provide concise, accurate answers. If sources are provided, use and cite them tersely.';
  const messages = Array.isArray(messagesOrPrompt)
    ? [{ role: 'system', content: sys }, ...messagesOrPrompt]
    : [
        { role: 'system', content: sys },
        context ? { role: 'system', content: `Context:\n${context}` } : null,
        { role: 'user', content: messagesOrPrompt }
      ].filter(Boolean);
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 600 })
    });
    if (!res.ok) throw new Error('OpenAI failed');
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } else {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 600 })
    });
    if (!res.ok) throw new Error('OpenRouter failed');
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

async function aiAnswerStream(messages) {
  const provider = llmProvider?.value || 'openrouter';
  const apiKey = llmApiKey?.value || '';
  const model = llmModel?.value || (provider === 'openai' ? 'gpt-4o-mini' : 'openrouter/auto');
  if (!apiKey) throw new Error('LLM key missing');
  const url = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: 'You are an expert career and tech assistant.' }, ...messages], temperature: 0.2, max_tokens: 700, stream: true })
  });
  if (!res.ok || !res.body) throw new Error('LLM stream failed');
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  return {
    async nextChunk(onChunk) {
      const { value, done } = await reader.read();
      if (done) return { done: true };
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const ev of events) {
        const lines = ev.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) onChunk(delta);
          } catch {}
        }
      }
      return { done: false };
    },
    async close() { try { reader.cancel(); } catch {} }
  };
}

function composeAiMessages(intent, slots, webSnippets, userText, topId) {
  const meta = topId ? CLUSTERS_MAP[topId] : null;
  const cluster = meta?.name || 'unknown';
  const guidance = [
    `User intent: ${intent}`,
    `Slots: tech=${slots.tech || ''}; level=${slots.level || ''}; timeframeWeeks=${slots.timeframeWeeks || ''}; topic=${slots.topic || ''}; year=${slots.year || ''}`,
    `Profile cluster: ${cluster}`,
    `Instructions: Be specific and concise. Prefer practical steps. If sources are present, include a final line starting with "Sources:" followed by up to 3 links.`
  ].join('\n');
  const msgs = [];
  if (webSnippets) msgs.push({ role: 'system', content: `Sources and snippets:\n${webSnippets}` });
  msgs.push({ role: 'system', content: guidance });
  const memory = getRecentMemory(3);
  memory.forEach(m => msgs.push(m));
  msgs.push({ role: 'user', content: userText });
  return msgs;
}

function respond(intent, context) {
  const top = context.topId;
  const meta = top ? CLUSTERS_MAP[top] : null;
  const name = meta?.name || 'your target field';
  switch (intent) {
    case 'greet':
      return 'Hello! I can help with a personalized roadmap, eligibility, courses, and roles. Ask me anything.';
    case 'eligibility':
      return `For ${name}, focus on strong fundamentals. Aim for ≥ 70% in 10/12 and CGPA ≥ 7.5. Pair this with relevant projects and internships.`;
    case 'roadmap':
      return `Professional roadmap for ${name}: 1) Cover fundamentals 2) Complete 2–3 curated courses 3) Build 2 portfolio projects 4) Publish on GitHub/LinkedIn 5) Apply to internships 6) Iterate with feedback.`;
    case 'skills':
      return meta ? `In-demand skills for ${meta.name}: ${meta.courses.join(', ')}. Complement with problem-solving and communication.` : 'Pick 2–3 core courses, practice consistently, and build small projects to consolidate skills.';
    case 'roles':
      return meta ? `Typical roles in ${meta.name}: ${meta.roles.join(', ')}.` : 'Common graduate roles: Software Developer, Data Analyst, Business Analyst, UX Designer, and more.';
    case 'compare':
      return 'Compare by strengths: Software → programming/DSA; Data Science → stats/ML; Design → creativity/research; Business → communication/leadership.';
    case 'internship':
      return 'Target early internships by showcasing 2 compact projects, an updated resume, and a clear LinkedIn profile. Apply widely and tailor applications.';
    case 'salary':
      return 'Compensation varies by region and company. Focus on building demonstrable skills and projects; this has the highest impact on offers.';
    default:
      return 'I provide guidance on roadmaps, eligibility, skills, roles, internships, and more. Please reframe your question for clarity.';
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = chatInput.value;
  if (!raw.trim()) return;
  const user = appendMsg('You', raw);
  user.bubble.textContent = raw;
  pushMemory('user', raw);

  const topId = loadTopCluster();
  const corrected = autocorrect(raw);
  const system = appendMsg('Advisor', '');
  try {
  const preface = corrected !== raw ? `Interpreting: ${corrected}\n\n` : '';
    // ML intent classification and slot extraction
    const mlIntent = classifyIntentML(corrected);
    const intent = (mlIntent.top?.prob || 0) >= 0.35 ? mlIntent.top.label : detectIntent(corrected);
    const slots = extractRequirements(corrected);
    const enriched = buildEnrichedQuery(intent, corrected);
    let ans = '';
    let webSnippets = '';
    if (webToggle?.checked) {
      webSnippets = await webAnswer(enriched);
    }
    if (aiToggle?.checked) {
      // Try streaming first
      try {
        const msgs = composeAiMessages(intent, slots, webSnippets, corrected, topId);
        system.bubble.textContent = preface;
        const stream = await aiAnswerStream(msgs);
        let finished = false;
        while (!finished) {
          const { done } = await stream.nextChunk((chunk) => {
            system.bubble.textContent += chunk;
            chatLog.scrollTop = chatLog.scrollHeight;
          });
          finished = done;
        }
        ans = system.bubble.textContent.slice(preface.length);
      } catch (e) {
        // fallback to non-streaming AI
        try {
          const msgs = composeAiMessages(intent, slots, webSnippets, corrected, topId);
          ans = await aiAnswer(msgs);
          await typeText(system.bubble, preface + ans, 6);
        } catch {}
      }
    }
    if (!ans) {
      if (webSnippets) ans = webSnippets;
    }
    if (!ans || /No (results|definitive answer)/i.test(ans)) {
      // Use structured offline responses before generic fallback
      if (intent === 'roadmap') ans = synthesizeRoadmapAdvanced(slots);
      else if (intent === 'trends') ans = synthesizeTrends(slots.topic || slots.tech);
      else ans = respond(intent, { topId });
      await typeText(system.bubble, preface + ans, 6);
    }
    const links = extractLinks(webSnippets);
    if (links.length) {
      const suffix = `\n\nSources: ${links.join(', ')}`;
      system.bubble.textContent += suffix;
    }
    pushMemory('assistant', system.bubble.textContent);
  } catch (err) {
    system.bubble.textContent = 'Sorry, there was an error answering. Try again or change search provider in settings.';
  }
  chatInput.value = '';
});

(function greet(){
  const m = appendMsg('Advisor', '');
  typeText(m.bubble, 'Welcome! Ask about eligibility, a stepwise roadmap, skills/courses, roles, internships, and more. I adapt answers to your saved profile.', 8);
})();

// UI wiring for settings fold
webSettingsBtn?.addEventListener('click', () => {
  if (!webSettings) return;
  webSettings.style.display = webSettings.style.display === 'none' ? 'block' : 'none';
});


