# Step-by-Step Guide: Setup Email OTP for Gmail

## 📋 Prerequisites
- Gmail account: siripurapumanish@gmail.com
- Node.js installed
- Backend server file (server.js)

---

## Step 1: Install Nodemailer Package

1. Open your terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd C:\Users\Manish\OneDrive\Desktop\project
   ```
3. Install nodemailer:
   ```bash
   npm install nodemailer
   ```
4. If that fails, try:
   ```bash
   npm install nodemailer --force
   ```
5. Wait for installation to complete (you should see "added 1 package")

---

## Step 2: Enable 2-Step Verification on Gmail

1. Open your web browser
2. Go to: **https://myaccount.google.com/**
3. Click on **Security** in the left sidebar
4. Scroll down to "How you sign in to Google"
5. Find **2-Step Verification**
6. Click on it
7. If it's OFF:
   - Click **Get Started**
   - Follow the prompts to enable it
   - You'll need your phone number
8. If it's already ON, skip to Step 3

---

## Step 3: Create Gmail App Password

1. Still on the Google Account Security page
2. Scroll down to "2-Step Verification" section
3. Click on **App passwords** (below 2-Step Verification)
4. You might need to sign in again
5. Under "Select app", choose: **Mail**
6. Under "Select device", choose: **Other (Custom name)**
7. Type: **CareerAI Server**
8. Click **Generate**
9. **IMPORTANT**: Copy the 16-character password that appears
   - It will look like: `abcd efgh ijkl mnop`
   - Copy it exactly (you can remove spaces)
   - Example: `abcdefghijklmnop`
10. Click **Done**

---

## Step 4: Update Server.js File

1. Open `server.js` in your code editor
2. Find this section (around line 300-310):
   ```javascript
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.GMAIL_USER || 'siripurapumanish@gmail.com',
       pass: process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD'
     }
   });
   ```
3. Replace `'YOUR_APP_PASSWORD'` with your 16-character app password
   - Example: `pass: process.env.GMAIL_APP_PASSWORD || 'abcdefghijklmnop'`
4. Save the file (Ctrl+S)

---

## Step 5: Start the Backend Server

1. Open terminal/command prompt
2. Make sure you're in the project folder:
   ```bash
   cd C:\Users\Manish\OneDrive\Desktop\project
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. You should see:
   ```
   ✅ Email server is ready to send messages
   🚀 Server running on http://localhost:3000
   📚 API available at http://localhost:3000/api
   ```
5. **Keep this terminal window open** - the server must keep running

---

## Step 6: Test the OTP Email

1. Open a new browser window/tab
2. Open your login page:
   - File path: `C:\Users\Manish\OneDrive\Desktop\project\login.html`
   - Or double-click `login.html` in file explorer
3. Click on **"Forgot Password?"** link
4. Make sure **Email** tab is selected (not Mobile)
5. Enter your email: **siripurapumanish@gmail.com**
6. Click **"Send OTP"** button
7. Wait a few seconds
8. Check your Gmail inbox:
   - Go to: https://mail.google.com
   - Look for email from: siripurapumanish@gmail.com
   - Subject: "Password Reset OTP - CareerAI"
   - **Also check Spam folder** if not in inbox
9. The email will contain a 6-digit OTP code

---

## Step 7: Verify OTP

1. On the login page, you should see the OTP verification form
2. Enter the 6-digit OTP from your email
3. Click **"Verify OTP"**
4. If correct, you'll see the password reset form
5. Enter your new password
6. Confirm password
7. Click **"Reset Password"**

---

## ✅ Success Checklist

- [ ] Nodemailer installed successfully
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password created and copied
- [ ] server.js updated with App Password
- [ ] Backend server running (shows "Email server is ready")
- [ ] OTP email received in Gmail inbox
- [ ] OTP verification working

---

## 🔧 Troubleshooting

### Problem: "Email configuration error" in server console
**Solution:**
- Double-check your App Password (16 characters, no spaces)
- Make sure 2-Step Verification is enabled
- Try creating a new App Password

### Problem: No email received
**Solution:**
- Check Spam/Junk folder
- Wait 1-2 minutes (emails can be delayed)
- Check server console for error messages
- Verify email address is correct: siripurapumanish@gmail.com

### Problem: "Cannot connect to server" error
**Solution:**
- Make sure backend server is running (Step 5)
- Check that server is on port 3000
- Try refreshing the login page

### Problem: npm install fails
**Solution:**
- Try: `npm install nodemailer --force`
- Or: `npm install nodemailer@6.9.7 --legacy-peer-deps`
- Make sure you have internet connection

---

## 📝 Quick Reference

**Your Gmail:** siripurapumanish@gmail.com  
**Server Port:** 3000  
**Server URL:** http://localhost:3000  
**OTP API:** http://localhost:3000/api/send-otp  

---

## 🎉 You're Done!

Once you complete all steps, OTP emails will be sent automatically to your Gmail when users request password reset.

**Remember:** Keep the backend server running while testing!
