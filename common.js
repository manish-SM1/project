// Shared utilities and active nav handling
const STORAGE_KEY_PROFILE = 'career_mvp_profile_v1';
const STORAGE_KEY_RESULTS = 'career_mvp_results_v1';

function hasAuthSession() {
  const authUser = localStorage.getItem('career_ai_user');
  const session = localStorage.getItem('career_mvp_session_v1');
  const user = localStorage.getItem('career_mvp_user_v1');
  return Boolean(authUser) || (Boolean(session) && Boolean(user));
}

function enforceAuthGuard() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const publicPages = new Set(['login.html', 'monkey-login.html']);

  if (publicPages.has(page)) return;
  if (!hasAuthSession()) {
    window.location.replace('login.html');
  }
}

function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(a => {
    const isActive = a.getAttribute('href') === path;
    a.classList.toggle('active', isActive);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  enforceAuthGuard();
  setActiveNav();
});


