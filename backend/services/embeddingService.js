/**
 * Embedding Service - Generate Vector Embeddings for RAG
 * Supports OpenAI embeddings and fallback to simple TF-IDF
 */

const axios = require('axios');

class EmbeddingService {
  constructor(config = {}) {
    this.provider = config.provider || 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'text-embedding-3-small';
    this.cache = new Map(); // Cache embeddings to reduce API calls
    this.dimensions = config.dimensions || 1536;
    this.useFallback = config.useFallback !== false;
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for embedding');
    }

    // Check cache
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try API embedding
    if (this.apiKey) {
      try {
        const embedding = await this.generateApiEmbedding(text);
        this.cache.set(cacheKey, embedding);
        return embedding;
      } catch (error) {
        console.warn('API embedding failed:', error.message);
        if (!this.useFallback) {
          throw error;
        }
      }
    }

    // Fallback to simple embedding
    if (this.useFallback) {
      const embedding = this.generateSimpleEmbedding(text);
      this.cache.set(cacheKey, embedding);
      return embedding;
    }

    throw new Error('No API key provided and fallback disabled');
  }

  /**
   * Generate embedding using OpenAI API
   */
  async generateApiEmbedding(text) {
    const endpoint = 'https://api.openai.com/v1/embeddings';
    
    const response = await axios.post(
      endpoint,
      {
        model: this.model,
        input: text.slice(0, 8000) // Limit input length
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 10000
      }
    );

    return response.data.data[0].embedding;
  }

  /**
   * Simple TF-IDF based embedding (fallback)
   */
  generateSimpleEmbedding(text) {
    const tokens = this.tokenize(text);
    const vocab = this.getVocabulary();
    const embedding = new Array(256).fill(0); // Fixed dimension for consistency

    // TF (Term Frequency)
    const tf = {};
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });

    // Simple hash-based vector
    Object.keys(tf).forEach(token => {
      const hash = this.simpleHash(token) % 256;
      embedding[hash] += tf[token] / tokens.length;
    });

    // Normalize
    return this.normalize(embedding);
  }

  /**
   * Batch generate embeddings
   */
  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Helper: Tokenize text
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Helper: Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Helper: Normalize vector
   */
  normalize(vector) {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );
    
    if (magnitude === 0) return vector;
    
    return vector.map(val => val / magnitude);
  }

  /**
   * Helper: Get cache key
   */
  getCacheKey(text) {
    return text.slice(0, 100); // Use first 100 chars as key
  }

  /**
   * Helper: Basic vocabulary (for fallback)
   */
  getVocabulary() {
    return [
      'career', 'job', 'role', 'skill', 'course', 'learn', 'technology',
      'developer', 'engineer', 'data', 'science', 'software', 'web',
      'python', 'java', 'javascript', 'react', 'node', 'ai', 'ml',
      'roadmap', 'path', 'guide', 'tutorial', 'project', 'internship'
    ];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      provider: this.provider,
      model: this.model,
      hasApiKey: !!this.apiKey
    };
  }
}

module.exports = EmbeddingService;
