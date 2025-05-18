(function() {
  // Get the current frontend URL
  const frontendUrl = window.location.origin;

  // Get configuration from window.QurieusChatConfig
  const config = {
    documentOwnerId: window.QurieusChatConfig?.documentOwnerId || '',
    theme: window.QurieusChatConfig?.theme || 'light',
    position: window.QurieusChatConfig?.position || 'bottom-right',
    apiUrl: frontendUrl + '/api/documents/query'
  };

  // Create and inject the chat container
  const container = document.createElement('div');
  container.id = 'qurieus-chat-container';
  container.className = `qurieus-chat-container ${config.position}`;
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
    window.QurieusChat.init(config);
  };
  document.head.appendChild(script);
})(); 