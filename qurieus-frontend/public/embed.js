(function() {
  'use strict';
  
  // Create a container for the widget
  const container = document.createElement('div');
  container.id = 'qurieus-chat-widget';
  document.body.appendChild(container);

  // Brand color variable
  const BRAND_COLOR = '#3758f9';
  const DARK_BRAND_COLOR = '#8b5cf6';

  // Get base URL from the current script's src attribute
  const getBaseUrl = () => {
    const currentScript = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    
    console.log('Current script:', currentScript);
    
    if (currentScript && currentScript.src) {
      const url = new URL(currentScript.src);
      const baseUrl = `${url.protocol}//${url.host}`;
      console.log('Base URL from script:', baseUrl);
      return baseUrl;
    }
    
    // Fallback to current page URL
    const fallbackUrl = `${window.location.protocol}//${window.location.host}`;
    console.log('Base URL fallback:', fallbackUrl);
    return fallbackUrl;
  };

  // Chat Widget State Management
  let widgetState = {
    isOpen: false,
    messages: [],
    inputMessage: '',
    isLoading: false
  };

  let widgetConfig = {};
  let widgetContainer = null;

  // State management function
  function setWidgetState(newState) {
    widgetState = { ...widgetState, ...newState };
    renderWidget();
  }

  // Render the widget
  function renderWidget() {
    if (!widgetContainer) return;
    
    widgetContainer.innerHTML = '';
    if (!widgetState.isOpen) {
      // Render chat button
      const button = document.createElement('button');
      button.innerHTML = '<img src="http://localhost:8000/images/logo/logo.svg" alt="Qurieus" width="30" height="30" style="margin:auto" />';
      button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : BRAND_COLOR};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 24px;
        position: fixed;
        bottom: 20px;
        text-align: center;
        ${widgetConfig.position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
        z-index: 9999;
        transition: transform 0.2s ease;
      `;
      button.onmouseenter = () => button.style.transform = 'scale(1.1)';
      button.onmouseleave = () => button.style.transform = 'scale(1)';
      button.onclick = () => setWidgetState({ isOpen: true });
      widgetContainer.appendChild(button);
      widgetContainer.style.cssText = `
      text-align: center;
    `;
    

      return;
    }
    
    // Render chat window
    const chatWindow = document.createElement('div');
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 20px;
      ${widgetConfig.position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
      width: 350px;
      height: 500px;
      background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : 'white'};
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f9fafb'};
      border-radius: 12px 12px 0 0;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Chat Support';
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#4b5563' : '#e5e7eb';
    closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = 'transparent';
    closeBtn.onclick = () => setWidgetState({ isOpen: false });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    
    // Render messages
    widgetState.messages.forEach((msg, index) => {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        align-self: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};
        max-width: 80%;
        animation: fadeIn 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.textContent = msg.content;
      messageBubble.style.cssText = `
        padding: 8px 12px;
        border-radius: 12px;
        background-color: ${msg.role === 'user' 
          ? (widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR)
          : (widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6')};
        color: ${msg.role === 'user' ? 'white' : (widgetConfig.theme === 'dark' ? 'white' : '#111827')};
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        text-align: left;
      `;
      
      // Add timestamp
      const timestamp = document.createElement('div');
      const messageTime = msg.timestamp ? new Date(msg.timestamp) : new Date();
      timestamp.textContent = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timestamp.style.cssText = `
        font-size: 11px;
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        align-self: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};
        margin-top: 2px;
      `;
      
      messageDiv.appendChild(messageBubble);
      messageDiv.appendChild(timestamp);
      messagesContainer.appendChild(messageDiv);
    });
    
    // Loading indicator with peeking character
    if (widgetState.isLoading) {
      // Create peeking character container
      const peekingContainer = document.createElement('div');
      peekingContainer.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 16px;
        z-index: 1000;
        animation: peekIn 0.3s ease;
      `;
      
      // Create character bubble
      const characterBubble = document.createElement('div');
      characterBubble.style.cssText = `
        background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
      `;
      
      // Add character icon (robot/assistant emoji)
      const characterIcon = document.createElement('div');
      characterIcon.innerHTML = '🤖';
      characterIcon.style.cssText = `
        font-size: 16px;
        animation: bounce 1s infinite;
      `;
      
      // Add typing text
      const typingText = document.createElement('span');
      typingText.textContent = 'Typing';
      typingText.style.cssText = `
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        font-size: 12px;
        font-weight: 500;
      `;
      
      // Add typing dots
      const dots = document.createElement('div');
      dots.innerHTML = '<span>●</span><span>●</span><span>●</span>';
      dots.style.cssText = `
        display: flex;
        gap: 2px;
      `;
      
      const dotSpans = dots.querySelectorAll('span');
      dotSpans.forEach((dot, index) => {
        dot.style.cssText = `
          animation: typing 1.4s infinite;
          animation-delay: ${index * 0.2}s;
          opacity: 0.3;
          font-size: 8px;
          color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        `;
      });
      
      // Add tail/pointer to the bubble
      const tail = document.createElement('div');
      tail.style.cssText = `
        position: absolute;
        bottom: -6px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
      `;
      
      characterBubble.appendChild(characterIcon);
      characterBubble.appendChild(typingText);
      characterBubble.appendChild(dots);
      characterBubble.appendChild(tail);
      peekingContainer.appendChild(characterBubble);
      
      // Add to chat window instead of messages container
      chatWindow.appendChild(peekingContainer);
    }
    
    // Add typing animation CSS
    const typingStyle = document.createElement('style');
    typingStyle.textContent = `
      @keyframes typing {
        0%, 60%, 100% { opacity: 0.3; }
        30% { opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes peekIn {
        from { opacity: 0; transform: translateY(20px) scale(0.8); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-3px); }
        60% { transform: translateY(-2px); }
      }
    `;
    document.head.appendChild(typingStyle);
    
    // Input form
    const form = document.createElement('form');
    form.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      border-radius: 0 0 12px 12px;
    `;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = widgetState.inputMessage;
    input.placeholder = 'Type your message...';
    input.disabled = widgetState.isLoading;
    input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background-color: ${widgetConfig.theme === 'dark' ? '#374151' : 'white'};
      color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
      outline: none;
      transition: border-color 0.2s ease;
    `;
    input.onfocus = () => input.style.borderColor = BRAND_COLOR;
    input.onblur = () => input.style.borderColor = '#d1d5db';
    
    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.innerHTML = 'Send';
    sendBtn.disabled = widgetState.isLoading || !widgetState.inputMessage.trim();
    sendBtn.style.cssText = `
      padding: 8px 16px;
      background-color: ${widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease;
      opacity: ${widgetState.isLoading || !widgetState.inputMessage.trim() ? '0.5' : '1'};
    `;
    sendBtn.onmouseenter = () => {
      if (!widgetState.isLoading && widgetState.inputMessage.trim()) {
        sendBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#7c3aed' : '#7c3aed';
      }
    };
    sendBtn.onmouseleave = () => {
      sendBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR;
    };
    
    // Handle form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!widgetState.inputMessage.trim() || widgetState.isLoading) return;
      
      const userMessage = widgetState.inputMessage.trim();
      
      // Update state directly without triggering re-render
      widgetState.inputMessage = '';
      widgetState.messages = [...widgetState.messages, { 
        role: 'user', 
        content: userMessage, 
        timestamp: new Date().toISOString() 
      }];
      widgetState.isLoading = true;
      
      // Update input and button directly
      input.value = '';
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
      
      // Add user message to UI directly
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        align-self: flex-end;
        max-width: 80%;
        animation: fadeIn 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.textContent = userMessage;
      messageBubble.style.cssText = `
        padding: 8px 12px;
        border-radius: 12px;
        background-color: ${widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR};
        color: white;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        text-align: left;
      `;
      
      // Add timestamp for user message
      const userTimestamp = document.createElement('div');
      userTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      userTimestamp.style.cssText = `
        font-size: 11px;
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        align-self: flex-end;
        margin-top: 2px;
      `;
      
      messageDiv.appendChild(messageBubble);
      messageDiv.appendChild(userTimestamp);
      messagesContainer.appendChild(messageDiv);
      
      // Add peeking character indicator
      const peekingContainer = document.createElement('div');
      peekingContainer.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 16px;
        z-index: 1000;
        animation: peekIn 0.3s ease;
      `;
      
      const characterBubble = document.createElement('div');
      characterBubble.style.cssText = `
        background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
      `;
      
      const characterIcon = document.createElement('div');
      characterIcon.innerHTML = '🤖';
      characterIcon.style.cssText = `
        font-size: 16px;
        animation: bounce 1s infinite;
      `;
      
      const typingText = document.createElement('span');
      typingText.textContent = 'Typing';
      typingText.style.cssText = `
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        font-size: 12px;
        font-weight: 500;
      `;
      
      const dots = document.createElement('div');
      dots.innerHTML = '<span>●</span><span>●</span><span>●</span>';
      dots.style.cssText = `
        display: flex;
        gap: 2px;
      `;
      
      const dotSpans = dots.querySelectorAll('span');
      dotSpans.forEach((dot, index) => {
        dot.style.cssText = `
          animation: typing 1.4s infinite;
          animation-delay: ${index * 0.2}s;
          opacity: 0.3;
          font-size: 8px;
          color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        `;
      });
      
      const tail = document.createElement('div');
      tail.style.cssText = `
        position: absolute;
        bottom: -6px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
      `;
      
      characterBubble.appendChild(characterIcon);
      characterBubble.appendChild(typingText);
      characterBubble.appendChild(dots);
      characterBubble.appendChild(tail);
      peekingContainer.appendChild(characterBubble);
      
      chatWindow.appendChild(peekingContainer);
      
      // Auto-scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      try {
        // Validate API key
        if (!widgetConfig.apiKey) {
          throw new Error('API key is missing');
        }
        
        console.log('Sending request with config:', {
          baseUrl: widgetConfig.baseUrl,
          apiKey: widgetConfig.apiKey,
          message: userMessage
        });
        
        const response = await fetch(widgetConfig.baseUrl + '/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': widgetConfig.apiKey
          },
          body: JSON.stringify({
            message: userMessage,
            apiKey: widgetConfig.apiKey
          })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Query failed:', errorText);
          throw new Error(`Query failed: ${response.status} ${errorText}`);
        }
        
        // Remove peeking character indicator
        const peekingIndicator = chatWindow.querySelector('[style*="position: absolute"][style*="bottom: 80px"]');
        if (peekingIndicator) {
          peekingIndicator.remove();
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let fullResponse = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          
          // Try to parse as JSON to extract just the response text
          try {
            const jsonResponse = JSON.parse(fullResponse);
            assistantMessage = jsonResponse.response || fullResponse;
          } catch (e) {
            // If not valid JSON, use the raw response
            assistantMessage = fullResponse;
          }
          
          // Update assistant message in state
          widgetState.messages = [...widgetState.messages, { 
            role: 'assistant', 
            content: assistantMessage, 
            timestamp: new Date().toISOString() 
          }];
          
          // Update or create assistant message in UI
          let assistantDiv = messagesContainer.querySelector('.assistant-message');
          if (!assistantDiv) {
            assistantDiv = document.createElement('div');
            assistantDiv.className = 'assistant-message';
            assistantDiv.style.cssText = `
              align-self: flex-start;
              max-width: 80%;
              animation: fadeIn 0.3s ease;
              display: flex;
              flex-direction: column;
              gap: 4px;
            `;
            messagesContainer.appendChild(assistantDiv);
          }
          
          const assistantBubble = document.createElement('div');
          assistantBubble.textContent = assistantMessage;
          assistantBubble.style.cssText = `
            padding: 8px 12px;
            border-radius: 12px;
            background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
            color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
            text-align: left;
          `;
          
          // Add timestamp for assistant message
          const assistantTimestamp = document.createElement('div');
          assistantTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          assistantTimestamp.style.cssText = `
            font-size: 11px;
            color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
            align-self: flex-start;
            margin-top: 2px;
          `;
          
          assistantDiv.innerHTML = '';
          assistantDiv.appendChild(assistantBubble);
          assistantDiv.appendChild(assistantTimestamp);
          
          // Auto-scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      } catch (error) {
        console.error('Chat error:', error);
        
        // Remove peeking character indicator
        const peekingIndicator = chatWindow.querySelector('[style*="position: absolute"][style*="bottom: 80px"]');
        if (peekingIndicator) {
          peekingIndicator.remove();
        }
        
        // Add error message
        widgetState.messages = [...widgetState.messages, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        }];
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          align-self: flex-start;
          max-width: 80%;
          animation: fadeIn 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        `;
        
        const errorBubble = document.createElement('div');
        errorBubble.textContent = 'Sorry, I encountered an error. Please try again.';
        errorBubble.style.cssText = `
          padding: 8px 12px;
          border-radius: 12px;
          background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
          color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          text-align: left;
        `;
        
        // Add timestamp for error message
        const errorTimestamp = document.createElement('div');
        errorTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        errorTimestamp.style.cssText = `
          font-size: 11px;
          color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
          align-self: flex-start;
          margin-top: 2px;
        `;
        
        errorDiv.appendChild(errorBubble);
        errorDiv.appendChild(errorTimestamp);
        messagesContainer.appendChild(errorDiv);
        
        // Auto-scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } finally {
        // Remove peeking character indicator
        const peekingIndicator = chatWindow.querySelector('[style*="position: absolute"][style*="bottom: 80px"]');
        if (peekingIndicator) {
          peekingIndicator.remove();
        }
        
        // Update state and UI
        widgetState.isLoading = false;
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
      }
    };
    
    // Handle input changes
    input.oninput = (e) => {
      // Update state without triggering re-render
      widgetState.inputMessage = e.target.value;
      widgetState.isLoading = false;
      
      // Update send button state directly
      sendBtn.disabled = widgetState.isLoading || !e.target.value.trim();
      sendBtn.style.opacity = widgetState.isLoading || !e.target.value.trim() ? '0.5' : '1';
    };
    
    form.appendChild(input);
    form.appendChild(sendBtn);
    
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(form);
    
    widgetContainer.appendChild(chatWindow);
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Main ChatWidget function
  function ChatWidget(config) {
    widgetConfig = config;
    widgetContainer = document.getElementById('qurieus-chat-widget');
    
    // Initialize with initial message
    setWidgetState({
      messages: [{ 
        role: 'assistant', 
        content: config.initialMessage || 'Hello! How can I help you today?',
        timestamp: new Date().toISOString()
      }]
    });
    
    return widgetContainer;
  }

  // Create global initialization function
  window.QurieusChat = {
    init: (config) => {
      if (!config.apiKey) {
        console.error('API key is required');
        return;
      }
      
      // Clear the container
      container.innerHTML = '';
      
      // Initialize the ChatWidget (it handles rendering internally)
      ChatWidget({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        initialMessage: config.initialMessage,
        position: config.position,
        theme: config.theme,
        showSources: config.showSources
      });
    }
  };

  // Auto-initialize if config is provided via data attributes
  const config = {
    apiKey: document.currentScript.getAttribute('data-api-key'),
    baseUrl: getBaseUrl(),
    initialMessage: document.currentScript.getAttribute('data-initial-message'),
    position: document.currentScript.getAttribute('data-position'),
    theme: document.currentScript.getAttribute('data-theme'),
    showSources: document.currentScript.getAttribute('data-show-sources') === 'true',
  };

  console.log('Config loaded:', config);

  if (config.apiKey) {
    // Initialize immediately
    window.QurieusChat.init(config);
  } else {
    console.warn('No API key found in data attributes');
  }
})(); 