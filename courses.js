// courses.js - Frontend - Fetches from Backend API
const API_BASE_URL = 'http://localhost:3000/api';

const ICON_MAP = {
  html: '🌐',
  css: '🎨',
  javascript: '🟨',
  typescript: '🔷',
  python: '🐍',
  c: '🧩',
  cpp: '➕',
  java: '☕',
  react: '⚛️',
  nodejs: '🟢',
  django: '🌿',
  sql: '🗄️',
  mongodb: '🍃',
  postgresql: '🐘',
  git: '🔧',
  docker: '🐳',
  aws: '☁️'
};

function getCourseIcon(courseId) {
  return ICON_MAP[courseId] || '📘';
}

async function fetchCoursesCatalog() {
  const response = await fetch(`${API_BASE_URL}/courses-catalog`);
  if (!response.ok) {
    throw new Error('Unable to load courses catalog');
  }
  return response.json();
}

// Course selection handler
function handleCourseClick(courseId) {
  window.location.href = `learning.html?course=${courseId}`;
}

// Check backend connection
async function checkBackendStatus() {
  const statusEl = document.getElementById('status-text');
  if (!statusEl) return;

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      statusEl.textContent = '✅ Connected (Course Content API Online)';
      statusEl.style.color = '#10b981';
    } else {
      throw new Error('Offline');
    }
  } catch (error) {
    statusEl.textContent = '❌ Course Server Offline - Check Terminal';
    statusEl.style.color = '#ef4444';
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', function () {
  checkBackendStatus();

  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  fetchCoursesCatalog()
    .then((courses) => {
      courses.forEach(course => {
        const courseId = course.courseId;
        const progress = JSON.parse(localStorage.getItem(`mastery_progress_${courseId}`) || '[]');
        const masteredCount = progress.length;
        const icon = getCourseIcon(courseId);

        const tile = document.createElement('div');
        tile.className = 'icon-tile course-tile';
        tile.tabIndex = 0;
        tile.innerHTML = `
          <div style="font-size:2rem; line-height:1; margin-bottom:8px;">${icon}</div>
          <span style="font-size:1.09em;font-weight:600;">${course.name}</span>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:5px; font-weight:600;">${course.topicCount} TOPICS</div>
          ${masteredCount > 0 ? `<div style="font-size:0.75rem; color:#10b981; margin-top:5px; font-weight:700;">PRO PROGRESS: ${masteredCount} MASTERED</div>` : ''}
          <button class="btn primary" style="margin-top:10px;width:100%;">${masteredCount > 0 ? 'Continue Master Path' : 'Start Mastery Path'}</button>
        `;
        tile.addEventListener('click', () => handleCourseClick(courseId));
        tile.addEventListener('keypress', (e) => { if (e.key === "Enter") handleCourseClick(courseId); });
        grid.appendChild(tile);
      });
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:#ef4444;">Unable to load course catalog. Please check server.</p>';
    });
});

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white; padding: 12px 20px; border-radius: 8px;
    z-index: 2000; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}
