/**
 * Memory Manager - Conversation Memory with Context Summarization
 * Manages conversation history with intelligent truncation and summarization
 */

class MemoryManager {
  constructor(options = {}) {
    this.maxMessages = options.maxMessages || 10;
    this.maxTokens = options.maxTokens || 3000;
    this.summarizationThreshold = options.summarizationThreshold || 8;
    this.conversations = new Map(); // sessionId -> messages[]
  }

  /**
   * Get conversation history for a session
   */
  getConversation(sessionId) {
    return this.conversations.get(sessionId) || [];
  }

  /**
   * Add message to conversation
   */
  addMessage(sessionId, role, content, metadata = {}) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const conversation = this.conversations.get(sessionId);
    
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    conversation.push(message);

    // Trim if exceeds max messages
    if (conversation.length > this.maxMessages) {
      this.conversations.set(sessionId, conversation.slice(-this.maxMessages));
    }

    return message;
  }

  /**
   * Get last N messages for LLM context
   */
  getRecentMessages(sessionId, count = 6) {
    const conversation = this.getConversation(sessionId);
    return conversation.slice(-count).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get conversation with token limit
   */
  getMessagesWithinTokenLimit(sessionId, maxTokens = 3000) {
    const conversation = this.getConversation(sessionId);
    const messages = [];
    let tokenCount = 0;

    // Start from most recent messages
    for (let i = conversation.length - 1; i >= 0; i--) {
      const msg = conversation[i];
      const msgTokens = this.estimateTokens(msg.content);
      
      if (tokenCount + msgTokens > maxTokens && messages.length > 0) {
        break;
      }

      messages.unshift({
        role: msg.role,
        content: msg.content
      });

      tokenCount += msgTokens;
    }

    return messages;
  }

  /**
   * Create conversation summary (to be called by LLM)
   */
  async createSummary(sessionId, llmService) {
    const conversation = this.getConversation(sessionId);
    
    if (conversation.length < this.summarizationThreshold) {
      return null;
    }

    const messagesToSummarize = conversation.slice(0, -4); // Keep last 4 messages
    const conversationText = messagesToSummarize
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const summaryPrompt = [
      {
        role: 'system',
        content: 'Summarize the following conversation concisely, preserving key facts, user preferences, and context. Keep it under 200 words.'
      },
      {
        role: 'user',
        content: conversationText
      }
    ];

    try {
      const summary = await llmService.generateResponse(summaryPrompt, {
        temperature: 0.3,
        maxTokens: 300
      });

      // Replace old messages with summary
      const recentMessages = conversation.slice(-4);
      const summaryMessage = {
        role: 'system',
        content: `[Conversation Summary]: ${summary}`,
        timestamp: new Date().toISOString(),
        metadata: { type: 'summary' }
      };

      this.conversations.set(sessionId, [summaryMessage, ...recentMessages]);

      return summary;
    } catch (error) {
      console.error('Failed to create summary:', error);
      return null;
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(sessionId) {
    this.conversations.delete(sessionId);
    return { success: true, message: 'Conversation cleared' };
  }

  /**
   * Get conversation statistics
   */
  getStats(sessionId) {
    const conversation = this.getConversation(sessionId);
    const userMessages = conversation.filter(m => m.role === 'user').length;
    const assistantMessages = conversation.filter(m => m.role === 'assistant').length;
    const totalTokens = conversation.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content),
      0
    );

    return {
      totalMessages: conversation.length,
      userMessages,
      assistantMessages,
      estimatedTokens: totalTokens,
      oldestMessage: conversation[0]?.timestamp,
      newestMessage: conversation[conversation.length - 1]?.timestamp
    };
  }

  /**
   * Export conversation (for analytics/debugging)
   */
  exportConversation(sessionId) {
    return {
      sessionId,
      messages: this.getConversation(sessionId),
      stats: this.getStats(sessionId)
    };
  }

  /**
   * Clean up old conversations (memory management)
   */
  cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    const sessionsToDelete = [];

    for (const [sessionId, conversation] of this.conversations.entries()) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage) {
        const messageAge = now - new Date(lastMessage.timestamp).getTime();
        if (messageAge > maxAge) {
          sessionsToDelete.push(sessionId);
        }
      }
    }

    sessionsToDelete.forEach(id => this.conversations.delete(id));

    return {
      cleaned: sessionsToDelete.length,
      remaining: this.conversations.size
    };
  }
}

module.exports = MemoryManager;
