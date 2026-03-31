# MongoDB Atlas Setup Guide

## Step 1: Get Your Connection String

1. **Log into MongoDB Atlas**: https://cloud.mongodb.com/

2. **Click "Connect"** on your cluster

3. **Choose "Connect your application"**

4. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace `<password>`** with your actual MongoDB password

6. **Add database name** - change the connection string to:
   ```
   mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/careerai?retryWrites=true&w=majority
   ```
   (Add `/careerai` before the `?`)

## Step 2: Update server.js

Open `server.js` and find line 18. Replace the connection string:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_CONNECTION_STRING_HERE';
```

**Example:**
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/careerai?retryWrites=true&w=majority';
```

## Step 3: Whitelist Your IP (Important!)

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   OR add your specific IP address
4. Click **"Confirm"**

## Step 4: Create Database User (If not done)

1. Go to **Database Access** in MongoDB Atlas
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password
5. Set role to **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 5: Test Connection

1. Save `server.js` with your connection string
2. Run: `npm start`
3. You should see: `✅ Connected to MongoDB`

## Troubleshooting

- **Connection timeout**: Check Network Access (whitelist your IP)
- **Authentication failed**: Check username/password in connection string
- **Database not found**: The database will be created automatically on first use
