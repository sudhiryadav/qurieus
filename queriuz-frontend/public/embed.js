(function() {
  // Get the current frontend URL
  const frontendUrl = window.location.origin;

  // Get configuration from window.QueriuzChatConfig
  const config = {
    documentOwnerId: window.QueriuzChatConfig?.documentOwnerId || '',
    theme: window.QueriuzChatConfig?.theme || 'light',
    position: window.QueriuzChatConfig?.position || 'bottom-right',
    apiUrl: frontendUrl + '/api/documents/query'
  };

  // Create and inject the chat container
  const container = document.createElement('div');
  container.id = 'queriuz-chat-container';
  container.className = `queriuz-chat-container ${config.position}`;
  document.body.appendChild(container);

  // Load the chat CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = frontendUrl + '/chat.css';
  document.head.appendChild(link);

  // Load the chat component
  const script = document.createElement('script');
  script.src = frontendUrl + '/chat.js';
  script.async = true;
  script.onload = function() {
    window.QueriuzChat.init(config);
  };
  document.head.appendChild(script);
})(); 