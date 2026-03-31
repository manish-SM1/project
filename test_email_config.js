const nodemailer = require('nodemailer');

async function verifyEmailConfig() {
    console.log('Testing email configuration...');
    
    // Credentials from server.js
    const user = 'siripurapumanish@gmail.com';
    const pass = 'wwipwiabrqwoxtkj'; 

    console.log(`Using user: ${user}`);
    // console.log(`Using pass: ${pass}`); // Don't log password

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });

        await transporter.verify();
        console.log('✅ Email configuration is VALID!');
        console.log('You can now start the server with: node server.js');
    } catch (error) {
        console.error('❌ Email configuration FAILED:', error.message);
        console.log('\nPossible causes:');
        console.log('1. The App Password "wwipwiabrqwoxtkj" is invalid or expired.');
        console.log('2. 2-Step Verification is not enabled on the Gmail account.');
        console.log('3. You are using your login password instead of an App Password.');
    }
}

verifyEmailConfig();
