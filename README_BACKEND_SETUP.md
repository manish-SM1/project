# CareerAI Backend Setup Guide

## 🚀 Complete Backend Database System for Courses

This backend extracts YouTube course content, stores it in MongoDB, and serves it to your frontend.

---

## 📋 Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB installation, OR
   - Free MongoDB Atlas account (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)

---

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `mongoose` - MongoDB driver
- `cors` - Enable CORS for frontend
- `youtube-transcript-api` - Extract YouTube transcripts
- `axios` - HTTP requests

### Step 2: Set Up MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/careerai`)
4. Set it as environment variable or update `server.js`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/careerai`

### Step 3: Configure Environment Variables (Optional)

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/careerai
OPENAI_API_KEY=your_openai_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

Or update `server.js` directly with your MongoDB connection string.

### Step 4: Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
📚 API available at http://localhost:3000/api
```

---

## 📡 API Endpoints

### Get All Courses
```
GET http://localhost:3000/api/courses
```

### Get Single Course
```
GET http://localhost:3000/api/courses/Python
```

### Create New Course
```
POST http://localhost:3000/api/courses
Content-Type: application/json

{
  "name": "Python",
  "icon": "python",
  "title": "Complete Python Course",
  "subtitle": "Learn Python from scratch",
  "description": "Comprehensive Python programming course"
}
```

### Add YouTube Video to Course
```
POST http://localhost:3000/api/courses/Python/videos
Content-Type: application/json

{
  "youtubeId": "eWRfhZUzrAc"
}
```

This will:
- Extract transcript from YouTube
- Store video metadata
- Save to database

### Enhance Video with AI (Requires OpenAI API Key)
```
POST http://localhost:3000/api/courses/Python/videos/0/enhance
```

Converts transcript into high-quality visual explanations.

### Update Course (Quiz, Exercises, Projects)
```
PUT http://localhost:3000/api/courses/Python
Content-Type: application/json

{
  "quiz": [...],
  "exercises": [...],
  "projects": [...]
}
```

---

## 🎯 How to Use

### 1. Create a Course (via API or directly in MongoDB)

**Via API:**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python",
    "icon": "python",
    "title": "Complete Python Course",
    "subtitle": "Learn Python programming"
  }'
```

### 2. Add YouTube Videos

In your frontend (courses.html), when logged in:
1. Open any course
2. Click "Add YouTube Video"
3. Enter YouTube video ID (e.g., `eWRfhZUzrAc`)
4. Click "Add Video"

The backend will:
- Extract transcript automatically
- Store video metadata
- Make it available in your course

### 3. Enhance with AI (Optional)

If you have OpenAI API key:
1. Click "Enhance with AI" button on any video
2. Backend converts transcript into rich visual explanations
3. Enhanced content appears in the course

---

## 🔐 Authentication Integration

The frontend uses `auth.js` to check if user is logged in. Backend can validate this if needed.

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running (if local)
- Verify connection string is correct
- Check network/firewall if using Atlas

### YouTube Transcript Not Available
- Some videos don't have transcripts
- Try different videos
- Check video has captions enabled

### OpenAI API Error
- Verify API key is set correctly
- Check you have credits/quota
- AI enhancement is optional - works without it

---

## 📝 Next Steps

1. **Start backend:** `npm start`
2. **Create courses** via API or MongoDB
3. **Add YouTube videos** from frontend
4. **Test the system** by opening courses in your browser

---

## 🎉 You're Ready!

Your backend is now:
- ✅ Storing courses in MongoDB
- ✅ Extracting YouTube transcripts
- ✅ Serving data to frontend
- ✅ Ready for AI enhancement

Open `http://localhost:3000/api/health` to verify it's running!
