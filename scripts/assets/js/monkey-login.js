// Monkey Login Animation Script - Enhanced for All Forms
document.addEventListener('DOMContentLoaded', function () {
    // Get all forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpVerificationForm = document.getElementById('otpVerificationForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Get robot element
    const robot = document.querySelector('.robot-container');
    const pupils = document.querySelectorAll('.robot-pupil');

    // Track mouse movement for pupil following
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        updatePupils();
    });

    // Update pupil positions to follow cursor
    function updatePupils() {
        if (!robot || robot.classList.contains('covering')) return;

        pupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distance = Math.min(5, Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 30);

            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    }

    // Handle all password inputs
    const passwordInputs = [
        { input: document.getElementById('login-pass'), eye: document.getElementById('login-eye') },
        { input: document.getElementById('register-pass'), eye: document.getElementById('register-eye') },
        { input: document.getElementById('register-confirm-pass'), eye: document.getElementById('register-confirm-eye') },
        { input: document.getElementById('reset-pass'), eye: document.getElementById('reset-eye') },
        { input: document.getElementById('reset-confirm-pass'), eye: document.getElementById('reset-confirm-eye') }
    ];

    // Setup password visibility toggles
    passwordInputs.forEach(({ input, eye }) => {
        if (!input || !eye) return;

        // Password input focus - robot covers eyes
        input.addEventListener('focus', function () {
            if (robot) {
                robot.classList.add('covering');
                robot.classList.remove('peeking');
            }
        });

        input.addEventListener('blur', function () {
            if (robot) {
                robot.classList.remove('covering');
                robot.classList.remove('peeking');
            }
        });

        // Password input typing - robot peeks
        let typingTimer;
        input.addEventListener('input', function () {
            clearTimeout(typingTimer);
            if (robot) {
                robot.classList.remove('covering');
                robot.classList.add('peeking');
            }

            typingTimer = setTimeout(function () {
                if (document.activeElement === input && robot) {
                    robot.classList.add('covering');
                    robot.classList.remove('peeking');
                }
            }, 500);
        });

        // Eye icon click to toggle password visibility
        eye.addEventListener('click', function () {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            if (eye.classList.contains('ri-eye-off-line')) {
                eye.classList.replace('ri-eye-off-line', 'ri-eye-line');
            } else {
                eye.classList.replace('ri-eye-line', 'ri-eye-off-line');
            }
        });
    });

    // Handle email/mobile inputs - robot watches normally
    const emailInputs = [
        document.getElementById('login-identifier'),
        document.getElementById('register-name'),
        document.getElementById('register-identifier'),
        document.getElementById('forgot-identifier')
    ];

    emailInputs.forEach(input => {
        if (!input) return;

        input.addEventListener('focus', function () {
            if (robot) {
                robot.classList.remove('covering');
                robot.classList.remove('peeking');
            }
        });

        input.addEventListener('blur', function () {
            if (robot) {
                robot.classList.remove('covering');
                robot.classList.remove('peeking');
            }
        });
    });

    // Handle method toggle buttons (Email/Mobile)
    const methodToggles = document.querySelectorAll('.method-toggle');
    methodToggles.forEach(toggle => {
        const buttons = toggle.querySelectorAll('.method-btn');
        const form = toggle.closest('form');

        if (!form) return;

        let identifierInput, iconLabel;

        if (form.id === 'loginForm') {
            identifierInput = document.getElementById('login-identifier');
            iconLabel = document.getElementById('login-icon');
        } else if (form.id === 'registerForm') {
            identifierInput = document.getElementById('register-identifier');
            iconLabel = document.getElementById('register-icon');
        } else if (form.id === 'forgotPasswordForm') {
            identifierInput = document.getElementById('forgot-identifier');
            iconLabel = document.getElementById('forgot-icon');
        }

        buttons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active from all buttons in this toggle
                buttons.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                btn.classList.add('active');

                const method = btn.getAttribute('data-method');

                if (identifierInput && iconLabel) {
                    if (method === 'email') {
                        identifierInput.type = 'email';
                        identifierInput.placeholder = 'Email';
                        iconLabel.className = 'fa fa-envelope';
                    } else if (method === 'mobile') {
                        identifierInput.type = 'tel';
                        identifierInput.placeholder = 'Mobile Number';
                        iconLabel.className = 'fa fa-phone';
                    }
                    identifierInput.value = '';
                    identifierInput.focus();
                }
            });
        });
    });

    // Add smooth animations on page load
    setTimeout(function () {
        const visibleForm = document.querySelector('.form:not([style*="display: none"])');
        if (visibleForm) {
            visibleForm.style.animation = 'fadeInUp 0.6s ease';
        }
    }, 100);

    // Handle Enter key navigation
    const allInputs = document.querySelectorAll('input[type="email"], input[type="tel"], input[type="text"], input[type="password"]');
    allInputs.forEach((input, index) => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = input.closest('form');
                const formInputs = Array.from(form.querySelectorAll('input:not([type="checkbox"])'));
                const currentIndex = formInputs.indexOf(input);

                if (currentIndex < formInputs.length - 1) {
                    formInputs[currentIndex + 1].focus();
                } else {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.click();
                }
            }
        });
    });

    // OTP Input handling
    const otpInputs = document.querySelectorAll('.otp-input');
    if (otpInputs.length > 0) {
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', function (e) {
                const value = e.target.value;
                if (value && /[0-9]/.test(value)) {
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', function (e) {
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

    // Reset robot state when switching forms
    const formLinks = document.querySelectorAll('a[id^="show"], a[id^="back"]');
    formLinks.forEach(link => {
        link.addEventListener('click', function () {
            setTimeout(() => {
                if (robot) {
                    robot.classList.remove('covering');
                    robot.classList.remove('peeking');
                }
            }, 100);
        });
    });
});
