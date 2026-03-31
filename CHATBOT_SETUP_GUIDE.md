# Advanced AI Chatbot - Setup Guide

## Overview

This is a production-ready, ChatGPT-like conversational AI system with:
- LLM-driven reasoning (OpenAI, OpenRouter, Anthropic)
- Retrieval-Augmented Generation (RAG)
- Streaming responses
- Conversation memory with summarization
- Persona modes (Professional, Friendly, Mentor)
- Feedback system

## Architecture

```
project/
├── backend/
│   ├── services/
│   │   ├── memoryManager.js      # Conversation memory
│   │   ├── llmService.js          # LLM integration
│   │   ├── embeddingService.js    # Vector embeddings
│   │   ├── retrievalService.js    # RAG retrieval
│   │   └── chatController.js      # Orchestration
│   ├── data/
│   │   └── knowledgeBase.js       # Predefined documents
│   └── chatRoutes.js              # API endpoints
├── server.js                      # Main server
├── chat-advanced.html             # Frontend UI
├── chat-advanced.js               # Frontend logic
├── .env.example                   # Configuration template
└── package.json
```

## Installation

### 1. Install Dependencies

```bash
npm install dotenv axios
```

### 2. Get API Keys

#### OpenRouter (Recommended - Multi-Model)
1. Visit https://openrouter.ai/
2. Sign up and create API key
3. Models available: Claude, GPT-4, Gemini, etc.
4. Cost-effective with per-request pricing

#### OpenAI (Alternative)
1. Visit https://platform.openai.com/
2. Create account and API key
3. Models: GPT-4o, GPT-4o-mini, GPT-3.5-turbo
4. Also needed for embeddings (optional)

#### Anthropic (Alternative)
1. Visit https://console.anthropic.com/
2. Create account and API key
3. Models: Claude 3.5 Sonnet, Claude 3 Opus

### 3. Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit .env with your keys
nano .env
```

Required variables:
```env
LLM_PROVIDER=openrouter
LLM_API_KEY=sk-or-v1-xxxxx
LLM_MODEL=anthropic/claude-3.5-sonnet

# Optional for embeddings (improves RAG)
OPENAI_API_KEY=sk-xxxxx
```

### 4. Start Server

```bash
node server.js
```

Server runs on: http://localhost:3000

## API Endpoints

### POST /api/chat/message
Process message and return complete response

**Request:**
```json
{
  "message": "How do I become a software engineer?",
  "sessionId": "session_123",
  "options": {
    "persona": "professional",
    "temperature": 0.7,
    "maxTokens": 800
  }
}
```

**Response:**
```json
{
  "response": "To become a software engineer...",
  "sources": ["Career Guide", "Learning Roadmap"],
  "sessionId": "session_123"
}
```

### POST /api/chat/stream
Process message with streaming response (SSE)

**Request:** Same as /message

**Response:** Server-Sent Events stream
```
data: {"chunk": "To become", "sources": []}
data: {"chunk": " a software", "sources": []}
data: [DONE]
```

### POST /api/chat/feedback
Submit user feedback

**Request:**
```json
{
  "sessionId": "session_123",
  "messageIndex": 2,
  "rating": "positive",
  "comment": "Very helpful!"
}
```

### DELETE /api/chat/session/:sessionId
Clear conversation history

### GET /api/chat/session/:sessionId
Get session information and statistics

### POST /api/chat/config
Update chatbot configuration

**Request:**
```json
{
  "llm": {
    "temperature": 0.8,
    "maxTokens": 1000
  },
  "chat": {
    "persona": "mentor",
    "useRetrieval": true
  }
}
```

### GET /api/chat/stats
Get chatbot statistics

## Frontend Usage

### Basic Integration

```html
<script src="chat-advanced.js"></script>
```

### Accessing the Chat

Navigate to: http://localhost:3000/chat-advanced.html

### Features

1. **Persona Modes:**
   - Professional: Formal, concise
   - Friendly: Conversational, warm
   - Mentor: Thoughtful, guiding

2. **Temperature Control:**
   - 0.0-0.3: Focused, deterministic
   - 0.4-0.7: Balanced (default)
   - 0.8-1.0: Creative, varied

3. **Response Length:**
   - Short: 400 tokens
   - Medium: 800 tokens (default)
   - Long: 1200 tokens

4. **Feedback System:**
   - Thumbs up/down on responses
   - Copy response to clipboard
   - Logged for improvement

## Customization

### Adding Knowledge Base Documents

Edit `backend/data/knowledgeBase.js`:

```javascript
{
  content: `Your domain-specific content here...`,
  metadata: {
    source: 'Custom Guide',
    category: 'your-category',
    topic: 'your-topic'
  }
}
```

### Changing System Prompt

Edit `backend/services/chatController.js`:

```javascript
getDefaultSystemPrompt() {
  return `Your custom system prompt...`;
}
```

### Modifying Persona Prompts

Edit `getPersonaPrompt()` in `chatController.js`:

```javascript
getPersonaPrompt(persona) {
  const prompts = {
    professional: 'Your professional tone...',
    friendly: 'Your friendly tone...',
    mentor: 'Your mentor tone...',
    custom: 'Your custom persona...'
  };
  return prompts[persona] || prompts.professional;
}
```

## RAG System

### How It Works

1. **Document Storage:** Knowledge base documents are converted to embeddings
2. **Query Processing:** User query is embedded
3. **Similarity Search:** Top-K most relevant documents retrieved
4. **Context Injection:** Retrieved context added to LLM prompt
5. **Response Generation:** LLM generates answer using context

### Embeddings

- **With OpenAI API:** Uses text-embedding-3-small model
- **Without API:** Falls back to TF-IDF-based embeddings
- **Recommendation:** Use OpenAI embeddings for best results

### Improving Retrieval

1. Add more domain-specific documents
2. Increase topK parameter for more context
3. Adjust minSimilarity threshold
4. Use better embedding models

## Memory Management

### Conversation Memory Features

- Stores last 10 messages per session
- Automatic summarization when exceeds 8 messages
- Token-aware context window
- Session persistence

### Clear Memory

Frontend: Click 🗑️ button

API:
```bash
curl -X DELETE http://localhost:3000/api/chat/session/SESSION_ID
```

## Error Handling

### Fallback Responses

If LLM fails:
1. Returns context-aware fallback message
2. Logs error for debugging
3. User sees helpful guidance

### Rate Limiting

- Default: 50 requests per minute
- Adjustable in `llmService.js`
- Returns 429 error when exceeded

### API Key Issues

Common errors:
- `Invalid API key`: Check .env configuration
- `Rate limit exceeded`: Wait or upgrade plan
- `Model not found`: Verify model name

## Performance Optimization

### Caching

- Embeddings are cached in memory
- Reduces API calls
- Clear cache: Restart server

### Token Management

- Automatic conversation truncation
- Token counting for context window
- Summarization for long conversations

### Streaming Benefits

- Faster perceived response time
- Better UX with typing animation
- Reduced wait time for users

## Production Deployment

### Environment Variables

Set in production:
```bash
NODE_ENV=production
LLM_API_KEY=your_production_key
MONGODB_URI=your_production_db
```

### Security Considerations

1. Never expose API keys in frontend
2. Use environment variables
3. Implement rate limiting
4. Add authentication/authorization
5. Enable CORS restrictions
6. Use HTTPS in production

### Scaling

1. Use Redis for session storage
2. Add load balancing
3. Implement caching layer (Redis/Memcached)
4. Use vector database for embeddings (Pinecone, Weaviate)
5. Monitor API usage and costs

## Monitoring

### Logs

- Request/response logging
- Error tracking
- Performance metrics

### Analytics

Track:
- User queries and patterns
- Response quality (feedback)
- API latency
- Token usage

## Troubleshooting

### Server won't start

```bash
# Check Node version (14+)
node --version

# Install dependencies
npm install

# Check .env file exists
ls -la .env
```

### API responses are slow

- Check LLM provider status
- Reduce maxTokens
- Use faster model (gpt-4o-mini)
- Implement caching

### Streaming not working

- Ensure proper SSE headers
- Check browser compatibility
- Test with fetch API
- Verify endpoint URL

### Embeddings failing

- OpenAI API key not set
- Enable fallback: `useFallback: true`
- Check embedding model name

## Cost Optimization

### Model Selection

**Budget-friendly:**
- OpenRouter: anthropic/claude-3.5-haiku
- OpenAI: gpt-4o-mini
- Google: gemini-pro

**High-quality:**
- OpenRouter: anthropic/claude-3.5-sonnet
- OpenAI: gpt-4o
- Anthropic: claude-3-opus

### Token Usage

- Reduce maxTokens (400-600 for short answers)
- Implement caching
- Use summarization
- Limit conversation history

### Embeddings

- Use fallback TF-IDF (free)
- Cache embeddings
- Or use OpenAI (low cost: $0.02/1M tokens)

## Support

For issues:
1. Check logs in terminal
2. Review .env configuration
3. Test API key with provider
4. Check network connectivity
5. Review documentation

## License

MIT License - See LICENSE file
