/**
 * Chat Controller - Main Orchestration Logic
 * Coordinates memory, LLM, and retrieval for intelligent conversations
 */

class ChatController {
  constructor(memoryManager, llmService, retrievalService, config = {}) {
    this.memoryManager = memoryManager;
    this.llmService = llmService;
    this.retrievalService = retrievalService;
    
    this.useRetrieval = config.useRetrieval !== false;
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
    this.persona = config.persona || 'professional';
    this.maxRetrievalResults = config.maxRetrievalResults || 3;
  }

  /**
   * Get default system prompt
   */
  getDefaultSystemPrompt() {
    return `You are an advanced AI career advisor assistant specializing in technology careers, education, and professional development.

Your expertise includes:
- Career guidance and roadmaps for tech roles
- Course recommendations and learning paths
- Job market insights and salary information
- Skills assessment and development strategies
- Interview preparation and resume advice

Guidelines:
- Provide practical, actionable advice
- Be encouraging but realistic
- Cite sources when using retrieved information
- Ask clarifying questions when needed
- Adapt your tone to the user's needs
- Structure complex answers with bullet points or numbered lists
- Avoid making promises about job outcomes
- When uncertain, acknowledge limitations

Always maintain a professional, supportive, and knowledgeable tone.`;
  }

  /**
   * Get persona-specific system prompt
   */
  getPersonaPrompt(persona) {
    const prompts = {
      professional: 'Maintain a professional, formal tone. Be concise and business-focused.',
      friendly: 'Be warm, conversational, and encouraging. Use casual language while remaining helpful.',
      mentor: 'Act as an experienced mentor. Share insights, ask thought-provoking questions, and guide the user toward their own conclusions.'
    };
    
    return prompts[persona] || prompts.professional;
  }

  /**
   * Process user message and generate response
   */
  async processMessage(sessionId, userMessage, options = {}) {
    try {
      // Add user message to memory
      this.memoryManager.addMessage(sessionId, 'user', userMessage);

      // Retrieve relevant context
      let retrievalContext = null;
      if (this.useRetrieval && this.retrievalService.initialized) {
        retrievalContext = await this.retrievalService.retrieveContext(
          userMessage,
          { topK: this.maxRetrievalResults }
        );
      }

      // Build messages for LLM
      const messages = this.buildMessages(sessionId, retrievalContext, options);

      // Generate response
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 800;

      const response = await this.llmService.generateResponse(messages, {
        temperature,
        maxTokens
      });

      // Add assistant response to memory
      this.memoryManager.addMessage(sessionId, 'assistant', response, {
        retrievalUsed: !!retrievalContext,
        sources: retrievalContext?.sources
      });

      return {
        response,
        sources: retrievalContext?.sources || [],
        sessionId
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      
      // Fallback response
      const fallback = this.getFallbackResponse(userMessage);
      this.memoryManager.addMessage(sessionId, 'assistant', fallback, {
        fallback: true
      });

      return {
        response: fallback,
        error: error.message,
        sessionId
      };
    }
  }

  /**
   * Process message with streaming response
   */
  async *processMessageStream(sessionId, userMessage, options = {}) {
    try {
      // Add user message to memory
      this.memoryManager.addMessage(sessionId, 'user', userMessage);

      // Retrieve relevant context
      let retrievalContext = null;
      if (this.useRetrieval && this.retrievalService.initialized) {
        retrievalContext = await this.retrievalService.retrieveContext(
          userMessage,
          { topK: this.maxRetrievalResults }
        );
      }

      // Build messages for LLM
      const messages = this.buildMessages(sessionId, retrievalContext, options);

      // Generate streaming response
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 800;

      let fullResponse = '';

      for await (const chunk of this.llmService.generateStreamingResponse(messages, {
        temperature,
        maxTokens
      })) {
        fullResponse += chunk;
        yield {
          chunk,
          sources: retrievalContext?.sources || []
        };
      }

      // Add complete response to memory
      this.memoryManager.addMessage(sessionId, 'assistant', fullResponse, {
        retrievalUsed: !!retrievalContext,
        sources: retrievalContext?.sources
      });

    } catch (error) {
      console.error('Streaming chat error:', error);
      
      const fallback = this.getFallbackResponse(userMessage);
      yield { chunk: fallback, error: error.message };
      
      this.memoryManager.addMessage(sessionId, 'assistant', fallback, {
        fallback: true
      });
    }
  }

  /**
   * Build messages array for LLM
   */
  buildMessages(sessionId, retrievalContext, options = {}) {
    const messages = [];

    // System prompt
    const systemContent = [
      this.systemPrompt,
      this.getPersonaPrompt(options.persona || this.persona)
    ].join('\n\n');

    messages.push({
      role: 'system',
      content: systemContent
    });

    // Add retrieval context
    if (retrievalContext && retrievalContext.context) {
      messages.push({
        role: 'system',
        content: `Relevant knowledge base information:\n\n${retrievalContext.context}\n\nUse this information to provide accurate answers. Cite sources when relevant.`
      });
    }

    // Add conversation history
    const history = this.memoryManager.getMessagesWithinTokenLimit(sessionId, 2000);
    messages.push(...history);

    return messages;
  }

  /**
   * Get fallback response when LLM fails
   */
  getFallbackResponse(userMessage) {
    const query = userMessage.toLowerCase();

    if (query.includes('roadmap') || query.includes('learn')) {
      return 'I can help you with learning roadmaps! To give you the best guidance, could you tell me:\n- What technology or role are you interested in?\n- What is your current experience level?\n- How much time can you dedicate per week?';
    }

    if (query.includes('job') || query.includes('career') || query.includes('role')) {
      return 'I specialize in career guidance! I can help with job search strategies, skill development, and career paths. What specific aspect would you like to discuss?';
    }

    if (query.includes('salary') || query.includes('pay')) {
      return 'Salaries vary widely based on location, experience, and company. For accurate information, I recommend checking sites like Glassdoor, Levels.fyi, or LinkedIn Salary Insights for your specific role and region.';
    }

    return "I'm here to help with career guidance, learning paths, and technology advice. Could you rephrase your question or provide more details about what you'd like to know?";
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.systemPrompt) this.systemPrompt = config.systemPrompt;
    if (config.persona) this.persona = config.persona;
    if (config.useRetrieval !== undefined) this.useRetrieval = config.useRetrieval;
    if (config.maxRetrievalResults) this.maxRetrievalResults = config.maxRetrievalResults;
  }

  /**
   * Clear session
   */
  clearSession(sessionId) {
    return this.memoryManager.clearConversation(sessionId);
  }

  /**
   * Get session info
   */
  getSessionInfo(sessionId) {
    return {
      stats: this.memoryManager.getStats(sessionId),
      config: {
        persona: this.persona,
        useRetrieval: this.useRetrieval,
        llmConfig: this.llmService.getConfig()
      }
    };
  }
}

module.exports = ChatController;
