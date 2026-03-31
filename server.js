// Backend Server for CareerAI - Courses System + Advanced Chat AI
// Run with: node server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, JS) from project root

// MongoDB Connection
// Replace YOUR_PASSWORD with your actual MongoDB password
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manishkumar:YOUR_PASSWORD@cluster0.id0zkje.mongodb.net/careerai?retryWrites=true&w=majority';

// Connect to MongoDB but don't crash if it fails (for local development)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.log('⚠️ MongoDB connection failed (running in offline mode):', err.message);
  console.log('   Some features like Login/Register/Courses API might not work.');
});

// Database Models
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  quiz: [{
    question: String,
    options: [String],
    correct: Number
  }],
  exercises: [{
    title: String,
    description: String,
    starter: String,
    solution: String
  }],
  projects: [{
    title: String,
    description: String,
    features: [String],
    solution: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

// Import Chat Routes
const chatRoutes = require('./backend/chatRoutes');

// API Routes

// Chat API (Advanced AI Chatbot)
app.use('/api/chat', chatRoutes);

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course by name
app.get('/api/courses/:name', async (req, res) => {
  try {
    const course = await Course.findOne({ name: req.params.name });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course content is served from scraped text/article data files

// Create new course
app.post('/api/courses', async (req, res) => {
  try {
    const { name, icon, title, subtitle, description } = req.body;

    // Check if course already exists
    const existing = await Course.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Course already exists' });
    }

    const course = new Course({
      name,
      icon,
      title,
      subtitle,
      description,
      quiz: [],
      exercises: [],
      projects: []
    });

    await course.save();
    res.json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quiz, exercises, or projects
app.put('/api/courses/:courseName', async (req, res) => {
  try {
    const course = await Course.findOne({ name: req.params.courseName });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { quiz, exercises, projects } = req.body;
    if (quiz) course.quiz = quiz;
    if (exercises) course.exercises = exercises;
    if (projects) course.projects = projects;

    course.updatedAt = new Date();
    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CareerAI Backend is running' });
});

// Online compiler proxy (Piston API)
app.post('/api/compiler/execute', async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body || {};

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'language is required' });
    }

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'code is required' });
    }

    const payload = {
      language,
      source_code: code,
      api_key: 'guest',
      stdin
    };

    const createResponse = await axios.post('https://api.paiza.io/runners/create', payload, {
      timeout: 45000,
      headers: { 'Content-Type': 'application/json' }
    });

    const runnerId = createResponse.data?.id;
    if (!runnerId) {
      return res.status(502).json({ error: 'Failed to create runner session' });
    }

    let details = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const detailResponse = await axios.get('https://api.paiza.io/runners/get_details', {
        params: { id: runnerId, api_key: 'guest' },
        timeout: 45000
      });

      details = detailResponse.data;
      if (details?.status === 'completed') {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    if (!details || details.status !== 'completed') {
      return res.status(504).json({ error: 'Compiler execution timed out' });
    }

    res.json({
      provider: 'paiza',
      language: details.language,
      status: details.status,
      compile: {
        stdout: details.build_stdout || '',
        stderr: details.build_stderr || '',
        code: Number(details.build_exit_code || 0)
      },
      run: {
        stdout: details.stdout || '',
        stderr: details.stderr || '',
        code: Number(details.exit_code || 0),
        time: details.time || '',
        memory: details.memory || ''
      },
      result: details.result || ''
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || { message: error.message };
    res.status(status).json({
      error: 'Compiler execution failed',
      details
    });
  }
});

// Email Configuration
// Create transporter for Gmail
// You need to create an App Password in your Gmail account
// Go to: Google Account → Security → 2-Step Verification → App Passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'siripurapumanish@gmail.com', // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD || 'wwipwiabrqwoxtkj' // Gmail App Password (spaces removed)
  }
});

// Verify email configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error);
    console.log('⚠️  Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send OTP Email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Email content
    const mailOptions = {
      from: `CareerAI <${process.env.GMAIL_USER || 'siripurapumanish@gmail.com'}>`,
      to: email,
      subject: 'Password Reset OTP - CareerAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">CareerAI</h1>
          </div>
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a202c; margin-top: 0;">Password Reset OTP</h2>
            <p style="color: #4a5568; font-size: 16px;">You have requested to reset your password. Use the OTP below to verify your identity:</p>
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #718096; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #718096; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">© 2025 CareerAI. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you didn't request this, please ignore this email.`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ OTP email sent:', info.messageId);
    res.json({
      success: true,
      message: 'OTP sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// Serve curriculum data (optional)
app.get('/api/courses/:courseId/curriculum', (req, res) => {
  const courseId = req.params.courseId;
  const filePath = path.join(__dirname, 'data', `curriculum_${courseId}.json`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(content));
  } else {
    // Fallback to a default or error
    res.status(404).json({ message: 'Curriculum not found for this course' });
  }
});

// List available course datasets
app.get('/api/courses-catalog', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir);

    const courseNameMap = {
      html: 'HTML',
      css: 'CSS',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      c: 'C',
      cpp: 'C++',
      java: 'Java',
      react: 'React',
      nodejs: 'Node.js',
      django: 'Django',
      sql: 'SQL',
      mongodb: 'MongoDB',
      postgresql: 'PostgreSQL',
      git: 'Git',
      docker: 'Docker',
      aws: 'AWS'
    };

    const catalog = files
      .filter((name) => name.startsWith('scraped_') && name.endsWith('.json'))
      .map((name) => {
        const courseId = name.replace('scraped_', '').replace('.json', '');
        const filePath = path.join(dataDir, name);
        let topicCount = 0;

        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          topicCount = Array.isArray(content) ? content.length : 0;
        } catch (error) {
          topicCount = 0;
        }

        return {
          courseId,
          name: courseNameMap[courseId] || courseId.toUpperCase(),
          topicCount
        };
      })
      .filter((entry) => entry.topicCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(catalog);
  } catch (error) {
    res.status(500).json({ message: 'Unable to build course catalog', error: error.message });
  }
});

// Serve scraped content
app.get('/api/courses/:courseId/content', (req, res) => {
  const courseId = req.params.courseId;
  const aliasMap = {
    js: 'javascript',
    'node-js': 'nodejs',
    html5: 'html',
    css3: 'css',
    ts: 'typescript',
    'react-js': 'react',
    'postgre-sql': 'postgresql',
  };

  const normalizedCourseId = aliasMap[courseId] || courseId;
  const filePath = path.join(__dirname, 'data', `scraped_${normalizedCourseId}.json`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8'); // Read file
    res.json(JSON.parse(content)); // Send JSON
  } else {
    res.status(404).json({ message: 'Course content not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});
