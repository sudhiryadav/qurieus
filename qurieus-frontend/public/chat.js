window.QurieusChat = {
  init: function(config) {
    // Create a container for the chat
    const container = document.getElementById('qurieus-chat-container');
    if (!container) return;

    // Create the chat component
    const chat = document.createElement('div');
    chat.id = 'qurieus-chat';
    container.appendChild(chat);

    // Initialize the chat with the provided configuration
    this.renderChat(chat, config);
  },

  renderChat: function(container, config) {
    // Create the chat UI
    const chatUI = `
      <div class="qurieus-chat-wrapper" data-theme="${config.theme}" data-position="${config.position}">
        <button class="qurieus-chat-button">
          <svg viewBox="0 0 24 24" class="qurieus-chat-icon">
            <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
        <div class="qurieus-chat-window" style="display: none;">
          <div class="qurieus-chat-header">
            <h3>Chat with us</h3>
            <button class="qurieus-chat-close">×</button>
          </div>
          <div class="qurieus-chat-messages"></div>
          <form class="qurieus-chat-form">
            <input type="text" placeholder="Ask a question..." />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    `;

    container.innerHTML = chatUI;

    // Add event listeners
    const button = container.querySelector('.qurieus-chat-button');
    const closeButton = container.querySelector('.qurieus-chat-close');
    const chatWindow = container.querySelector('.qurieus-chat-window');
    const form = container.querySelector('.qurieus-chat-form');
    const input = form.querySelector('input');
    const messagesContainer = container.querySelector('.qurieus-chat-messages');

    // Add welcome message when chat is opened
    button.addEventListener('click', () => {
      chatWindow.style.display = 'flex';
      button.style.display = 'none';
      
      // Add welcome message if this is the first time opening
      if (messagesContainer.children.length === 0) {
        this.addMessage(messagesContainer, 
          "👋 Hi! I'm your AI assistant. I can help you find information for you. What would you like to know?", 
          'assistant'
        );
      }
    });

    closeButton.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      button.style.display = 'flex';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      this.addMessage(messagesContainer, message, 'user');
      input.value = '';

      // Add loading message
      const loadingId = 'loading-' + Date.now();
      this.addMessage(messagesContainer, 'Thinking...', 'assistant', null, loadingId);

      try {
        const visitorId = getVisitorId();
        const history = await fetchChatHistory(visitorId, config.documentOwnerId, 10);
        
        // Send message to API
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-visitor-id': visitorId,
          },
          body: JSON.stringify({
            query: message,
            documentOwnerId: config.documentOwnerId,
            visitorId,
            history,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        // Remove loading message
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
          loadingMessage.remove();
        }

        // For debugging, let's first try to get the raw response
        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        // Create a new message container for the response
        const messageId = 'message-' + Date.now();
        this.addMessage(messagesContainer, '', 'assistant', null, messageId);
        const messageElement = document.getElementById(messageId);
        const contentElement = messageElement.querySelector('.qurieus-chat-message-content');

        // Parse the response
        const lines = rawResponse.split('\n').filter(Boolean);
        let fullResponse = '';
        let sources = null;

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            console.log('Parsed data:', data);
            if (data.chunk) {
              fullResponse += data.chunk;
              contentElement.innerHTML = this.markdownToHtml(fullResponse);
              messageElement.scrollIntoView({ behavior: 'smooth' });
            } else if (data.final) {
              sources = data.sources;
              // Add sources to the message
              const sourcesDiv = document.createElement('div');
              sourcesDiv.className = 'qurieus-chat-message-sources';
              sourcesDiv.innerHTML = `
                <p>Sources:</p>
                <ul>
                  ${sources.map(source => `
                    <li>${source.document} (Similarity: ${(source.similarity * 100).toFixed(1)}%)</li>
                  `).join('')}
                </ul>
              `;
              sourcesDiv.style.display = 'none';
              messageElement.appendChild(sourcesDiv);
            }
          } catch (e) {
            console.error('Error parsing line:', e, 'Raw line:', line);
          }
        }

        // Add follow-up suggestion if this is the first response
        if (messagesContainer.querySelectorAll('.qurieus-chat-message-assistant').length === 2) {
          setTimeout(() => {
            this.addMessage(messagesContainer, 
              "Is there anything specific about this you'd like me to explain further?", 
              'assistant'
            );
          }, 1000);
        }
      } catch (error) {
        // Remove loading message
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
          loadingMessage.remove();
        }

        this.addMessage(messagesContainer, 'Sorry, I encountered an error. Please try again.', 'assistant');
      }
    });
  },

  addMessage: function(container, content, role, sources = null, id = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `qurieus-chat-message qurieus-chat-message-${role}`;
    if (id) {
      messageDiv.id = id;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'qurieus-chat-message-content';
    
    // Convert markdown to HTML
    contentDiv.innerHTML = this.markdownToHtml(content);
    messageDiv.appendChild(contentDiv);

    if (sources && sources.length > 0) {
      const sourcesDiv = document.createElement('div');
      sourcesDiv.style.display = 'none';
      sourcesDiv.className = 'qurieus-chat-message-sources';
      sourcesDiv.innerHTML = `
        <p>Sources:</p>
        <ul>
          ${sources.map(source => `
            <li>${source.document} (Similarity: ${(source.similarity * 100).toFixed(1)}%)</li>
          `).join('')}
        </ul>
      `;
      messageDiv.appendChild(sourcesDiv);
    }

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  },

  markdownToHtml: function(markdown) {
    // Normalize line endings and remove leading spaces
    let html = markdown
      .replace(/\r\n/g, '\n')
      .replace(/^\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n');

    // Convert markdown to HTML
    html = html
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>');

    // Numbered lists: treat each line starting with number. as a new item, even with blank lines
    html = html.replace(/(?:^|\n)(\d+\.\s+[^\n]+)(?=\n|$)/g, function(match, item) {
      return `<li>${item.replace(/^\d+\.\s+/, '')}</li>`;
    });
    // Wrap consecutive <li> in <ol>
    html = html.replace(/(<li>.*?<\/li>)+/gs, function(match) {
      return `<ol>${match}</ol>`;
    });

    // Bullet points
    html = html.replace(/(?:^|\n)([-*]\s+[^\n]+)(?=\n|$)/g, function(match, item) {
      return `<li>${item.replace(/^[-*]\s+/, '')}</li>`;
    });
    html = html.replace(/(<li>.*?<\/li>)+/gs, function(match) {
      // If not already wrapped in <ol>, wrap in <ul>
      if (!/^<ol>/.test(match)) return `<ul>${match}</ul>`;
      return match;
    });

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Remove <br> right after <ol> or <ul> and before </ol> or </ul>
    html = html
      .replace(/<ol><br>/g, '<ol>')
      .replace(/<ul><br>/g, '<ul>')
      .replace(/<br><\/ol>/g, '</ol>')
      .replace(/<br><\/ul>/g, '</ul>');

    return html;
  }
};

function getVisitorId() {
  let id = localStorage.getItem('qurieus_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('qurieus_visitor_id', id);
  }
  return id;
}

async function fetchChatHistory(visitorId, userId, limit = 10) {
  try {
    const res = await fetch(`/api/chat/history?visitorId=${visitorId}&userId=${userId}&limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}