# Step-by-Step Guide: Text Learning from GeeksforGeeks

This guide explains how to use the course section with GeeksforGeeks-based text content for learning.

---

## 🚀 Step 1: Start the Backend Server

The learning platform depends on the backend to fetch GeeksforGeeks topics.

1.  Open your **Terminal** or **Command Prompt**.
2.  Navigate to your project directory:
    ```bash
    cd C:\Users\Manish\OneDrive\Desktop\project
    ```
3.  Run the server:
    ```bash
    node server.js
    ```
4.  Verification: You should see `🚀 Server running on http://localhost:3000`.

---

## 📘 Step 2: Access the Learning Platform

1.  Open your browser (Chrome recommended).
2.  Open the file: `C:\Users\Manish\OneDrive\Desktop\project\learning.html`.
3.  Alternatively, if the server is running, go to: `http://localhost:3000/learning.html`.

---

## 🔘 Step 3: Enter the Course

1.  When the page loads, you will see a start overlay.
2.  Click **Start Learning**.
3.  The first scraped topic opens as text content.

---

## 📝 Step 4: Text Learning Mode

1.  Topics are loaded from GeeksforGeeks scraped files.
2.  Select a topic in the left sidebar.
3.  Read plain text content with the original source link.

---

## 📚 Step 5: Navigating GFG Topics

1.  **Sidebar**: Browse all course topics.
2.  **Text Content**: Click any topic to open text-only learning content.
3.  **Source Link**: Open the original GeeksforGeeks article if you want full details.

---

## 🤖 Step 6: Tutor Assistance (Optional)

1.  You can still use the tutor button for quick guidance.
2.  Primary learning is now text content from scraped sources.

---

## ✅ Feature Checklist

- [ ] Course opens in text-learning mode.
- [ ] Topics are loaded from scraped GeeksforGeeks files.
- [ ] Topic details are shown as plain text.
- [ ] Source article link opens correctly.

---

## 🔧 Troubleshooting

### Content not loading?
- Ensure `node server.js` is running in the background.
- Run `node scripts/scrape_content.js` to refresh scraped files.
- Check the browser console (F12) for any network errors.
