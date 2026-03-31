/**
 * Retrieval Service - RAG Document Storage and Retrieval
 * Stores documents with embeddings and retrieves relevant context
 */

class RetrievalService {
  constructor(embeddingService, config = {}) {
    this.embeddingService = embeddingService;
    this.documents = []; // { id, content, embedding, metadata }
    this.topK = config.topK || 3;
    this.minSimilarity = config.minSimilarity || 0.3;
    this.initialized = false;
  }

  /**
   * Initialize with predefined knowledge base
   */
  async initialize(documents) {
    console.log(`Initializing retrieval service with ${documents.length} documents...`);
    
    for (const doc of documents) {
      await this.addDocument(doc.content, doc.metadata);
    }

    this.initialized = true;
    console.log(`Retrieval service initialized with ${this.documents.length} documents`);
  }

  /**
   * Add document to knowledge base
   */
  async addDocument(content, metadata = {}) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      
      const document = {
        id: this.generateId(),
        content,
        embedding,
        metadata: {
          ...metadata,
          addedAt: new Date().toISOString()
        }
      };

      this.documents.push(document);
      return document.id;
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant documents for a query
   */
  async retrieve(query, options = {}) {
    const topK = options.topK || this.topK;
    const minSimilarity = options.minSimilarity || this.minSimilarity;

    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Calculate similarities
      const results = this.documents.map(doc => ({
        ...doc,
        similarity: this.embeddingService.cosineSimilarity(
          queryEmbedding,
          doc.embedding
        )
      }));

      // Filter and sort
      const relevant = results
        .filter(doc => doc.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return relevant.map(doc => ({
        content: doc.content,
        similarity: doc.similarity,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('Retrieval failed:', error);
      return [];
    }
  }

  /**
   * Retrieve and format context for LLM
   */
  async retrieveContext(query, options = {}) {
    const documents = await this.retrieve(query, options);

    if (documents.length === 0) {
      return null;
    }

    const context = documents
      .map((doc, index) => {
        const source = doc.metadata.source || 'Knowledge Base';
        return `[Source ${index + 1}: ${source}]\n${doc.content}`;
      })
      .join('\n\n---\n\n');

    return {
      context,
      sources: documents.map(doc => doc.metadata.source || 'Knowledge Base'),
      relevanceScores: documents.map(doc => doc.similarity)
    };
  }

  /**
   * Search documents by keyword (fallback)
   */
  keywordSearch(query, topK = 3) {
    const queryTokens = this.tokenize(query.toLowerCase());
    
    const results = this.documents.map(doc => {
      const docTokens = this.tokenize(doc.content.toLowerCase());
      const matchCount = queryTokens.filter(token => 
        docTokens.includes(token)
      ).length;
      
      return {
        ...doc,
        score: matchCount / queryTokens.length
      };
    });

    return results
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(doc => ({
        content: doc.content,
        similarity: doc.score,
        metadata: doc.metadata
      }));
  }

  /**
   * Get similar documents to a document ID
   */
  async getSimilarDocuments(documentId, topK = 3) {
    const sourceDoc = this.documents.find(doc => doc.id === documentId);
    
    if (!sourceDoc) {
      throw new Error('Document not found');
    }

    const results = this.documents
      .filter(doc => doc.id !== documentId)
      .map(doc => ({
        ...doc,
        similarity: this.embeddingService.cosineSimilarity(
          sourceDoc.embedding,
          doc.embedding
        )
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return results.map(doc => ({
      id: doc.id,
      content: doc.content,
      similarity: doc.similarity,
      metadata: doc.metadata
    }));
  }

  /**
   * Remove document by ID
   */
  removeDocument(documentId) {
    const index = this.documents.findIndex(doc => doc.id === documentId);
    
    if (index === -1) {
      return false;
    }

    this.documents.splice(index, 1);
    return true;
  }

  /**
   * Clear all documents
   */
  clearDocuments() {
    this.documents = [];
    this.initialized = false;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      initialized: this.initialized,
      avgDocumentLength: this.documents.length > 0
        ? this.documents.reduce((sum, doc) => sum + doc.content.length, 0) / this.documents.length
        : 0
    };
  }

  /**
   * Export documents (for backup/analysis)
   */
  exportDocuments() {
    return this.documents.map(doc => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata
    }));
  }

  /**
   * Helper: Generate unique ID
   */
  generateId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
}

module.exports = RetrievalService;
