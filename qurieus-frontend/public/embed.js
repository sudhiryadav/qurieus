(function () {
  'use strict';

  // Create a container for the widget
  const container = document.createElement('div');
  container.id = 'qurieus-chat-widget';
  document.body.appendChild(container);

  // Brand color variable
  const BRAND_COLOR = '#3758f9';
  const DARK_BRAND_COLOR = '#3758f9';

  // Get base URL from the current script's src attribute
  const getBaseUrl = () => {
    const currentScript = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    if (currentScript && currentScript.src) {
      const url = new URL(currentScript.src);
      const baseUrl = `${url.protocol}//${url.host}`;
      return baseUrl;
    }

    // Fallback to current page URL
    const fallbackUrl = `${window.location.protocol}//${window.location.host}`;
    return fallbackUrl;
  };

  // Initialize widget state
  let widgetState = {
    isOpen: false,
    isLoading: false,
    inputMessage: '',
    messages: [],
    visitorInfoSubmitted: false
  };

  // Socket.IO connection for real-time messages
  let socket = null;
  let currentChatId = null;
  let visitorId = null;

  // Handle user disconnect
  function handleUserDisconnect() {
    if (currentChatId && visitorId) {
      // User disconnecting, cleaning up chat assignment

      // Call disconnect API
      fetch(`${widgetConfig.baseUrl}/api/user/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: currentChatId,
          visitorId: visitorId
        })
      }).then(response => {
        if (response.ok) {
          // Disconnect cleanup successful
        } else {
          // Disconnect cleanup failed
        }
      }).catch(error => {
        // Disconnect cleanup error
      });
    }
  }

  // Add disconnect event listeners
  function addDisconnectListeners() {
    // Handle page unload/close
    window.addEventListener('beforeunload', handleUserDisconnect);

    // Handle tab visibility change (user switches tabs or minimizes)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // User might be leaving, but don't disconnect immediately
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      // Navigation detected
    });
  }

  // Initialize Socket.IO connection
  function initSocket() {
    if (socket) return socket;

    // Check if Socket.IO is loaded
    if (typeof io === 'undefined') {
      return null;
    }

    try {
      const socketUrl = widgetConfig.baseUrl;
      socket = io(socketUrl, {
        autoConnect: true,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        // Socket.IO connected
      });

      socket.on('disconnect', () => {
        // Socket.IO disconnected
      });

      socket.on('connect_error', (error) => {
        // Socket.IO connection error
      });

      // Listen for real-time chat messages
      socket.on('chat_message', (message) => {
        // Only process messages for the current chat
        if (message.conversationId === currentChatId) {
          // Check if this is a user message that was already added locally
          const isUserMessage = message.role === 'user';
          const isDuplicateUserMessage = isUserMessage && widgetState.messages.some(msg =>
            msg.role === 'user' &&
            msg.content === message.content &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(message.createdAt || Date.now()).getTime()) < 5000
          );

          if (isDuplicateUserMessage) {
            return;
          }

          // Add message to state
          widgetState.messages = [...widgetState.messages, {
            role: message.role,
            content: message.content,
            timestamp: message.createdAt || new Date().toISOString()
          }];

          // Add message to UI
          addMessageToUI(message.role, message.content, message.createdAt || new Date().toISOString());
        }
      });

      // Listen for chat status updates (e.g., resolved, closed)
      socket.on('chat_status', (data) => {
        if (data.meta && data.meta.chatCompleted) {
          // Show completion message
          addMessageToUI('system', data.meta.completionMessage, new Date().toISOString());

          // Show transcription download offer
          setTimeout(() => {
            const downloadMessage = '📄 Would you like to download a transcript of this conversation?';
            addMessageToUI('system', downloadMessage, new Date().toISOString(), false, false, null, true);
          }, 1000);
        }
      });

      return socket;
    } catch (error) {
      return null;
    }
  }

  // Join chat room
  function joinChatRoom(chatId, visitorId) {
    if (socket && chatId) {
      socket.emit('join', {
        chatId,
        visitorId,
        role: 'user'
      });
      currentChatId = chatId;
    }
  }

  // Add message to UI without re-rendering everything
  function addMessageToUI(role, content, timestamp, showAgentButtons = false, showQueueInfo = false, queuePosition = null, isSystemMessage = false) {
    const messagesContainer = document.querySelector('.qurieus-chat-messages');
    if (!messagesContainer) {
      return;
    }

    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
      display: flex;
      align-items: flex-end;
      gap: 8px;
      margin-bottom: 12px;
      ${role === 'user' ? 'flex-direction: row-reverse;' : 'flex-direction: row;'}
    `;

    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background-color: ${role === 'user'
        ? (widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR)
        : role === 'agent'
          ? '#10b981' // Green for agent
          : role === 'system'
            ? '#f59e0b' // Orange for system messages
            : (widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6')};
    `;

    // Icon
    const icon = document.createElement('img');
    if (role === 'user') {
      icon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDcuNjU2ODUgMTMgNkMxMyA0LjM0MzE1IDExLjY1NjkgMyAxMCAzQzguMzQzMTUgMyA3IDQuMzQzMTUgNyA2QzcgNy42NTY4NSA4LjM0MzE1IDkgMTAgOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zIDE3QzMgMTMuNjg2MyA2LjEzNDAxIDExIDEwIDExQzEzLjg2NiAxMSAxNyAxMy42ODYzIDE3IDE3VjE5QzE3IDE5LjU1MjMgMTYuNTUyMyAyMCAxNiAyMEg0QzMuNDQ3NzIgMjAgMyAxOS41NTIzIDMgMTlWMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    } else if (role === 'agent') {
      icon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDcuNjU2ODUgMTMgNkMxMyA0LjM0MzE1IDExLjY1NjkgMyAxMCAzQzguMzQzMTUgMyA3IDQuMzQzMTUgNyA2QzcgNy42NTY4NSA4LjM0MzE1IDkgMTAgOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zIDE3QzMgMTMuNjg2MyA2LjEzNDAxIDExIDEwIDExQzEzLjg2NiAxMSAxNyAxMy42ODYzIDE3IDE3VjE5QzE3IDE5LjU1MjMgMTYuNTUyMyAyMCAxNiAyMEg0QzMuNDQ3NzIgMjAgMyAxOS41NTIzIDMgMTlWMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    } else if (role === 'system') {
      // System message icon (info icon)
      icon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOCAxMEE4IDggMCAxIDEgMiAxMGE4IDggMCAwIDEgMTYgMHptLTctNGEyIDIgMCAxMS00IDAgMiAyIDAgMCAxIDQgMHptMCA2YTIgMiAwIDAwLTIgMmgxYTIgMiAwIDAwMC00aC0xYTIgMiAwIDAwLTIgMnYxYTIgMiAwIDAwMiAyaDFhMiAyIDAgMCAwIDItMnYtMWEyIDIgMCAwIDAtMi0yeiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
    } else {
      icon.src = widgetConfig.baseUrl + '/images/logo/logo.svg';
    }
    icon.style.cssText = `
      width: 20px;
      height: 20px;
    `;

    iconContainer.appendChild(icon);

    // Message content container
    const messageContentContainer = document.createElement('div');
    messageContentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: calc(100% - 40px);
    `;

    const messageBubble = document.createElement('div');
    // Use formatMessageText for all message types to enable URL formatting
    messageBubble.innerHTML = formatMessageText(content);
    messageBubble.style.cssText = `
      padding: 8px 12px;
      border-radius: 12px;
      background-color: ${role === 'user'
        ? (widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR)
        : role === 'agent'
          ? '#10b981' // Green for agent
          : role === 'system'
            ? '#f59e0b' // Orange for system messages
            : (widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6')};
      color: ${role === 'user' || role === 'agent' || role === 'system' ? 'white' : (widgetConfig.theme === 'dark' ? 'white' : '#111827')};
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
      text-align: left;
      max-width: 100%;
      ${role === 'system' ? 'font-style: italic;' : ''}
    `;

    // Add timestamp and role label
    const timestampElement = document.createElement('div');
    const messageTime = timestamp ? new Date(timestamp) : new Date();
    timestampElement.style.cssText = `
      font-size: 11px;
      color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      align-self: ${role === 'user' ? 'flex-end' : 'flex-start'};
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;

    const timeSpan = document.createElement('span');
    timeSpan.textContent = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timestampElement.appendChild(timeSpan);

    // Add role label for non-user messages
    if (role !== 'user') {
      const roleLabel = document.createElement('span');
      roleLabel.style.cssText = `
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 500;
      `;

      if (role === 'agent') {
        roleLabel.textContent = 'Agent';
        roleLabel.style.backgroundColor = '#10b981';
        roleLabel.style.color = 'white';
      } else if (role === 'assistant') {
        roleLabel.textContent = 'AI';
        roleLabel.style.backgroundColor = widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6';
        roleLabel.style.color = widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280';
      } else if (role === 'system') {
        roleLabel.textContent = 'System';
        roleLabel.style.backgroundColor = '#f59e0b';
        roleLabel.style.color = 'white';
      }

      timestampElement.appendChild(roleLabel);
    }

    messageContentContainer.appendChild(messageBubble);
    messageContentContainer.appendChild(timestampElement);

    messageContainer.appendChild(iconContainer);
    messageContainer.appendChild(messageContentContainer);
    messagesContainer.appendChild(messageContainer);

    // Add agent action buttons if needed
    if (showAgentButtons && role === 'assistant') {

      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      `;

      // Connect with Agent button
      const connectAgentBtn = document.createElement('button');
      connectAgentBtn.textContent = 'Connect with Agent';
      connectAgentBtn.style.cssText = `
        padding: 8px 12px;
        background-color: ${widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background-color 0.2s ease;
        flex: 1;
        min-width: 140px;
      `;
      connectAgentBtn.onmouseenter = () => connectAgentBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#7c3aed' : '#7c3aed';
      connectAgentBtn.onmouseleave = () => connectAgentBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR;
      connectAgentBtn.onclick = () => {
        const userMessage = 'I would like to speak with a human agent to get help with my question.';
        widgetState.inputMessage = userMessage;
        // Trigger form submission
        const form = document.querySelector('#qurieus-chat-widget form');
        if (form) {
          form.requestSubmit();
        }
      };

      // Try Different Question button
      const tryDifferentBtn = document.createElement('button');
      tryDifferentBtn.textContent = 'Try Different Question';
      tryDifferentBtn.style.cssText = `
        padding: 8px 12px;
        background-color: ${widgetConfig.theme === 'dark' ? '#6b7280' : '#6b7280'};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background-color 0.2s ease;
        flex: 1;
        min-width: 140px;
      `;
      tryDifferentBtn.onmouseenter = () => tryDifferentBtn.style.backgroundColor = '#4b5563';
      tryDifferentBtn.onmouseleave = () => tryDifferentBtn.style.backgroundColor = '#6b7280';
      tryDifferentBtn.onclick = () => {
        // Focus on the textarea for the user to type a new question
        const inputField = document.querySelector('#qurieus-chat-widget textarea');
        if (inputField) {
          inputField.focus();
        }
      };

      buttonsContainer.appendChild(connectAgentBtn);
      buttonsContainer.appendChild(tryDifferentBtn);
      messageContentContainer.appendChild(buttonsContainer);
    }

    // Show queue info if agents are busy
    if (showQueueInfo && role === 'assistant') {
      const queueContainer = document.createElement('div');
      queueContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        background: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
        padding: 10px 14px;
        border-radius: 8px;
        color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
        font-size: 13px;
        border-left: 3px solid #f59e0b;
      `;

      const queueMessage = document.createElement('div');
      queueMessage.textContent = `All agents are currently busy. You are in the queue (position ${queuePosition}). Please wait for the next available agent.`;
      queueContainer.appendChild(queueMessage);

      messageContentContainer.appendChild(queueContainer);
    }

    // Show transcription download offer for system messages
    if (isSystemMessage && content.includes('download a transcript')) {
      const downloadContainer = document.createElement('div');
      downloadContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      `;

      // Download Transcript button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = '📄 Download Transcript';
      downloadBtn.style.cssText = `
        padding: 8px 12px;
        background-color: ${widgetConfig.theme === 'dark' ? '#10b981' : '#10b981'};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background-color 0.2s ease;
        flex: 1;
        min-width: 160px;
      `;
      downloadBtn.onmouseenter = () => downloadBtn.style.backgroundColor = '#059669';
      downloadBtn.onmouseleave = () => downloadBtn.style.backgroundColor = '#10b981';
      downloadBtn.onclick = () => {
        // Download transcript using the API endpoint
        if (currentChatId) {
          const downloadUrl = `${widgetConfig.baseUrl}/api/chat/${currentChatId}/transcript`;
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `chat-transcript-${currentChatId}-${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // Fallback to local transcript if no chat ID
          const transcript = widgetState.messages.map(msg =>
            `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
          ).join('\n\n');

          // Create and download file
          const blob = new Blob([transcript], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      };

      // No Thanks button
      const noThanksBtn = document.createElement('button');
      noThanksBtn.textContent = 'No Thanks';
      noThanksBtn.style.cssText = `
        padding: 8px 12px;
        background-color: ${widgetConfig.theme === 'dark' ? '#6b7280' : '#6b7280'};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background-color 0.2s ease;
        flex: 1;
        min-width: 100px;
      `;
      noThanksBtn.onmouseenter = () => noThanksBtn.style.backgroundColor = '#4b5563';
      noThanksBtn.onmouseleave = () => noThanksBtn.style.backgroundColor = '#6b7280';
      noThanksBtn.onclick = () => {
        // Remove the download offer
        downloadContainer.remove();
      };

      downloadContainer.appendChild(downloadBtn);
      downloadContainer.appendChild(noThanksBtn);
      messageContentContainer.appendChild(downloadContainer);
    }

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Check if visitor info has been submitted for this visitor
  function checkVisitorInfoSubmitted() {
    const visitorId = localStorage.getItem('qurieus_visitor_id');
    if (!visitorId) return false;

    const submittedVisitors = JSON.parse(localStorage.getItem('qurieus_submitted_visitors') || '[]');
    return submittedVisitors.includes(visitorId);
  }

  // Mark visitor info as submitted
  function markVisitorInfoSubmitted(visitorId) {
    const submittedVisitors = JSON.parse(localStorage.getItem('qurieus_submitted_visitors') || '[]');
    if (!submittedVisitors.includes(visitorId)) {
      submittedVisitors.push(visitorId);
      localStorage.setItem('qurieus_submitted_visitors', JSON.stringify(submittedVisitors));
    }
  }

  // Load Socket.IO library if not already loaded (optional)
  let socketIOLoaded = false;
  if (typeof io === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    script.onload = () => {
      socketIOLoaded = true;
    };
    script.onerror = () => {
      // Failed to load Socket.IO library - real-time features disabled
    };
    document.head.appendChild(script);
  } else {
    socketIOLoaded = true;
  }

  let widgetConfig = {};
  let widgetContainer = null;

  // Helper function to format text with proper HTML formatting
  function formatMessageText(text) {
    // Escape HTML to prevent XSS
    let formattedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Make URLs clickable - match both http/https and www patterns
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
      (url) => {
        // Ensure URL has protocol
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        return '<a href="' + fullUrl + '" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; word-break: break-all;">' + url + '</a>';
      }
    );

    // Split text into lines for better list processing
    const lines = formattedText.split('\n');
    const processedLines = [];
    let inNumberedList = false;
    let inBulletList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for numbered list items
      if (/^\d+\.\s+/.test(line)) {
        if (!inNumberedList) {
          processedLines.push('<ol>');
          inNumberedList = true;
        }
        processedLines.push('<li>' + line.replace(/^\d+\.\s+/, '') + '</li>');
      }
      // Check for bullet list items
      else if (/^[-*•]\s+/.test(line)) {
        if (!inBulletList) {
          processedLines.push('<ul>');
          inBulletList = true;
        }
        processedLines.push('<li>' + line.replace(/^[-*•]\s+/, '') + '</li>');
      }
      // Regular line
      else {
        // Close any open lists
        if (inNumberedList) {
          processedLines.push('</ol>');
          inNumberedList = false;
        }
        if (inBulletList) {
          processedLines.push('</ul>');
          inBulletList = false;
        }
        processedLines.push(line);
      }
    }

    // Close any remaining open lists
    if (inNumberedList) {
      processedLines.push('</ol>');
    }
    if (inBulletList) {
      processedLines.push('</ul>');
    }

    // Join lines back together
    formattedText = processedLines.join('\n');

    // Format bold text (**text** or __text__)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Format italic text (*text* or _text_)
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');

    // Format code blocks (```code```)
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Format inline code (`code`)
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Format line breaks
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  }

  // State management function
  function setWidgetState(newState) {
    widgetState = { ...widgetState, ...newState };
    renderWidget();
  }

  // Render visitor info form
  function renderVisitorInfoForm(chatWindow) {
    chatWindow.innerHTML = '';

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
    title.textContent = 'Welcome!';
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

    // Form container
    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    `;

    const formTitle = document.createElement('h4');
    formTitle.textContent = "Let's get started";
    formTitle.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
      text-align: left;
    `;

    const formSubtitle = document.createElement('p');
    formSubtitle.textContent = 'Please provide your information to begin chatting';
    formSubtitle.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 12px;
      color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      text-align: left;
    `;

    // Form
    const form = document.createElement('form');
    form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    // Name field
    const nameField = createFormField('name', 'Name', 'text', 'Enter your full name', true);

    // Email field
    const emailField = createFormField('email', 'Email', 'email', 'Enter your email address', true);

    // Phone field
    const phoneField = createFormField('phonenumber', 'Phone Number', 'tel', 'Enter your phone number (optional)', false);

    // Company field
    const companyField = createFormField('company', 'Company', 'text', 'Enter your company name (optional)', false);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Start Chat';
    submitBtn.style.cssText = `
      padding: 12px;
      background-color: ${widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease;
      margin-top: 8px;
      align-self: flex-start;
    `;
    submitBtn.onmouseenter = () => submitBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#7c3aed' : '#7c3aed';
    submitBtn.onmouseleave = () => submitBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR;

    // Form submission handler
    form.onsubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const phone = formData.get('phonenumber') || '';
      const company = formData.get('company') || '';

      // Basic validation
      if (!name.trim() || !email.trim()) {
        alert('Name and email are required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        alert('Please enter a valid email address');
        return;
      }

      try {
        // Get or generate visitor ID from localStorage
        let visitorId = localStorage.getItem('qurieus_visitor_id');
        if (!visitorId) {
          visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('qurieus_visitor_id', visitorId);
        }

        // Save visitor information to backend with API key
        const response = await fetch(getBaseUrl() + '/api/visitors/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': widgetConfig.apiKey
          },
          body: JSON.stringify({
            visitorId: visitorId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            company: company.trim() || undefined,
            source: 'chat_widget'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save visitor information');
        }

        // Mark visitor as submitted and store visitor info
        markVisitorInfoSubmitted(visitorId);
        setWidgetState({
          visitorInfoSubmitted: true,
          visitorInfo: {
            visitorId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            company: company.trim() || undefined
          }
        });

      } catch (error) {
        alert('Failed to save information. Please try again.');
      }
    };

    form.appendChild(nameField);
    form.appendChild(emailField);
    form.appendChild(phoneField);
    form.appendChild(companyField);
    form.appendChild(submitBtn);

    formContainer.appendChild(formTitle);
    formContainer.appendChild(formSubtitle);
    formContainer.appendChild(form);

    chatWindow.appendChild(header);
    chatWindow.appendChild(formContainer);
  }

  // Helper function to create form fields
  function createFormField(name, label, type, placeholder, required) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder + (required ? ' *' : '');
    input.required = required;
    input.style.cssText = `
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

    return input;
  }

  // Render the widget
  function renderWidget() {
    if (!widgetContainer) return;

    // Initialize Socket.IO connection (will be null if not loaded yet)
    const socketInstance = initSocket();

    // Join chat room if we have a visitor ID and conversation and socket is available
    const visitorId = localStorage.getItem('qurieus_visitor_id');
    if (visitorId && !currentChatId) {
      // Try to get conversation ID from localStorage or use visitor ID
      const conversationId = localStorage.getItem('qurieus_conversation_id') || visitorId;

      if (socketInstance) {
        joinChatRoom(conversationId, visitorId);
      } else {
        // Retry joining when socket becomes available
        const retryJoin = () => {
          if (socket && !currentChatId) {
            joinChatRoom(conversationId, visitorId);
          } else if (!socket) {
            setTimeout(retryJoin, 1000);
          }
        };
        setTimeout(retryJoin, 1000);
      }
    }

    widgetContainer.innerHTML = '';
    if (!widgetState.isOpen) {
      // Render chat button
      const button = document.createElement('button');
      button.innerHTML = '<img src="' + widgetConfig.baseUrl + '/images/logo/logo.svg" alt="Qurieus" width="30" height="30" style="margin:auto" />';
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
      transition: width 0.3s ease, height 0.3s ease;
    `;

    // Add CSS animation
    const slideInStyle = document.createElement('style');
    slideInStyle.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(slideInStyle);

    // Show visitor info form if not submitted yet for this visitor
    if (!widgetState.visitorInfoSubmitted && !checkVisitorInfoSubmitted()) {
      renderVisitorInfoForm(chatWindow);
      widgetContainer.appendChild(chatWindow);
      return;
    }

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
      position: relative;
    `;

    // Title container with logo and text
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    // Logo icon
    const logoIcon = document.createElement('img');
    logoIcon.src = widgetConfig.baseUrl + '/images/logo/logo.svg';
    logoIcon.alt = 'Qurieus';
    logoIcon.style.cssText = `
      width: 20px;
      height: 20px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Chat Support';
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
    `;

    titleContainer.appendChild(logoIcon);
    titleContainer.appendChild(title);

    // Button container for expand, menu, and close buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    // Menu button
    const menuBtn = document.createElement('button');
    menuBtn.innerHTML = '⋮';
    menuBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      font-weight: bold;
    `;
    menuBtn.onmouseenter = () => menuBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#4b5563' : '#e5e7eb';
    menuBtn.onmouseleave = () => menuBtn.style.backgroundColor = 'transparent';

    // Menu dropdown
    const menuDropdown = document.createElement('div');
    menuDropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background-color: ${widgetConfig.theme === 'dark' ? '#374151' : 'white'};
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 160px;
      display: none;
      flex-direction: column;
      overflow: hidden;
      margin-top: 4px;
    `;

    // Menu items
    const menuItems = [
      {
        text: 'Connect to Agent',
        icon: '👨‍💼',
        action: () => {
          // Add logic to connect to agent
          const userMessage = 'I would like to connect to a human agent.';
          widgetState.inputMessage = userMessage;
          // Trigger form submission
          const form = document.querySelector('#qurieus-chat-widget form');
          if (form) {
            form.requestSubmit();
          }
        }
      },
      {
        text: 'Start New Chat',
        icon: '🆕',
        action: () => {
          // Clear messages and start fresh
          setWidgetState({
            messages: [{
              role: 'assistant',
              content: 'Hello! How can I help you today?',
              timestamp: new Date().toISOString()
            }]
          });
          // Clear conversation ID
          localStorage.removeItem('qurieus_conversation_id');
          // Leave current chat room
          if (socket && currentChatId) {
            socket.emit('leave', { chatId: currentChatId });
            currentChatId = null;
          }
        }
      },
      {
        text: 'Clear History',
        icon: '🗑️',
        action: () => {
          // Clear messages but keep initial message
          setWidgetState({
            messages: [{
              role: 'assistant',
              content: 'Chat history cleared. How can I help you?',
              timestamp: new Date().toISOString()
            }]
          });
        }
      },
      {
        text: 'Download Chat',
        icon: '📥',
        action: () => {
          // Download transcript using the API endpoint
          if (currentChatId) {
            const downloadUrl = `${widgetConfig.baseUrl}/api/chat/${currentChatId}/transcript`;
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `chat-transcript-${currentChatId}-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            // Fallback to local transcript if no chat ID
            const transcript = widgetState.messages.map(msg =>
              `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
            ).join('\n\n');

            // Create and download file
            const blob = new Blob([transcript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      }
    ];

    // Create menu items
    menuItems.forEach((item, index) => {
      const menuItem = document.createElement('button');
      menuItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
        transition: background-color 0.2s ease;
        text-align: left;
        width: 100%;
        ${index === menuItems.length - 1 ? '' : 'border-bottom: 1px solid #e5e7eb;'}
      `;

      menuItem.innerHTML = `${item.icon} ${item.text}`;

      menuItem.onmouseenter = () => {
        menuItem.style.backgroundColor = widgetConfig.theme === 'dark' ? '#4b5563' : '#f3f4f6';
      };
      menuItem.onmouseleave = () => {
        menuItem.style.backgroundColor = 'transparent';
      };
      menuItem.onclick = () => {
        item.action();
        menuDropdown.style.display = 'none';
      };

      menuDropdown.appendChild(menuItem);
    });

    // Menu button click handler
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      const isVisible = menuDropdown.style.display === 'flex';
      menuDropdown.style.display = isVisible ? 'none' : 'flex';
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.style.display = 'none';
      }
    });

    // Expand button
    const expandBtn = document.createElement('button');
    expandBtn.innerHTML = '⤢';
    expandBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: bold;
    `;
    expandBtn.onmouseenter = () => expandBtn.style.backgroundColor = widgetConfig.theme === 'dark' ? '#4b5563' : '#e5e7eb';
    expandBtn.onmouseleave = () => expandBtn.style.backgroundColor = 'transparent';
    expandBtn.onclick = () => {
      // Toggle between normal and expanded size with smooth animation
      const chatWindow = document.querySelector('#qurieus-chat-widget > div');
      if (chatWindow) {
        const isExpanded = chatWindow.style.width === '500px';

        // Add transition class for smooth animation
        chatWindow.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        if (isExpanded) {
          // Contract to normal size
          chatWindow.style.width = '350px';
          chatWindow.style.height = '500px';
          expandBtn.innerHTML = '⤢';
          expandBtn.style.transform = 'rotate(0deg)';
        } else {
          // Expand to larger size
          chatWindow.style.width = '500px';
          chatWindow.style.height = '600px';
          expandBtn.innerHTML = '⤡';
          expandBtn.style.transform = 'rotate(180deg)';
        }

        // Remove transition after animation completes
        setTimeout(() => {
          chatWindow.style.transition = 'width 0.3s ease, height 0.3s ease';
        }, 400);
      }
    };

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

    buttonContainer.appendChild(expandBtn);
    buttonContainer.appendChild(menuBtn);
    buttonContainer.appendChild(closeBtn);

    // Add menu dropdown to header
    header.appendChild(menuDropdown);

    header.appendChild(titleContainer);
    header.appendChild(buttonContainer);

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'qurieus-chat-messages';
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
      const messageContainer = document.createElement('div');
      messageContainer.style.cssText = `
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-bottom: 12px;
        ${msg.role === 'user' ? 'flex-direction: row-reverse;' : 'flex-direction: row;'}
      `;

      // Icon container
      const iconContainer = document.createElement('div');
      iconContainer.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background-color: ${msg.role === 'user'
          ? (widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR)
          : msg.role === 'agent'
            ? (widgetConfig.theme === 'dark' ? '#10b981' : '#f3f4f6') // Green for agent
            : (widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6')};
      `;

      // Icon
      const icon = document.createElement('img');
      if (msg.role === 'user') {
        // User icon (SVG data URL for a simple user icon)
        icon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDcuNjU2ODUgMTMgNkMxMyA0LjM0MzE1IDExLjY1NjkgMyAxMCAzQzguMzQzMTUgMyA3IDQuMzQzMTUgNyA2QzcgNy42NTY4NSA4LjM0MzE1IDkgMTAgOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zIDE3QzMgMTMuNjg2MyA2LjEzNDAxIDExIDEwIDExQzEzLjg2NiAxMSAxNyAxMy42ODYzIDE3IDE3VjE5QzE3IDE5LjU1MjMgMTYuNTUyMyAyMCAxNiAyMEg0QzMuNDQ3NzIgMjAgMyAxOS41NTIzIDMgMTlWMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
      } else if (msg.role === 'agent') {
        // Agent icon (human icon)
        icon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDcuNjU2ODUgMTMgNkMxMyA0LjM0MzE1IDExLjY1NjkgMyAxMCAzQzguMzQzMTUgMyA3IDQuMzQzMTUgNyA2QzcgNy42NTY4NSA4LjM0MzE1IDkgMTAgOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zIDE3QzMgMTMuNjg2MyA2LjEzNDAxIDExIDEwIDExQzEzLjg2NiAxMSAxNyAxMy42ODYzIDE3IDE3VjE5QzE3IDE5LjU1MjMgMTYuNTUyMyAyMCAxNiAyMEg0QzMuNDQ3NzIgMjAgMyAxOS41NTIzIDMgMTlWMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
      } else {
        // Assistant icon (logo.svg)
        icon.src = widgetConfig.baseUrl + '/images/logo/logo.svg';
      }
      icon.style.cssText = `
        width: 20px;
        height: 20px;
      `;

      iconContainer.appendChild(icon);

      // Message content container
      const messageContentContainer = document.createElement('div');
      messageContentContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: calc(100% - 40px);
      `;

      const messageBubble = document.createElement('div');
      // Use formatMessageText for all message types to enable URL formatting
      messageBubble.innerHTML = formatMessageText(msg.content);
      messageBubble.style.cssText = `
        padding: 8px 12px;
        border-radius: 12px;
        background-color: ${msg.role === 'user'
          ? (widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR)
          : msg.role === 'agent'
            ? '#10b981' // Green for agent
            : (widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6')};
        color: ${msg.role === 'user' || msg.role === 'agent' ? 'white' : (widgetConfig.theme === 'dark' ? 'white' : '#111827')};
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        text-align: left;
        max-width: 100%;
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

      // Add custom styles for formatted content in chat history
      if (msg.role === 'assistant') {
        const historyStyle = document.createElement('style');
        historyStyle.textContent = `
          .assistant-message ol, .assistant-message ul {
            margin: 8px 0;
            padding-left: 20px;
          }
          .assistant-message li {
            margin: 4px 0;
          }
          .assistant-message strong {
            font-weight: 600;
          }
          .assistant-message em {
            font-style: italic;
          }
          .assistant-message code {
            background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#f1f5f9'};
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
          }
          .assistant-message pre {
            background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#f1f5f9'};
            padding: 8px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 8px 0;
          }
          .assistant-message pre code {
            background: none;
            padding: 0;
            font-size: 12px;
          }
        `;
        messageContentContainer.appendChild(historyStyle);
      }

      messageContentContainer.appendChild(messageBubble);
      messageContentContainer.appendChild(timestamp);

      messageContainer.appendChild(iconContainer);
      messageContainer.appendChild(messageContentContainer);
      messagesContainer.appendChild(messageContainer);
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
        background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#ffffff'};
        border: 1px solid ${widgetConfig.theme === 'dark' ? '#374151' : '#e5e7eb'};
        border-radius: 16px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px ${widgetConfig.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
        position: relative;
      `;

      // Add character icon (minimalistic loader)
      const characterIcon = document.createElement('div');
      characterIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><style>.loader{animation:rotate 1.5s linear infinite;transform-origin:center}.loader-circle{stroke-dasharray:60;stroke-dashoffset:60;animation:dash 1.5s ease-in-out infinite}@keyframes rotate{100%{transform:rotate(360deg)}}@keyframes dash{0%{stroke-dashoffset:60}50%{stroke-dashoffset:15}100%{stroke-dashoffset:60}}</style><circle class="loader" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/><circle class="loader-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
      characterIcon.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      `;

      // Add typing text
      const typingText = document.createElement('span');
      typingText.textContent = 'Thinking';
      typingText.style.cssText = `
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        font-size: 13px;
        font-weight: 500;
      `;

      // No dots for minimalistic design

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
        border-top: 6px solid ${widgetConfig.theme === 'dark' ? '#1f2937' : '#ffffff'};
      `;

      characterBubble.appendChild(characterIcon);
      characterBubble.appendChild(typingText);
      characterBubble.appendChild(tail);
      peekingContainer.appendChild(characterBubble);

      // Add to chat window instead of messages container
      chatWindow.appendChild(peekingContainer);
    }

    // Add minimalistic animation CSS
    const typingStyle = document.createElement('style');
    typingStyle.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes peekIn {
        from { opacity: 0; transform: translateY(20px) scale(0.8); }
        to { opacity: 1; transform: translateY(0) scale(1); }
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

    const input = document.createElement('textarea');
    input.value = widgetState.inputMessage;
    input.placeholder = 'Type your message...';
    input.disabled = widgetState.isLoading;
    input.rows = 1;
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
      resize: none;
      overflow-y: hidden;
      min-height: 36px;
      max-height: 120px;
      font-family: inherit;
      line-height: 1.4;
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
      input.style.height = '36px'; // Reset to minimum height
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';

      // Add user message to UI directly
      const messageContainer = document.createElement('div');
      messageContainer.style.cssText = `
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-bottom: 12px;
        flex-direction: row-reverse;
      `;

      // Icon container for user
      const iconContainer = document.createElement('div');
      iconContainer.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background-color: ${widgetConfig.theme === 'dark' ? DARK_BRAND_COLOR : BRAND_COLOR};
      `;

      // User icon
      const userIcon = document.createElement('img');
      userIcon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDcuNjU2ODUgMTMgNkMxMyA0LjM0MzE1IDExLjY1NjkgMyAxMCAzQzguMzQzMTUgMyA3IDQuMzQzMTUgNyA2QzcgNy42NTY4NSA4LjM0MzE1IDkgMTAgOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zIDE3QzMgMTMuNjg2MyA2LjEzNDAxIDExIDEwIDExQzEzLjg2NiAxMSAxNyAxMy42ODYzIDE3IDE3VjE5QzE3IDE5LjU1MjMgMTYuNTUyMyAyMCAxNiAyMEg0QzMuNDQ3NzIgMjAgMyAxOS41NTIzIDMgMTlWMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
      userIcon.style.cssText = `
        width: 20px;
        height: 20px;
      `;

      iconContainer.appendChild(userIcon);

      // Message content container
      const messageContentContainer = document.createElement('div');
      messageContentContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: calc(100% - 40px);
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
        max-width: 100%;
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

      messageContentContainer.appendChild(messageBubble);
      messageContentContainer.appendChild(userTimestamp);

      messageContainer.appendChild(iconContainer);
      messageContainer.appendChild(messageContentContainer);
      messagesContainer.appendChild(messageContainer);

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
        background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#ffffff'};
        border: 1px solid ${widgetConfig.theme === 'dark' ? '#374151' : '#e5e7eb'};
        border-radius: 16px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px ${widgetConfig.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
        position: relative;
      `;

      const characterIcon = document.createElement('div');
      characterIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><style>.loader{animation:rotate 1.5s linear infinite;transform-origin:center}.loader-circle{stroke-dasharray:60;stroke-dashoffset:60;animation:dash 1.5s ease-in-out infinite}@keyframes rotate{100%{transform:rotate(360deg)}}@keyframes dash{0%{stroke-dashoffset:60}50%{stroke-dashoffset:15}100%{stroke-dashoffset:60}}</style><circle class="loader" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/><circle class="loader-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
      characterIcon.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      `;

      const typingText = document.createElement('span');
      typingText.textContent = 'Thinking';
      typingText.style.cssText = `
        color: ${widgetConfig.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        font-size: 13px;
        font-weight: 500;
      `;

      // No dots for minimalistic design

      const tail = document.createElement('div');
      tail.style.cssText = `
        position: absolute;
        bottom: -6px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${widgetConfig.theme === 'dark' ? '#1f2937' : '#ffffff'};
      `;

      characterBubble.appendChild(characterIcon);
      characterBubble.appendChild(typingText);
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

        const requestBody = {
          message: userMessage,
          apiKey: widgetConfig.apiKey,
          visitorId: localStorage.getItem('qurieus_visitor_id')
        };

        const response = await fetch(widgetConfig.baseUrl + '/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': widgetConfig.apiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
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
        let chunkCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('🔍 [EMBED] Reader done, breaking loop');
            break;
          }

          chunkCount++;
          const chunk = decoder.decode(value);
          fullResponse += chunk;

          // Process each line for Server-Sent Events format
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove 'data: ' prefix
                const data = JSON.parse(jsonStr);

                // Handle response content
                if (data.response !== undefined && data.response !== "") {
                  assistantMessage += data.response;
                }

                if (data.sources) {
                  // Handle sources if needed
                }

                if (data.done) {
                  // Remove peeking character indicator
                  const peekingIndicator = chatWindow.querySelector('[style*="position: absolute"][style*="bottom: 80px"]');
                  if (peekingIndicator) {
                    peekingIndicator.remove();
                  }

                  // Display the complete message - only if we have content
                  if (assistantMessage && assistantMessage.trim()) {
                    // Loosened trigger for agent button
                    const lowerMsg = assistantMessage.toLowerCase();
                    const agentKeywords = [
                      'agent',
                      'support team',
                      'representative',
                      'escalated',
                      'human help',
                      'real person',
                      'customer service',
                      'queue'
                    ];
                    const needsAgentButtons =
                      agentKeywords.some(k => lowerMsg.includes(k)) ||
                      data.showAgentButtons === true;

                    // Determine message type for visual distinction
                    let messageRole = 'assistant';
                    let showAgentButtons = false;
                    let showQueueInfo = false;
                    let queuePosition = null;

                    // Only show connect button if agents are available
                    if (needsAgentButtons && data.agentsAvailable === true) {
                      showAgentButtons = true;
                    } else if (needsAgentButtons && data.queuePosition !== undefined && data.queuePosition !== null) {
                      showQueueInfo = true;
                      queuePosition = data.queuePosition;
                    }

                    if (data.routedToAgent === true) {
                      // This is a system message indicating message was routed to agent
                      messageRole = 'system';
                      showAgentButtons = false;
                      showQueueInfo = false;
                    }

                    addMessageToUI(messageRole, assistantMessage, new Date().toISOString(), showAgentButtons, showQueueInfo, queuePosition);

                    // Final update to state
                    widgetState.messages = [...widgetState.messages, {
                      role: messageRole,
                      content: assistantMessage,
                      timestamp: new Date().toISOString()
                    }];
                  }

                  // Join chat room for real-time updates if we have a visitor ID
                  const visitorId = localStorage.getItem('qurieus_visitor_id');
                  if (visitorId) {
                    // Try to get conversation ID from the response headers or use visitor ID
                    const conversationId = response.headers.get('x-conversation-id') || visitorId;
                    localStorage.setItem('qurieus_conversation_id', conversationId);

                    // Update global variables for disconnect handling
                    currentChatId = conversationId;

                    // Add disconnect listeners if not already added
                    addDisconnectListeners();

                    // Join chat room if not already joined
                    if (!socket || !socket.connected) {
                      initSocket();
                    }
                    joinChatRoom(conversationId, visitorId);
                  }
                  break;
                }
              } catch (e) {
                // Failed to parse SSE line
              }
            }
          }
        }


      } catch (error) {
        // Chat error occurred

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

        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 12px;
          flex-direction: row;
        `;

        // Icon container for assistant
        const errorIconContainer = document.createElement('div');
        errorIconContainer.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
        `;

        // Assistant icon (logo.svg)
        const errorIcon = document.createElement('img');
        errorIcon.src = widgetConfig.baseUrl + '/images/logo/logo.svg';
        errorIcon.style.cssText = `
          width: 20px;
          height: 20px;
        `;

        errorIconContainer.appendChild(errorIcon);

        // Message content container
        const errorContentContainer = document.createElement('div');
        errorContentContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: calc(100% - 40px);
        `;

        const errorBubble = document.createElement('div');
        errorBubble.innerHTML = formatMessageText('Sorry, I encountered an error. Please try again.');
        errorBubble.style.cssText = `
          padding: 8px 12px;
          border-radius: 12px;
          background-color: ${widgetConfig.theme === 'dark' ? '#374151' : '#f3f4f6'};
          color: ${widgetConfig.theme === 'dark' ? 'white' : '#111827'};
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          text-align: left;
          max-width: 100%;
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

        // Add custom styles for formatted content in error message
        const errorStyle = document.createElement('style');
        errorStyle.textContent = `
          .assistant-message ol, .assistant-message ul {
            margin: 8px 0;
            padding-left: 20px;
          }
          .assistant-message li {
            margin: 4px 0;
          }
          .assistant-message strong {
            font-weight: 600;
          }
          .assistant-message em {
            font-style: italic;
          }
          .assistant-message code {
            background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#f1f5f9'};
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
          }
          .assistant-message pre {
            background-color: ${widgetConfig.theme === 'dark' ? '#1f2937' : '#f1f5f9'};
            padding: 8px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 8px 0;
          }
          .assistant-message pre code {
            background: none;
            padding: 0;
            font-size: 12px;
          }
        `;

        errorContentContainer.appendChild(errorStyle);
        errorContentContainer.appendChild(errorBubble);
        errorContentContainer.appendChild(errorTimestamp);

        errorContainer.appendChild(errorIconContainer);
        errorContainer.appendChild(errorContentContainer);
        messagesContainer.appendChild(errorContainer);

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

    // Auto-resize textarea function
    const autoResize = () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    };

    // Handle input changes
    input.oninput = (e) => {
      // Update state without triggering re-render
      widgetState.inputMessage = e.target.value;
      widgetState.isLoading = false;
      // Auto-resize textarea
      autoResize();
      // Update send button state directly
      sendBtn.disabled = widgetState.isLoading || !e.target.value.trim();
      sendBtn.style.opacity = widgetState.isLoading || !e.target.value.trim() ? '0.5' : '1';
    };

    // Keyboard shortcuts: Cmd+Enter/Ctrl+Enter to send, Up Arrow to recall last message
    input.addEventListener('keydown', function (e) {
      // Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux) to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
      // Up Arrow to recall last user message if input is empty
      if (e.key === 'ArrowUp' && !input.value) {
        // Find the last user message
        const lastUserMsg = (widgetState.messages || []).slice().reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
          input.value = lastUserMsg.content;
          widgetState.inputMessage = lastUserMsg.content;
          // Move cursor to end
          setTimeout(() => {
            input.selectionStart = input.selectionEnd = input.value.length;
          }, 0);
        }
      }
    });

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

    // Initialize conversation tracking from localStorage
    currentChatId = localStorage.getItem('qurieus_conversation_id');
    visitorId = localStorage.getItem('qurieus_visitor_id');

    // Add disconnect listeners if we have a conversation
    if (currentChatId && visitorId) {
      addDisconnectListeners();
    }

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



  if (config.apiKey) {
    // Initialize immediately
    window.QurieusChat.init(config);
  } else {
    // No API key found in data attributes
  }
})(); 