/**
 * Advanced AI Chat Frontend
 * Streaming responses, feedback system, persona modes
 */

// Configuration
const API_BASE = window.location.origin;
const SESSION_KEY = 'careerai_chat_session';

// State
let sessionId = localStorage.getItem(SESSION_KEY) || generateSessionId();
let isProcessing = false;
let currentMessageIndex = 0;

// DOM Elements
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const settingsBtn = document.getElementById('settings-btn');
const clearBtn = document.getElementById('clear-btn');
const settingsPanel = document.getElementById('settings-panel');
const statusBadge = document.getElementById('status-badge');
const personaSelect = document.getElementById('persona-select');
const temperatureSlider = document.getElementById('temperature-slider');
const temperatureValue = document.getElementById('temperature-value');
const maxTokensSelect = document.getElementById('max-tokens-select');

// Initialize
init();

function init() {
  localStorage.setItem(SESSION_KEY, sessionId);
  
  // Event listeners
  sendButton.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', handleKeyPress);
  settingsBtn.addEventListener('click', toggleSettings);
  clearBtn.addEventListener('click', handleClear);
  temperatureSlider.addEventListener('input', updateTemperatureDisplay);
  
  // Auto-resize textarea
  chatInput.addEventListener('input', autoResizeTextarea);
  
  // Test connection
  testConnection();
  
  // Welcome message
  addWelcomeMessage();
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function addWelcomeMessage() {
  const welcome = `👋 Welcome! I'm your advanced AI career advisor.

I can help you with:
• Career roadmaps and learning paths
• Technology guidance and best practices
• Job search and interview preparation
• Skill development strategies
• Course recommendations

Ask me anything about your career journey!`;

  addMessage('assistant', welcome, [], 0);
}

async function testConnection() {
  try {
    const response = await fetch(`${API_BASE}/api/chat/stats`);
    if (response.ok) {
      statusBadge.textContent = 'Online';
      statusBadge.className = 'status-badge online';
    } else {
      throw new Error('API unavailable');
    }
  } catch (error) {
    statusBadge.textContent = 'Offline';
    statusBadge.className = 'status-badge offline';
    console.error('Connection test failed:', error);
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

async function handleSend() {
  const message = chatInput.value.trim();
  
  if (!message || isProcessing) return;
  
  // Add user message
  addMessage('user', message, [], currentMessageIndex++);
  chatInput.value = '';
  autoResizeTextarea();
  
  // Show typing indicator
  const typingId = showTypingIndicator();
  
  isProcessing = true;
  sendButton.disabled = true;
  
  try {
    const options = getOptions();
    
    // Use streaming response
    await streamResponse(message, options, typingId);
    
  } catch (error) {
    removeTypingIndicator(typingId);
    addMessage('assistant', `❌ Error: ${error.message}`, [], currentMessageIndex++);
  } finally {
    isProcessing = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

async function streamResponse(message, options, typingId) {
  try {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, options })
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    removeTypingIndicator(typingId);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let fullResponse = '';
    let sources = [];
    let messageElement = null;

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            if (messageElement && sources.length > 0) {
              addSourcesToMessage(messageElement, sources);
            }
            return;
          }

          try {
            const json = JSON.parse(data);
            
            if (json.error) {
              throw new Error(json.error);
            }
            
            if (json.chunk) {
              fullResponse += json.chunk;
              
              if (!messageElement) {
                messageElement = addMessage('assistant', '', json.sources || [], currentMessageIndex++);
              }
              
              updateMessageContent(messageElement, fullResponse);
              sources = json.sources || [];
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

function addMessage(role, content, sources = [], index = 0) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.dataset.index = index;
  
  const roleLabel = document.createElement('div');
  roleLabel.className = 'message-role';
  roleLabel.textContent = role === 'user' ? 'You' : 'AI Assistant';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = formatMessage(content);
  
  messageDiv.appendChild(roleLabel);
  messageDiv.appendChild(bubble);
  
  if (role === 'assistant' && content) {
    const actions = createMessageActions(index);
    messageDiv.appendChild(actions);
  }
  
  if (sources.length > 0) {
    addSourcesToMessage(messageDiv, sources);
  }
  
  chatLog.appendChild(messageDiv);
  scrollToBottom();
  
  return messageDiv;
}

function updateMessageContent(messageElement, content) {
  const bubble = messageElement.querySelector('.message-bubble');
  bubble.innerHTML = formatMessage(content);
  scrollToBottom();
}

function formatMessage(text) {
  // Convert markdown-like formatting
  let formatted = text;
  
  // Code blocks
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Bullet points
  formatted = formatted.replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createMessageActions(index) {
  const actions = document.createElement('div');
  actions.className = 'message-actions';
  
  const thumbsUp = document.createElement('button');
  thumbsUp.textContent = '👍';
  thumbsUp.title = 'Good response';
  thumbsUp.onclick = () => submitFeedback(index, 'positive', thumbsUp);
  
  const thumbsDown = document.createElement('button');
  thumbsDown.textContent = '👎';
  thumbsDown.title = 'Poor response';
  thumbsDown.onclick = () => submitFeedback(index, 'negative', thumbsDown);
  
  const copy = document.createElement('button');
  copy.textContent = '📋';
  copy.title = 'Copy response';
  copy.onclick = () => copyMessage(index);
  
  actions.appendChild(thumbsUp);
  actions.appendChild(thumbsDown);
  actions.appendChild(copy);
  
  return actions;
}

async function submitFeedback(index, rating, button) {
  try {
    await fetch(`${API_BASE}/api/chat/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, messageIndex: index, rating })
    });
    
    button.classList.add(rating === 'positive' ? 'active' : 'negative');
    setTimeout(() => button.classList.remove('active', 'negative'), 2000);
  } catch (error) {
    console.error('Feedback error:', error);
  }
}

function copyMessage(index) {
  const message = document.querySelector(`[data-index="${index}"] .message-bubble`);
  if (message) {
    const text = message.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    });
  }
}

function addSourcesToMessage(messageElement, sources) {
  if (!sources || sources.length === 0) return;
  
  const sourcesDiv = document.createElement('div');
  sourcesDiv.className = 'message-sources';
  sourcesDiv.innerHTML = `<strong>📚 Sources:</strong> ${sources.join(', ')}`;
  
  messageElement.appendChild(sourcesDiv);
}

function showTypingIndicator() {
  const id = `typing_${Date.now()}`;
  const typing = document.createElement('div');
  typing.id = id;
  typing.className = 'message assistant';
  typing.innerHTML = `
    <div class="message-role">AI Assistant</div>
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  chatLog.appendChild(typing);
  scrollToBottom();
  
  return id;
}

function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function getOptions() {
  return {
    persona: personaSelect.value,
    temperature: parseFloat(temperatureSlider.value),
    maxTokens: parseInt(maxTokensSelect.value)
  };
}

function toggleSettings() {
  settingsPanel.classList.toggle('active');
}

async function handleClear() {
  if (!confirm('Clear conversation history?')) return;
  
  try {
    await fetch(`${API_BASE}/api/chat/session/${sessionId}`, {
      method: 'DELETE'
    });
    
    chatLog.innerHTML = '';
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
    currentMessageIndex = 0;
    
    addWelcomeMessage();
  } catch (error) {
    console.error('Clear error:', error);
    showToast('Failed to clear conversation');
  }
}

function updateTemperatureDisplay() {
  temperatureValue.textContent = temperatureSlider.value;
}

function autoResizeTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
}

function scrollToBottom() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #2d3748;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: fadeIn 0.3s ease-in;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
