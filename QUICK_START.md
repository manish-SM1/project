# Quick Start Guide - Advanced AI Chatbot

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install dotenv axios
```

### Step 2: Get API Key

**Option A: OpenRouter (Recommended)**
1. Go to https://openrouter.ai/keys
2. Sign up (free)
3. Create API key
4. Get free credits or add payment method

**Option B: OpenAI**
1. Go to https://platform.openai.com/api-keys
2. Sign up
3. Create API key
4. Add payment method ($5 minimum)

### Step 3: Configure

Create `.env` file in project root:

```env
LLM_PROVIDER=openrouter
LLM_API_KEY=sk-or-v1-YOUR_KEY_HERE
LLM_MODEL=anthropic/claude-3.5-sonnet

# Optional for better embeddings
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY
```

### Step 4: Start Server

```bash
node server.js
```

### Step 5: Open Chat

Navigate to: **http://localhost:3000/chat-advanced.html**

## 🎯 What You Get

### Features
✅ ChatGPT-like streaming responses  
✅ Smart conversation memory  
✅ Knowledge base (RAG) with career guidance  
✅ 3 persona modes (Professional, Friendly, Mentor)  
✅ Feedback system (👍/👎)  
✅ Temperature & length controls  
✅ Auto-fallback when API fails  
✅ Copy responses  
✅ Clear conversation  

### Try These Queries

```
"Create a roadmap to become a full-stack developer"
"What skills do I need for data science?"
"How do I prepare for software engineering interviews?"
"Explain React hooks with examples"
"Compare Python vs JavaScript for beginners"
```

## ⚙️ Settings

### Change Persona
- **Professional**: Formal, concise
- **Friendly**: Casual, warm
- **Mentor**: Guiding, thoughtful

### Adjust Temperature
- **0.0-0.3**: Focused, consistent
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.0**: Creative, varied

### Response Length
- **Short (400)**: Quick answers
- **Medium (800)**: Detailed (default)
- **Long (1200)**: Comprehensive

## 💡 Tips

1. **Be specific** - Better: "Python roadmap for data science" vs "teach me Python"
2. **Ask follow-ups** - The bot remembers last 10 messages
3. **Use feedback** - 👍/👎 helps improve responses
4. **Try personas** - Switch between modes for different tones
5. **Adjust temperature** - Higher = more creative

## 🔧 Customize

### Add Your Domain Knowledge

Edit `backend/data/knowledgeBase.js`:

```javascript
{
  content: `Your expert knowledge here...`,
  metadata: {
    source: 'Company Docs',
    category: 'your-domain',
    topic: 'specific-topic'
  }
}
```

Restart server to apply changes.

### Change System Prompt

Edit `backend/services/chatController.js` → `getDefaultSystemPrompt()`

## 📊 Monitor Usage

Check statistics:
```bash
curl http://localhost:3000/api/chat/stats
```

View session info:
```bash
curl http://localhost:3000/api/chat/session/YOUR_SESSION_ID
```

## 🐛 Troubleshooting

**"Offline" status badge?**
- Check server is running: `node server.js`
- Verify port 3000 is available

**No response from bot?**
- Check API key in `.env`
- Verify key has credits/billing enabled
- Check browser console (F12) for errors

**Slow responses?**
- Normal for first response (cold start)
- Try faster model: `gpt-4o-mini`
- Reduce max tokens to 400-600

**"Rate limit exceeded"?**
- Wait 1 minute
- Upgrade API plan
- Reduce request frequency

## 💰 Cost Estimate

**OpenRouter (Claude 3.5 Sonnet)**
- ~2000 tokens per request
- ~$0.03 per conversation
- $1 = ~30 conversations

**OpenRouter (GPT-4o-mini)**
- ~2000 tokens per request
- ~$0.005 per conversation
- $1 = ~200 conversations

**Embeddings (optional)**
- OpenAI: ~$0.00001 per query
- Negligible cost

## 🚀 Next Steps

1. **Test the bot** with various queries
2. **Add your knowledge** to knowledge base
3. **Customize system prompt** for your domain
4. **Enable analytics** (see ARCHITECTURE.md)
5. **Deploy to production** (see CHATBOT_SETUP_GUIDE.md)

## 📚 Documentation

- [Setup Guide](CHATBOT_SETUP_GUIDE.md) - Detailed installation & configuration
- [Architecture](ARCHITECTURE.md) - System design & technical details
- [API Reference](CHATBOT_SETUP_GUIDE.md#api-endpoints) - Endpoint documentation

## 🆘 Need Help?

Check logs in terminal where `node server.js` is running for detailed error messages.

## 🎉 Success!

You now have a production-ready AI chatbot with:
- LLM-powered intelligence
- Domain knowledge integration
- Streaming UX
- Memory & context
- Production-grade error handling

Start chatting at: **http://localhost:3000/chat-advanced.html**
