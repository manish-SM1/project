// auth.js

const AUTH_KEY = "career_ai_user";

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) !== null;
}

// Save user session
function loginUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

// Logout user
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

// Get logged-in user
function getUser() {
  return JSON.parse(localStorage.getItem(AUTH_KEY));
}
