import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatWidgetProps {
  apiKey: string;
  initialMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  inline?: boolean;
  showSources?: boolean;
}

const getVisitorId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('qurieus_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('qurieus_visitor_id', id);
  }
  return id;
};

const fetchChatHistory = async (visitorId: string, userId: string, limit = 10) => {
  try {
    const res = await fetch(`/api/chat/history?visitorId=${visitorId}&userId=${userId}&limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  initialMessage = 'Hello! How can I help you today?',
  position = 'bottom-right',
  theme = 'light',
  inline = false,
  showSources = false
}) => {
  const [isOpen, setIsOpen] = useState(inline ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: initialMessage }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sources, setSources] = useState<any[] | null>(null);
  const [showSourcesUI, setShowSourcesUI] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setSources(null);
    setShowSourcesUI(false);

    try {
      const visitorId = getVisitorId();
      let assistantIndex = -1;
      setMessages(prev => {
        assistantIndex = prev.length;
        return [...prev, { role: 'assistant', content: '' }];
      });

      const response = await fetch('/api/documents/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId
        },
        body: JSON.stringify({
          query: userMessage,
          documentOwnerId: apiKey,
          visitorId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            console.log('NDJSON line:', line);
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              console.log('NDJSON data:', data);
              if (data.chunk) {
                fullResponse += data.chunk;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantIndex] = { role: 'assistant', content: fullResponse };
                  return updated;
                });
              }
              if (data.final && data.sources) {
                setSources(data.sources);
              }
            } catch (e) {
              console.error('NDJSON parse error:', e, line);
              // Ignore parse errors for incomplete lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const themeClasses = {
    light: {
      container: 'bg-white text-gray-800',
      button: 'bg-primary text-white hover:bg-primary/90',
      input: 'bg-gray-100 text-gray-800 border-gray-200',
      message: {
        user: 'bg-primary text-white',
        assistant: 'bg-gray-100 text-gray-800'
      }
    },
    dark: {
      container: 'bg-gray-800 text-white',
      button: 'bg-primary text-white hover:bg-primary/90',
      input: 'bg-gray-700 text-white border-gray-600',
      message: {
        user: 'bg-primary text-white',
        assistant: 'bg-gray-700 text-white'
      }
    }
  };

  return (
    <div
      className={
        inline
          ? 'w-full h-full flex flex-col'
          : `fixed ${positionClasses[position]} z-50`
      }
    >
      {inline ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-transparent">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? `${themeClasses[theme].message.user} ml-auto`
                    : `${themeClasses[theme].message.assistant}`
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
            {showSources && sources && (
              <div className="mt-4">
                <button
                  className="text-xs text-primary underline mb-2"
                  onClick={() => setShowSourcesUI((v) => !v)}
                >
                  {showSourcesUI ? 'Hide Sources' : 'Show Sources'}
                </button>
                {showSourcesUI && (
                  <div className="rounded bg-gray-100 dark:bg-gray-800 p-2 text-xs">
                    <p className="font-semibold mb-1">Sources:</p>
                    <ul className="list-disc ml-4">
                      {sources.map((source, i) => (
                        <li key={i}>
                          {source.document} (Similarity: {(source.similarity * 100).toFixed(1)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="border-t p-4 bg-transparent">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={`${themeClasses[theme].input} flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`${themeClasses[theme].button} rounded-lg p-2`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          {!isOpen ? (
            <button
              onClick={() => setIsOpen(true)}
              className={`${themeClasses[theme].button} rounded-full p-4 shadow-lg transition-all duration-300`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          ) : (
            <div className={`${themeClasses[theme].container} w-96 rounded-lg shadow-xl transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-semibold">Chat with us</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!isMinimized && (
                <>
                  <div className="h-[calc(600px-8rem)] overflow-y-auto p-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? `${themeClasses[theme].message.user} ml-auto`
                            : `${themeClasses[theme].message.assistant}`
                        }`}
                      >
                        {message.content}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                    {showSources && sources && (
                      <div className="mt-4">
                        <button
                          className="text-xs text-primary underline mb-2"
                          onClick={() => setShowSourcesUI((v) => !v)}
                        >
                          {showSourcesUI ? 'Hide Sources' : 'Show Sources'}
                        </button>
                        {showSourcesUI && (
                          <div className="rounded bg-gray-100 dark:bg-gray-800 p-2 text-xs">
                            <p className="font-semibold mb-1">Sources:</p>
                            <ul className="list-disc ml-4">
                              {sources.map((source, i) => (
                                <li key={i}>
                                  {source.document} (Similarity: {(source.similarity * 100).toFixed(1)}%)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="border-t p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className={`${themeClasses[theme].input} flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`${themeClasses[theme].button} rounded-lg p-2`}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatWidget; 