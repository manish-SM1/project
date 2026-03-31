# Email Setup Guide for OTP Sending

## Step 1: Install Dependencies

Run this command in your project directory:

```bash
npm install nodemailer
```

## Step 2: Create Gmail App Password

Since you're using Gmail (siripurapumanish@gmail.com), you need to create an App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "Signing in to Google", enable **2-Step Verification** (if not already enabled)
4. After enabling 2-Step Verification, go back to Security
5. Under "Signing in to Google", click on **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)**
8. Enter name: **CareerAI Server**
9. Click **Generate**
10. **Copy the 16-character password** (you'll need this)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root (or set environment variables):

```env
GMAIL_USER=siripurapumanish@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here
PORT=3000
```

**OR** you can directly edit `server.js` and replace:
- Line with `process.env.GMAIL_USER || 'siripurapumanish@gmail.com'` - your email is already there
- Line with `process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD'` - replace `YOUR_APP_PASSWORD` with your 16-character app password

## Step 4: Start the Server

```bash
node server.js
```

You should see:
```
✅ Email server is ready to send messages
🚀 Server running on http://localhost:3000
```

## Step 5: Test

1. Open your login page
2. Click "Forgot Password?"
3. Enter your email: siripurapumanish@gmail.com
4. Click "Send OTP"
5. Check your Gmail inbox (and spam folder)

## Troubleshooting

### If you see "Email configuration error":
- Make sure you created an App Password (not your regular Gmail password)
- Make sure 2-Step Verification is enabled
- Check that the App Password is correct (16 characters, no spaces)

### If emails don't arrive:
- Check spam folder
- Make sure the backend server is running
- Check server console for error messages
- Verify the email address is correct

### If you get CORS errors:
- Make sure the backend server is running on port 3000
- Check that CORS is enabled in server.js (it should be)

## Security Note

⚠️ **Never commit your `.env` file or App Password to Git!**

Add `.env` to your `.gitignore` file.
