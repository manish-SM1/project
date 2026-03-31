/**
 * Chat API Routes
 * RESTful endpoints for the advanced chatbot
 */

const express = require('express');
const router = express.Router();

// Import services
const MemoryManager = require('./services/memoryManager');
const LLMService = require('./services/llmService');
const EmbeddingService = require('./services/embeddingService');
const RetrievalService = require('./services/retrievalService');
const ChatController = require('./services/chatController');
const knowledgeBase = require('./data/knowledgeBase');

// Initialize services
const memoryManager = new MemoryManager({
  maxMessages: 10,
  summarizationThreshold: 8
});

const llmService = new LLMService({
  provider: process.env.LLM_PROVIDER || 'openrouter',
  apiKey: process.env.LLM_API_KEY,
  model: process.env.LLM_MODEL,
  temperature: 0.7,
  maxTokens: 800
});

const embeddingService = new EmbeddingService({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  useFallback: true
});

const retrievalService = new RetrievalService(embeddingService, {
  topK: 3,
  minSimilarity: 0.3
});

const chatController = new ChatController(
  memoryManager,
  llmService,
  retrievalService,
  {
    useRetrieval: true,
    persona: 'professional'
  }
);

// Initialize knowledge base
let isInitialized = false;
async function initializeKnowledgeBase() {
  if (isInitialized) return;
  
  try {
    console.log('Initializing knowledge base...');
    await retrievalService.initialize(knowledgeBase);
    isInitialized = true;
    console.log('Knowledge base initialized successfully');
  } catch (error) {
    console.error('Failed to initialize knowledge base:', error.message);
  }
}

// Initialize on startup
initializeKnowledgeBase();

/**
 * POST /api/chat/message
 * Process a chat message
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, options = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const session = sessionId || `session_${Date.now()}`;

    const result = await chatController.processMessage(session, message, options);

    res.json(result);
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * POST /api/chat/stream
 * Process a chat message with streaming response
 */
router.post('/stream', async (req, res) => {
  try {
    const { message, sessionId, options = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const session = sessionId || `session_${Date.now()}`;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send streaming response
    for await (const data of chatController.processMessageStream(session, message, options)) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/chat/feedback
 * Submit feedback for a response
 */
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, messageIndex, rating, comment } = req.body;

    // Store feedback (in production, save to database)
    const feedback = {
      sessionId,
      messageIndex,
      rating, // 'positive' or 'negative'
      comment,
      timestamp: new Date().toISOString()
    };

    // Log feedback for now
    console.log('Feedback received:', feedback);

    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

/**
 * DELETE /api/chat/session/:sessionId
 * Clear conversation history
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = chatController.clearSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

/**
 * GET /api/chat/session/:sessionId
 * Get session information
 */
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const info = chatController.getSessionInfo(sessionId);
    res.json(info);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

/**
 * POST /api/chat/config
 * Update chatbot configuration
 */
router.post('/config', (req, res) => {
  try {
    const { llm, chat } = req.body;

    if (llm) {
      llmService.updateConfig(llm);
    }

    if (chat) {
      chatController.updateConfig(chat);
    }

    res.json({
      success: true,
      config: {
        llm: llmService.getConfig(),
        chat: {
          persona: chatController.persona,
          useRetrieval: chatController.useRetrieval
        }
      }
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

/**
 * GET /api/chat/stats
 * Get chatbot statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {
      retrieval: retrievalService.getStats(),
      embedding: embeddingService.getCacheStats(),
      llm: llmService.getConfig()
    };
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * POST /api/chat/test
 * Test LLM connection
 */
router.post('/test', async (req, res) => {
  try {
    const result = await llmService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

module.exports = router;
