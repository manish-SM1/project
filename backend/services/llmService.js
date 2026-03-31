/**
 * LLM Service - AI Model Integration with Streaming Support
 * Handles OpenAI, OpenRouter, and other LLM providers with rate limiting and error handling
 */

const axios = require('axios');

class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || 'openrouter';
    this.apiKey = config.apiKey || process.env.LLM_API_KEY;
    this.model = config.model || this.getDefaultModel();
    this.defaultTemperature = config.temperature || 0.7;
    this.defaultMaxTokens = config.maxTokens || 800;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 2;
    
    // Rate limiting
    this.requestCount = 0;
    this.rateLimitWindow = 60000; // 1 minute
    this.maxRequestsPerWindow = config.maxRequestsPerWindow || 50;
    this.resetRateLimitTimer();
  }

  getDefaultModel() {
    const models = {
      openai: 'gpt-4o-mini',
      openrouter: 'anthropic/claude-3.5-sonnet',
      anthropic: 'claude-3-5-sonnet-20241022'
    };
    return models[this.provider] || 'gpt-4o-mini';
  }

  getEndpoint() {
    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages'
    };
    return endpoints[this.provider] || endpoints.openai;
  }

  resetRateLimitTimer() {
    setTimeout(() => {
      this.requestCount = 0;
      this.resetRateLimitTimer();
    }, this.rateLimitWindow);
  }

  checkRateLimit() {
    if (this.requestCount >= this.maxRequestsPerWindow) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    this.requestCount++;
  }

  /**
   * Generate response from LLM (non-streaming)
   */
  async generateResponse(messages, options = {}) {
    this.checkRateLimit();

    const temperature = options.temperature ?? this.defaultTemperature;
    const maxTokens = options.maxTokens ?? this.defaultMaxTokens;
    const model = options.model || this.model;

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    let attempt = 0;
    while (attempt <= this.retryAttempts) {
      try {
        const response = await axios.post(
          this.getEndpoint(),
          payload,
          {
            headers: this.getHeaders(),
            timeout: this.timeout
          }
        );

        return this.extractResponse(response.data);
      } catch (error) {
        attempt++;
        
        if (attempt > this.retryAttempts) {
          throw this.handleError(error);
        }

        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  /**
   * Generate streaming response
   */
  async *generateStreamingResponse(messages, options = {}) {
    this.checkRateLimit();

    const temperature = options.temperature ?? this.defaultTemperature;
    const maxTokens = options.maxTokens ?? this.defaultMaxTokens;
    const model = options.model || this.model;

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    };

    try {
      const response = await axios.post(
        this.getEndpoint(),
        payload,
        {
          headers: this.getHeaders(),
          responseType: 'stream',
          timeout: this.timeout
        }
      );

      // Process SSE stream
      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    if (this.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://careerai.local';
      headers['X-Title'] = 'CareerAI Chatbot';
    }

    return headers;
  }

  extractResponse(data) {
    if (this.provider === 'anthropic') {
      return data.content?.[0]?.text || '';
    }
    return data.choices?.[0]?.message?.content || '';
  }

  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        return new Error('Invalid API key. Please check your configuration.');
      } else if (status === 429) {
        return new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 500 || status === 502 || status === 503) {
        return new Error('LLM service temporarily unavailable. Please try again.');
      } else {
        return new Error(`LLM API error: ${data.error?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      return error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await this.generateResponse(
        [{ role: 'user', content: 'Hi' }],
        { maxTokens: 10 }
      );
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.provider) this.provider = config.provider;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.defaultTemperature = config.temperature;
    if (config.maxTokens) this.defaultMaxTokens = config.maxTokens;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      provider: this.provider,
      model: this.model,
      temperature: this.defaultTemperature,
      maxTokens: this.defaultMaxTokens,
      hasApiKey: !!this.apiKey
    };
  }
}

module.exports = LLMService;
