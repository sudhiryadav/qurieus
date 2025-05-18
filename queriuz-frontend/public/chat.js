window.QueriuzChat = {
  init: function(config) {
    // Create a container for the chat
    const container = document.getElementById('queriuz-chat-container');
    if (!container) return;

    // Create the chat component
    const chat = document.createElement('div');
    chat.id = 'queriuz-chat';
    container.appendChild(chat);

    // Initialize the chat with the provided configuration
    console.log('xxxx config', config);
    this.renderChat(chat, config);
  },

  renderChat: function(container, config) {
    // Create the chat UI
    const chatUI = `
      <div class="queriuz-chat-wrapper" data-theme="${config.theme}" data-position="${config.position}">
        <button class="queriuz-chat-button">
          <svg viewBox="0 0 24 24" class="queriuz-chat-icon">
            <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
        <div class="queriuz-chat-window" style="display: none;">
          <div class="queriuz-chat-header">
            <h3>Chat with us</h3>
            <button class="queriuz-chat-close">×</button>
          </div>
          <div class="queriuz-chat-messages"></div>
          <form class="queriuz-chat-form">
            <input type="text" placeholder="Ask a question..." />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    `;

    container.innerHTML = chatUI;

    // Add event listeners
    const button = container.querySelector('.queriuz-chat-button');
    const closeButton = container.querySelector('.queriuz-chat-close');
    const chatWindow = container.querySelector('.queriuz-chat-window');
    const form = container.querySelector('.queriuz-chat-form');
    const input = form.querySelector('input');
    const messagesContainer = container.querySelector('.queriuz-chat-messages');

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
        // Send message to API
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: message,
            documentOwnerId: config.documentOwnerId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        
        // Remove loading message
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
          loadingMessage.remove();
        }

        // Add assistant message
        this.addMessage(messagesContainer, data.answer, 'assistant', data.sources);

        // Add follow-up suggestion if this is the first response
        if (messagesContainer.querySelectorAll('.queriuz-chat-message-assistant').length === 2) {
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
    messageDiv.className = `queriuz-chat-message queriuz-chat-message-${role}`;
    if (id) {
      messageDiv.id = id;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'queriuz-chat-message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);

    if (sources && sources.length > 0) {
      const sourcesDiv = document.createElement('div');
      sourcesDiv.className = 'queriuz-chat-message-sources';
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
  }
}; 