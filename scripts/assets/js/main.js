/*=============== LOGIN FORM ===============*/
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const otpVerificationForm = document.getElementById('otpVerificationForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');

const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');
const backToForgot = document.getElementById('backToForgot');
const backToLoginFromReset = document.getElementById('backToLoginFromReset');
const resendOtp = document.getElementById('resend-otp');

// Password visibility toggles
const loginEye = document.getElementById('login-eye');
const registerEye = document.getElementById('register-eye');
const registerConfirmEye = document.getElementById('register-confirm-eye');

// Method toggles (Email/Mobile)
const loginMethodBtns = loginForm?.querySelectorAll('.method-btn');
const registerMethodBtns = registerForm?.querySelectorAll('.method-btn');
const forgotMethodBtns = forgotPasswordForm?.querySelectorAll('.method-btn');

// Input fields
const loginIdentifier = document.getElementById('login-identifier');
const loginLabel = document.getElementById('login-label');
const registerIdentifier = document.getElementById('register-identifier');
const registerLabel = document.getElementById('register-label');
const forgotIdentifier = document.getElementById('forgot-identifier');
const forgotLabel = document.getElementById('forgot-label');

/*=============== FORM TOGGLE WITH ANIMATIONS ===============*/
function switchForm(hideForm, showForm) {
   if (!hideForm || !showForm) return;

   // Fade out current form
   hideForm.style.opacity = '0';
   hideForm.style.transform = 'translateY(-20px)';
   hideForm.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

   setTimeout(() => {
      hideForm.style.display = 'none';

      // Show new form with animation
      showForm.style.display = 'block';
      showForm.style.opacity = '0';
      showForm.style.transform = 'translateY(20px)';

      // Force reflow
      showForm.offsetHeight;

      // Fade in new form
      setTimeout(() => {
         showForm.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
         showForm.style.opacity = '1';
         showForm.style.transform = 'translateY(0)';
      }, 50);
   }, 400);
}

if (showRegister) {
   showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchForm(loginForm, registerForm);
      if (forgotPasswordForm) switchForm(forgotPasswordForm, registerForm);
   });
}

if (showLogin) {
   showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchForm(registerForm, loginForm);
      if (forgotPasswordForm) switchForm(forgotPasswordForm, loginForm);
   });
}

if (forgotPasswordLink) {
   forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchForm(loginForm, forgotPasswordForm);
      if (registerForm) switchForm(registerForm, forgotPasswordForm);
   });
}

if (backToLogin) {
   backToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchForm(forgotPasswordForm, loginForm);
      // Clear any errors
      const forgotError = document.getElementById('forgot-error');
      const forgotSuccess = document.getElementById('forgot-success');
      if (forgotError) forgotError.textContent = '';
      if (forgotSuccess) forgotSuccess.textContent = '';
   });
}

/*=============== PASSWORD VISIBILITY ===============*/
if (loginEye) {
   loginEye.addEventListener('click', () => {
      const loginPass = document.getElementById('login-pass');
      const icon = loginEye.classList.contains('ri-eye-off-line');

      if (icon) {
         loginEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
         loginPass.setAttribute('type', 'text');
      } else {
         loginEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
         loginPass.setAttribute('type', 'password');
      }
   });
}

if (registerEye) {
   registerEye.addEventListener('click', () => {
      const registerPass = document.getElementById('register-pass');
      const icon = registerEye.classList.contains('ri-eye-off-line');

      if (icon) {
         registerEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
         registerPass.setAttribute('type', 'text');
      } else {
         registerEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
         registerPass.setAttribute('type', 'password');
      }
   });
}

if (registerConfirmEye) {
   registerConfirmEye.addEventListener('click', () => {
      const registerConfirmPass = document.getElementById('register-confirm-pass');
      const icon = registerConfirmEye.classList.contains('ri-eye-off-line');

      if (icon) {
         registerConfirmEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
         registerConfirmPass.setAttribute('type', 'text');
      } else {
         registerConfirmEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
         registerConfirmPass.setAttribute('type', 'password');
      }
   });
}

/*=============== METHOD TOGGLE (EMAIL/MOBILE) ===============*/
function handleMethodToggle(buttons, inputField, labelField, formType) {
   if (!buttons || !inputField || !labelField) return;

   buttons.forEach(btn => {
      btn.addEventListener('click', () => {
         // Remove active class from all buttons
         buttons.forEach(b => b.classList.remove('active'));
         // Add active class to clicked button
         btn.classList.add('active');

         const method = btn.getAttribute('data-method');

         if (method === 'email') {
            inputField.setAttribute('type', 'email');
            inputField.setAttribute('placeholder', ' ');
            labelField.textContent = 'Email';
            inputField.setAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
         } else if (method === 'mobile') {
            inputField.setAttribute('type', 'tel');
            inputField.setAttribute('placeholder', ' ');
            labelField.textContent = 'Mobile Number';
            inputField.setAttribute('pattern', '[0-9]{10,15}');
         }

         // Clear input when switching
         inputField.value = '';
         inputField.focus();
      });
   });
}

// Apply method toggle to all forms
handleMethodToggle(loginMethodBtns, loginIdentifier, loginLabel, 'login');
handleMethodToggle(registerMethodBtns, registerIdentifier, registerLabel, 'register');
handleMethodToggle(forgotMethodBtns, forgotIdentifier, forgotLabel, 'forgot');

/*=============== AUTH INTEGRATION ===============*/
// Check if user is already logged in and show logged in state
function checkExistingSession() {
   try {
      const sessionKey = localStorage.getItem('career_mvp_session_v1');
      const user = getUserFromStorage();

      if (sessionKey && user) {
         // User is logged in, show logged in state
         showLoggedInState(user);
         return true;
      }
   } catch (e) {
      // Continue if there's an error
   }
   return false;
}

// Show logged in state
function showLoggedInState(user) {
   const loggedInState = document.getElementById('loggedInState');
   const loginForm = document.getElementById('loginForm');
   const registerForm = document.getElementById('registerForm');
   const forgotPasswordForm = document.getElementById('forgotPasswordForm');

   if (loggedInState) {
      // Hide all forms
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'none';
      if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';

      // Show logged in state
      loggedInState.style.display = 'block';
      loggedInState.style.opacity = '0';
      loggedInState.style.transform = 'scale(0.9)';
      loggedInState.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      // Update user info
      const userInfo = document.getElementById('loggedInUserInfo');
      if (userInfo) {
         const name = user.first ? `${user.first} ${user.last || ''}`.trim() : user.email || 'User';
         userInfo.textContent = `Logged in as ${name}`;
         if (user.email) {
            userInfo.innerHTML = `Logged in as <strong>${name}</strong><br><small style="color: var(--text-color-light);">${user.email}</small>`;
         }
      }

      // Animate in
      setTimeout(() => {
         loggedInState.style.opacity = '1';
         loggedInState.style.transform = 'scale(1)';
      }, 100);
   }
}

// Logout function
function handleLogout() {
   // Clear session
   localStorage.removeItem('career_mvp_session_v1');

   // Optionally clear user data (comment out if you want to keep it)
   // localStorage.removeItem('career_mvp_user_v1');

   // Reload page to show login form
   window.location.reload();
}

// Check on page load
document.addEventListener('DOMContentLoaded', () => {
   // Check for active session
   setTimeout(() => {
      const sessionKey = localStorage.getItem('career_mvp_session_v1');
      const user = getUserFromStorage();

      if (sessionKey && user) {
         // User is logged in, show logged in state
         showLoggedInState(user);
      }
   }, 100);

   // Setup logout button
   const logoutBtn = document.getElementById('logoutBtn');
   if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
   }

   // Setup OTP inputs if form exists
   if (otpVerificationForm) {
      setupOTPInputs();
   }

   // Clear any error messages when switching forms
   if (loginError) loginError.textContent = '';
   if (registerError) registerError.textContent = '';
});

// Helper functions for auth (compatible with existing system)
function getUserFromStorage() {
   try {
      const user = localStorage.getItem('career_mvp_user_v1');
      return user ? JSON.parse(user) : null;
   } catch {
      return null;
   }
}

function saveUserToStorage(user) {
   localStorage.setItem('career_mvp_user_v1', JSON.stringify(user));
}

function setSession(email) {
   localStorage.setItem('career_mvp_session_v1', email);
   // Also use auth.js if available
   if (typeof loginUser !== 'undefined') {
      const user = getUserFromStorage();
      if (user) loginUser(user);
   }
}

/*=============== FORM VALIDATION ===============*/
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

if (loginForm) {
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginError.textContent = '';

      const identifier = loginIdentifier.value.trim();
      const password = document.getElementById('login-pass').value;
      const activeMethod = loginForm.querySelector('.method-btn.active')?.getAttribute('data-method');

      // Validation
      if (activeMethod === 'email') {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(identifier)) {
            loginError.textContent = 'Please enter a valid email address';
            return;
         }
      } else if (activeMethod === 'mobile') {
         const mobileRegex = /^[0-9]{10,15}$/;
         if (!mobileRegex.test(identifier)) {
            loginError.textContent = 'Please enter a valid mobile number (10-15 digits)';
            return;
         }
      }

      if (password.length < 6) {
         loginError.textContent = 'Password must be at least 6 characters long';
         return;
      }

      // Check credentials against stored users
      const user = getUserFromStorage();

      // Show loading state
      const submitBtn = loginForm.querySelector('.login__button');
      if (submitBtn) {
         submitBtn.classList.add('loading');
         submitBtn.disabled = true;
      }

      // For email login
      if (activeMethod === 'email') {
         if (!user || user.email !== identifier || user.password !== password) {
            if (submitBtn) {
               submitBtn.classList.remove('loading');
               submitBtn.disabled = false;
            }
            loginError.textContent = 'Invalid email or password';
            return;
         }
         // Successful login
         setTimeout(() => {
            setSession(identifier);
            window.location.href = 'learning.html';
         }, 500);
      } else {
         // For mobile login - check if mobile matches stored user
         if (!user || user.mobile !== identifier || user.password !== password) {
            if (submitBtn) {
               submitBtn.classList.remove('loading');
               submitBtn.disabled = false;
            }
            loginError.textContent = 'Invalid mobile number or password';
            return;
         }
         // Successful login
         setTimeout(() => {
            setSession(user.email || identifier);
            window.location.href = 'learning.html';
         }, 500);
      }
   });
}

if (registerForm) {
   registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      registerError.textContent = '';

      const name = document.getElementById('register-name').value.trim();
      const identifier = registerIdentifier.value.trim();
      const password = document.getElementById('register-pass').value;
      const confirmPassword = document.getElementById('register-confirm-pass').value;
      const activeMethod = registerForm.querySelector('.method-btn.active')?.getAttribute('data-method');
      const termsAccepted = document.getElementById('register-check').checked;

      // Validation
      if (name.length < 2) {
         registerError.textContent = 'Please enter your full name';
         return;
      }

      if (activeMethod === 'email') {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(identifier)) {
            registerError.textContent = 'Please enter a valid email address';
            return;
         }
      } else if (activeMethod === 'mobile') {
         const mobileRegex = /^[0-9]{10,15}$/;
         if (!mobileRegex.test(identifier)) {
            registerError.textContent = 'Please enter a valid mobile number (10-15 digits)';
            return;
         }
      }

      if (password.length < 6) {
         registerError.textContent = 'Password must be at least 6 characters long';
         return;
      }

      if (password !== confirmPassword) {
         registerError.textContent = 'Passwords do not match';
         return;
      }

      if (!termsAccepted) {
         registerError.textContent = 'Please accept the Terms & Conditions';
         return;
      }

      // Check if user already exists
      const existingUser = getUserFromStorage();
      if (existingUser) {
         if (activeMethod === 'email' && existingUser.email === identifier) {
            registerError.textContent = 'An account with this email already exists';
            return;
         }
         if (activeMethod === 'mobile' && existingUser.mobile === identifier) {
            registerError.textContent = 'An account with this mobile number already exists';
            return;
         }
      }

      // Split name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create user object
      const newUser = {
         first: firstName,
         last: lastName,
         email: activeMethod === 'email' ? identifier : (existingUser?.email || ''),
         mobile: activeMethod === 'mobile' ? identifier : (existingUser?.mobile || ''),
         password: password
      };

      // Show loading state
      const submitBtn = registerForm.querySelector('.login__button');
      if (submitBtn) {
         submitBtn.classList.add('loading');
         submitBtn.disabled = true;
      }

      // Save user
      saveUserToStorage(newUser);

      // Auto-login after registration
      setTimeout(() => {
         setSession(activeMethod === 'email' ? identifier : newUser.email || identifier);
         window.location.href = 'learning.html';
      }, 500);
   });
}

/*=============== EMAIL SENDING FUNCTION ===============*/
// Send OTP via Backend API
async function sendOTPEmail(email, otp) {
   try {
      const response = await fetch('http://localhost:3000/api/send-otp', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            email: email,
            otp: otp
         })
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || 'Failed to send email');
      }

      return data;
   } catch (error) {
      console.error('Email sending error:', error);
      throw error;
   }
}

/*=============== OTP FUNCTIONS ===============*/
// Generate 6-digit OTP
function generateOTP() {
   return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiration (5 minutes)
function storeOTP(identifier, otp) {
   const otpData = {
      otp: otp,
      identifier: identifier,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
   };
   localStorage.setItem('password_reset_otp', JSON.stringify(otpData));
}

// Verify OTP
function verifyOTP(enteredOTP, identifier) {
   const storedData = localStorage.getItem('password_reset_otp');
   if (!storedData) return false;

   const otpData = JSON.parse(storedData);

   // Check if expired
   if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem('password_reset_otp');
      return false;
   }

   // Check if identifier matches
   if (otpData.identifier !== identifier) {
      return false;
   }

   // Check if OTP matches
   return otpData.otp === enteredOTP;
}

// Clear OTP
function clearOTP() {
   localStorage.removeItem('password_reset_otp');
}

// OTP Timer
let otpTimerInterval = null;
function startOTPTimer(seconds = 300) {
   const timerElement = document.getElementById('otp-timer');
   if (!timerElement) return;

   let timeLeft = seconds;

   if (otpTimerInterval) {
      clearInterval(otpTimerInterval);
   }

   otpTimerInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      timerElement.textContent = `Resend OTP in ${minutes}:${secs.toString().padStart(2, '0')}`;

      if (timeLeft <= 0) {
         clearInterval(otpTimerInterval);
         timerElement.textContent = '';
         const resendBtn = document.getElementById('resend-otp');
         if (resendBtn) {
            resendBtn.style.display = 'inline';
         }
      }

      timeLeft--;
   }, 1000);
}

// Switch to OTP form
function switchToOTPForm(identifier, showOTP = false, otp = '') {
   const otpEmailDisplay = document.getElementById('otp-email-display');
   const otpDisplayBox = document.getElementById('otp-display-box');
   const otpDisplayValue = document.getElementById('otp-display-value');

   if (otpEmailDisplay) {
      otpEmailDisplay.textContent = identifier;
   }

   // Show/hide OTP display box
   if (otpDisplayBox && otpDisplayValue) {
      if (showOTP && otp) {
         otpDisplayBox.style.display = 'block';
         otpDisplayValue.textContent = otp;
      } else {
         otpDisplayBox.style.display = 'none';
      }
   }

   // Hide resend button initially
   const resendBtn = document.getElementById('resend-otp');
   if (resendBtn) {
      resendBtn.style.display = 'none';
   }

   // Start timer
   startOTPTimer(300);

   // Clear OTP inputs
   document.querySelectorAll('.otp-input').forEach(input => input.value = '');

   // Focus first input
   setTimeout(() => {
      const firstInput = document.getElementById('otp-1');
      if (firstInput) firstInput.focus();
   }, 100);

   // Switch form
   switchForm(forgotPasswordForm, otpVerificationForm);
}

// Setup OTP Input Fields
function setupOTPInputs() {
   const otpInputs = document.querySelectorAll('.otp-input');

   otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
         const value = e.target.value;
         if (value && /[0-9]/.test(value)) {
            if (index < otpInputs.length - 1) {
               otpInputs[index + 1].focus();
            }
         }
      });

      input.addEventListener('keydown', (e) => {
         if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
         }
      });

      input.addEventListener('paste', (e) => {
         e.preventDefault();
         const pastedData = e.clipboardData.getData('text').trim();
         if (/^\d{6}$/.test(pastedData)) {
            pastedData.split('').forEach((digit, i) => {
               if (otpInputs[i]) {
                  otpInputs[i].value = digit;
               }
            });
            otpInputs[5].focus();
         }
      });
   });
}

/*=============== FORGOT PASSWORD FORM ===============*/
if (forgotPasswordForm) {
   forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const forgotError = document.getElementById('forgot-error');
      const forgotSuccess = document.getElementById('forgot-success');
      if (forgotError) forgotError.textContent = '';
      if (forgotSuccess) forgotSuccess.textContent = '';

      const identifier = forgotIdentifier.value.trim();
      const activeMethod = forgotPasswordForm.querySelector('.method-btn.active')?.getAttribute('data-method');

      // Validation
      if (activeMethod === 'email') {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(identifier)) {
            if (forgotError) forgotError.textContent = 'Please enter a valid email address';
            return;
         }
      } else if (activeMethod === 'mobile') {
         const mobileRegex = /^[0-9]{10,15}$/;
         if (!mobileRegex.test(identifier)) {
            if (forgotError) forgotError.textContent = 'Please enter a valid mobile number (10-15 digits)';
            return;
         }
      }

      // Check if user exists (for reference, but we'll send OTP anyway for testing)
      const user = getUserFromStorage();
      const identifierToCheck = activeMethod === 'email' ? 'email' : 'mobile';

      // Generate OTP
      const otp = generateOTP();
      storeOTP(identifier, otp);

      // Show success message and send OTP
      if (forgotSuccess) {
         // Try to send email via Backend API
         if (activeMethod === 'email') {
            // Show loading
            forgotSuccess.innerHTML = `Sending OTP to <strong>${identifier}</strong>...`;

            sendOTPEmail(identifier, otp).then(() => {
               forgotSuccess.innerHTML = `✅ OTP sent to <strong>${identifier}</strong>!<br><small style="color: var(--text-color-light);">Check your inbox (and spam folder).</small>`;

               // Switch to OTP form without showing OTP
               setTimeout(() => {
                  switchToOTPForm(identifier, false);
               }, 1500);
            }).catch((error) => {
               // If email fails, show OTP on screen for testing
               console.error('Email sending failed:', error);
               forgotSuccess.innerHTML = `⚠️ Email sending failed. Your OTP is: <strong style="color: var(--first-color); font-size: 1.2rem;">${otp}</strong><br><small style="color: var(--text-color-light);">(Make sure backend server is running and Gmail is configured)</small>`;

               // Switch to OTP form and show OTP
               setTimeout(() => {
                  switchToOTPForm(identifier, true, otp);
               }, 2000);
            });
         } else {
            // For mobile, show OTP on screen (no SMS service)
            forgotSuccess.innerHTML = `📱 Your OTP is: <strong style="color: var(--first-color); font-size: 1.2rem;">${otp}</strong><br><small style="color: var(--text-color-light);">(SMS service not configured)</small>`;
            setTimeout(() => {
               switchToOTPForm(identifier, true, otp);
            }, 2000);
         }
      }
   });
}

/*=============== OTP VERIFICATION FORM ===============*/
if (otpVerificationForm) {
   // Setup OTP inputs
   setupOTPInputs();

   otpVerificationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const otpError = document.getElementById('otp-error');
      if (otpError) otpError.textContent = '';

      // Get OTP from inputs
      const otpInputs = document.querySelectorAll('.otp-input');
      const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');

      if (enteredOTP.length !== 6) {
         if (otpError) otpError.textContent = 'Please enter the complete 6-digit OTP';
         return;
      }

      // Get identifier from stored data
      const storedData = localStorage.getItem('password_reset_otp');
      if (!storedData) {
         if (otpError) otpError.textContent = 'OTP expired. Please request a new one.';
         return;
      }

      const otpData = JSON.parse(storedData);
      const identifier = otpData.identifier;

      // Verify OTP
      if (verifyOTP(enteredOTP, identifier)) {
         // OTP verified, switch to password reset form
         switchForm(otpVerificationForm, resetPasswordForm);
         // Clear timer
         if (otpTimerInterval) {
            clearInterval(otpTimerInterval);
         }
      } else {
         if (otpError) otpError.textContent = 'Invalid OTP. Please try again.';
         // Clear inputs
         otpInputs.forEach(input => input.value = '');
         otpInputs[0].focus();
      }
   });

   // Resend OTP
   if (resendOtp) {
      resendOtp.addEventListener('click', (e) => {
         e.preventDefault();

         const storedData = localStorage.getItem('password_reset_otp');
         if (!storedData) return;

         const otpData = JSON.parse(storedData);
         const identifier = otpData.identifier;

         // Generate new OTP
         const newOTP = generateOTP();
         storeOTP(identifier, newOTP);

         // Show success message
         const otpError = document.getElementById('otp-error');
         if (otpError) {
            otpError.style.color = '#48bb78';
            otpError.textContent = 'New OTP sent!';
            setTimeout(() => {
               otpError.textContent = '';
               otpError.style.color = '#FC6464';
            }, 3000);
         }

         // Clear inputs and focus first
         document.querySelectorAll('.otp-input').forEach(input => input.value = '');
         document.getElementById('otp-1').focus();

         // Hide resend button and start timer
         resendOtp.style.display = 'none';
         startOTPTimer(300);

         // Try to send email if it's email method
         if (identifier.includes('@')) {
            sendOTPEmail(identifier, newOTP).then(() => {
               const otpError = document.getElementById('otp-error');
               if (otpError) {
                  otpError.style.color = '#48bb78';
                  otpError.textContent = '✅ New OTP sent to your email!';
                  setTimeout(() => {
                     otpError.textContent = '';
                     otpError.style.color = '#FC6464';
                  }, 3000);
               }

               // Hide OTP display
               const otpDisplayBox = document.getElementById('otp-display-box');
               if (otpDisplayBox) otpDisplayBox.style.display = 'none';
            }).catch(() => {
               // If email fails, show OTP on screen
               showOTPOnScreen(newOTP);
            });
         } else {
            // For mobile, show OTP
            showOTPOnScreen(newOTP);
         }

         // Clear inputs and focus first
         document.querySelectorAll('.otp-input').forEach(input => input.value = '');
         document.getElementById('otp-1').focus();
      });
   }
}

// Show OTP on screen
function showOTPOnScreen(otp) {
   const otpError = document.getElementById('otp-error');
   const otpDisplayBox = document.getElementById('otp-display-box');
   const otpDisplayValue = document.getElementById('otp-display-value');

   if (otpDisplayBox && otpDisplayValue) {
      otpDisplayBox.style.display = 'block';
      otpDisplayValue.textContent = otp;
   }

   if (otpError) {
      otpError.style.color = '#48bb78';
      otpError.textContent = 'New OTP generated! (See above)';
      setTimeout(() => {
         otpError.textContent = '';
         otpError.style.color = '#FC6464';
      }, 3000);
   }
}

/*=============== RESET PASSWORD FORM ===============*/
if (resetPasswordForm) {
   // Password visibility for reset form
   const resetEye = document.getElementById('reset-eye');
   const resetConfirmEye = document.getElementById('reset-confirm-eye');

   if (resetEye) {
      resetEye.addEventListener('click', () => {
         const resetPass = document.getElementById('reset-pass');
         const icon = resetEye.classList.contains('ri-eye-off-line');

         if (icon) {
            resetEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
            resetPass.setAttribute('type', 'text');
         } else {
            resetEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
            resetPass.setAttribute('type', 'password');
         }
      });
   }

   if (resetConfirmEye) {
      resetConfirmEye.addEventListener('click', () => {
         const resetConfirmPass = document.getElementById('reset-confirm-pass');
         const icon = resetConfirmEye.classList.contains('ri-eye-off-line');

         if (icon) {
            resetConfirmEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
            resetConfirmPass.setAttribute('type', 'text');
         } else {
            resetConfirmEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
            resetConfirmPass.setAttribute('type', 'password');
         }
      });
   }

   resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const resetError = document.getElementById('reset-error');
      if (resetError) resetError.textContent = '';

      const newPassword = document.getElementById('reset-pass').value;
      const confirmPassword = document.getElementById('reset-confirm-pass').value;

      // Validation
      if (newPassword.length < 6) {
         if (resetError) resetError.textContent = 'Password must be at least 6 characters long';
         return;
      }

      if (newPassword !== confirmPassword) {
         if (resetError) resetError.textContent = 'Passwords do not match';
         return;
      }

      // Get identifier from stored OTP data
      const storedData = localStorage.getItem('password_reset_otp');
      if (!storedData) {
         if (resetError) resetError.textContent = 'Session expired. Please start over.';
         return;
      }

      const otpData = JSON.parse(storedData);
      const identifier = otpData.identifier;

      // Determine if it's email or mobile
      const isEmail = identifier.includes('@');

      // Get existing user or create new one
      let user = getUserFromStorage();

      if (!user) {
         // Create new user object
         user = {
            first: '',
            last: '',
            email: isEmail ? identifier : '',
            mobile: isEmail ? '' : identifier,
            password: newPassword
         };
      } else {
         // Update existing user
         const identifierKey = isEmail ? 'email' : 'mobile';

         // Update the identifier if it doesn't match
         if (user[identifierKey] !== identifier) {
            user[identifierKey] = identifier;
         }

         // Update password
         user.password = newPassword;
      }

      // Save user to storage
      saveUserToStorage(user);

      // Clear OTP
      clearOTP();

      // Show success and redirect
      if (resetError) {
         resetError.style.color = '#48bb78';
         resetError.textContent = '✅ Password reset successful! Redirecting to login...';
      }

      setTimeout(() => {
         switchForm(resetPasswordForm, loginForm);
         if (resetError) {
            resetError.textContent = '';
            resetError.style.color = '#FC6464';
         }
      }, 2000);
   });
}

/*=============== INPUT ANIMATION ===============*/
// Ensure labels animate properly on page load if inputs have values
document.querySelectorAll('.login__input').forEach(input => {
   if (input.value) {
      input.classList.add('has-value');
   }

   input.addEventListener('input', function () {
      if (this.value) {
         this.classList.add('has-value');
      } else {
         this.classList.remove('has-value');
      }
   });
});
