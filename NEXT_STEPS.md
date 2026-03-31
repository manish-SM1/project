# ✅ Step 1 Complete! Next Steps:

## ✅ What's Done:
- ✓ Nodemailer installed successfully
- ✓ 134 packages installed
- ⚠️ 1 moderate vulnerability (can fix later with `npm audit fix --force`)

---

## 📋 Next Steps:

### Step 2: Create Gmail App Password

1. **Open your browser** and go to:
   ```
   https://myaccount.google.com/security
   ```

2. **Enable 2-Step Verification** (if not already):
   - Click on "2-Step Verification"
   - Follow the setup if it's not enabled

3. **Create App Password**:
   - Scroll to "2-Step Verification" section
   - Click **"App passwords"**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: **CareerAI Server**
   - Click **Generate**
   - **COPY the 16-character password** (looks like: `abcd efgh ijkl mnop`)

---

### Step 3: Update server.js

1. **Open** `server.js` in your editor

2. **Find this line** (around line 300):
   ```javascript
   pass: process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD'
   ```

3. **Replace** `'YOUR_APP_PASSWORD'` with your 16-character app password:
   ```javascript
   pass: process.env.GMAIL_APP_PASSWORD || 'abcdefghijklmnop'  // Your actual app password here
   ```

4. **Save** the file (Ctrl+S)

---

### Step 4: Start the Server

1. **Open terminal** in your project folder

2. **Run**:
   ```bash
   node server.js
   ```

3. **You should see**:
   ```
   ✅ Email server is ready to send messages
   🚀 Server running on http://localhost:3000
   ```

4. **Keep the terminal open** - server must keep running!

---

### Step 5: Test It!

1. **Open** `login.html` in your browser

2. **Click** "Forgot Password?"

3. **Enter**: siripurapumanish@gmail.com

4. **Click** "Send OTP"

5. **Check your Gmail inbox** (and spam folder)

---

## 🔧 Quick Commands:

**Start server:**
```bash
node server.js
```

**Fix vulnerability (optional, later):**
```bash
npm audit fix --force
```

**Check if server is running:**
Open: http://localhost:3000/api/health

---

## ❓ Need Help?

If you get stuck:
- Check `STEP_BY_STEP_SETUP.md` for detailed instructions
- Make sure server is running before testing
- Check server console for error messages
