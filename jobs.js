const CLUSTERS = [
  { id: 'software', name: 'Software Engineering', roles: ['Software Developer', 'Full-Stack Engineer', 'Mobile App Developer'] },
  { id: 'datascience', name: 'Data Science & AI/ML', roles: ['Data Scientist', 'ML Engineer', 'Data Analyst'] },
  { id: 'business', name: 'Business & Management', roles: ['Business Analyst', 'Product Manager', 'Operations Manager'] },
  { id: 'design', name: 'Design & UX', roles: ['UX Designer', 'Product Designer', 'UI Developer'] },
  { id: 'health', name: 'Healthcare & Bio', roles: ['Clinical Research Associate', 'Biomedical Engineer', 'Public Health Analyst'] },
  { id: 'research', name: 'Research & Academia', roles: ['Research Assistant', 'PhD Scholar', 'Lecturer'] },
  { id: 'coreeng', name: 'Core Engineering', roles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer'] },
  { id: 'finance', name: 'Finance', roles: ['Financial Analyst', 'Investment Banking Analyst', 'Risk Analyst'] },
  { id: 'marketing', name: 'Marketing & Communications', roles: ['Digital Marketer', 'Content Strategist', 'Brand Manager'] }
];
function loadResults() {
  try { return JSON.parse(localStorage.getItem('career_mvp_results_v1')) || null; } catch { return null; }
}
function clusterById(id) {
  return CLUSTERS.find(c => c.id === id);
}

function renderExtraJobsSection(results) {
  const extraDiv = document.getElementById('jobs-extra-section');
  if (!results || !results.top || !results.top.length) return;
  let html = '';
  results.top.slice(0, 3).forEach(item => {
    const cluster = clusterById(item.id);
    if (!cluster) return;
    html += `<div class="card">
      <h3 style="margin-bottom:6px;">${cluster.name} extra job boards</h3>
      <div style="display:grid;gap:8px;">${cluster.roles.map(role => `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>${role}</span>
          <a class="btn ghost" href="https://in.indeed.com/jobs?q=${encodeURIComponent(role)}" target="_blank" title="Indeed">Indeed</a>
          <a class="btn ghost" href="https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}" target="_blank" title="Glassdoor">Glassdoor</a>
          <a class="btn ghost" href="https://www.monsterindia.com/srp/results?query=${encodeURIComponent(role)}" target="_blank" title="Monster">Monster</a>
        </div>
      `).join('')}</div>
    </div>`;
  });
  html += `<div class="card" style="color:var(--muted);font-size:13px;">Live Indeed scraping is experimental and may depend on site permissions. Use the provided links for best experience.</div>`;
  extraDiv.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('jobs-grid');
  let results = loadResults();
  if (!results || !results.top || !results.top.length) {
    grid.innerHTML = '<div class="card"><b>No recommendations found.</b><br>Go to the Profile section, fill your details, and click Analyze to get personalized job suggestions.</div>';
    return;
  }
  results.top.slice(0, 3).forEach(item => {
    const cluster = clusterById(item.id);
    if (!cluster) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2 style="margin-bottom:10px;">${cluster.name}</h2>
      <div style="display:grid;gap:12px;">
        ${cluster.roles.map(role => `
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span>${role}</span>
            <a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}" target="_blank" rel="noopener" class="btn ghost" title="Search on LinkedIn">LinkedIn</a>
            <a href="https://www.naukri.com/${encodeURIComponent(role.replace(/ /g, '-').toLowerCase())}-jobs" target="_blank" rel="noopener" class="btn ghost" title="Search on Naukri.com">Naukri.com</a>
          </div>
        `).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
  renderExtraJobsSection(results);
});
