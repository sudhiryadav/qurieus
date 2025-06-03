(function() {
  // Create a container for the widget
  const container = document.createElement('div');
  container.id = 'qurieus-chat-widget';
  document.body.appendChild(container);

  // Load required dependencies
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadStyles = (href) => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  };

  // Initialize the widget
  const initWidget = async (config) => {
    try {
      // Load React and ReactDOM
      await loadScript('https://unpkg.com/react@18/umd/react.production.min.js');
      await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
      
      // Load the component directly from your Next.js app
      const response = await fetch('https://your-domain.com/api/chat-widget');
      const componentCode = await response.text();
      
      // Create a script element with the component code
      const script = document.createElement('script');
      script.textContent = componentCode;
      document.head.appendChild(script);

      // Initialize the widget with config
      window.QurieusChat.init(config);
    } catch (error) {
      console.error('Failed to load chat widget:', error);
    }
  };

  // Create global initialization function
  window.QurieusChat = {
    init: (config) => {
      if (!config.apiKey) {
        console.error('API key is required');
        return;
      }

      const root = ReactDOM.createRoot(container);
      root.render(
        React.createElement(ChatWidget, {
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          initialMessage: config.initialMessage,
          position: config.position,
          theme: config.theme
        })
      );
    }
  };

  // Auto-initialize if config is provided via data attributes
  const config = {
    apiKey: document.currentScript.getAttribute('data-api-key'),
    baseUrl: document.currentScript.getAttribute('data-base-url'),
    initialMessage: document.currentScript.getAttribute('data-initial-message'),
    position: document.currentScript.getAttribute('data-position'),
    theme: document.currentScript.getAttribute('data-theme')
  };

  if (config.apiKey) {
    initWidget(config);
  }
})(); 