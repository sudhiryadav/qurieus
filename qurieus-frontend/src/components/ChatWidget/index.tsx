import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, Maximize2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { AxiosProgressEvent } from "axios";

interface ChatWidgetProps {
  apiKey: string;
  initialMessage?: string;
  position?: "bottom-right" | "bottom-left";
  theme?: "light" | "dark";
  inline?: boolean;
  showSources?: boolean;
}

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("qurieus_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("qurieus_visitor_id", id);
  }
  return id;
};

// Add shimmer CSS
const shimmerStyle = `
  .shimmer {
    display: inline-block;
    background: linear-gradient(90deg, #8B5CF6 25%, #A78BFA 50%, #8B5CF6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  initialMessage = "Hello! How can I help you today?",
  position = "bottom-right",
  theme = "light",
  inline = false,
  showSources = false,
}) => {
  const [isOpen, setIsOpen] = useState(inline ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([{ role: "assistant", content: initialMessage }]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sources, setSources] = useState<any[] | null>(null);
  const [showSourcesUI, setShowSourcesUI] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [hasDocuments, setHasDocuments] = useState<boolean | null>(false);

  // Add useEffect for document check
  useEffect(() => {
    const checkDocuments = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/documents/check/${apiKey}`,
        );
        const hasDocs = response.data.hasDocuments;
        setHasDocuments(hasDocs);

        if (!hasDocs) {
          setMessages([
            {
              role: "assistant",
              content: "The system needs to be configured before using it.",
            },
          ]);
        } else {
          setMessages([{ role: "assistant", content: initialMessage }]);
        }
      } catch (error) {
        console.error("Error checking documents:", error);
        setHasDocuments(false);
        setMessages([
          {
            role: "assistant",
            content: "The system needs to be configured before using it.",
          },
        ]);
      }
    };

    checkDocuments();
  }, [apiKey, initialMessage]);

  useEffect(() => {
    if (!inline) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, inline]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (messageHistory.length > 0) {
        const newIndex =
          historyIndex < messageHistory.length - 1
            ? historyIndex + 1
            : historyIndex;
        setHistoryIndex(newIndex);
        setInputMessage(messageHistory[messageHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputMessage(messageHistory[messageHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputMessage("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !hasDocuments) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessageHistory((prev) => [...prev, userMessage]);
    setHistoryIndex(-1);
    setIsLoading(true);
    setSources(null);
    setShowSourcesUI(false);
    setShowThinking(true);
    let previousLength = 0;
    try {
      const visitorId = getVisitorId();
      let gotFirstChunk = false;
      let fullResponse = "";

      await axiosInstance.post(
        "/api/query",
        {
          message: userMessage,
          documentId: apiKey,
          visitorId,
        },
        {
          headers: {
            "x-visitor-id": visitorId,
          },
          responseType: "stream",
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const responseText = progressEvent.event.target?.responseText || "";
            const newChunk = responseText.slice(previousLength);
            previousLength = responseText.length;

            if (!newChunk.trim()) return;

            try {
              // Split by newlines in case we get multiple JSON objects
              const lines = newChunk
                .split("\n")
                .filter((line: string) => line.trim());
              for (const line of lines) {
                const data = JSON.parse(line);
                if (data.response) {
                  if (!gotFirstChunk) {
                    setShowThinking(false);
                    gotFirstChunk = true;
                    fullResponse = data.response;

                    setMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: fullResponse },
                    ]);
                  } else {
                    setMessages((prev) => {
                      const lastAssistantIdx = [...prev]
                        .reverse()
                        .findIndex((m) => m.role === "assistant");
                      if (lastAssistantIdx === -1) return prev;
                      const idx = prev.length - 1 - lastAssistantIdx;
                      const updated = [...prev];
                      updated[idx] = {
                        role: "assistant",
                        content: (updated[idx].content || "") + data.response,
                      };
                      return updated;
                    });
                  }
                }
                if (data.done) {
                  setSources(data.sources);
                }
              }
            } catch (e) {
              console.error("JSON parse error:", e, "Chunk:", newChunk);
            }
          },
        },
      );
    } catch (error) {
      setShowThinking(false);
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const themeClasses = {
    light: {
      container: "bg-white text-gray-800",
      button: "bg-primary text-white hover:bg-primary/90",
      input: "bg-gray-100 text-gray-800 border-gray-200",
      message: {
        user: "bg-primary text-white",
        assistant: "bg-gray-100 text-gray-800",
      },
    },
    dark: {
      container: "bg-gray-800 text-white",
      button: "bg-primary text-white hover:bg-primary/90",
      input: "bg-gray-700 text-white border-gray-600",
      message: {
        user: "bg-primary text-white",
        assistant: "bg-gray-700 text-white",
      },
    },
  };

  return (
    <>
      {/* Inject shimmer CSS */}
      <style>{shimmerStyle}</style>
      <div
        className={
          inline
            ? "flex h-full w-full flex-col"
            : `fixed ${positionClasses[position]} z-50`
        }
      >
        {inline ? (
          <>
            <div className="flex-1 overflow-y-auto bg-transparent p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? `${themeClasses[theme].message.user} ml-auto`
                      : `${themeClasses[theme].message.assistant}`
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {showThinking && (
                <div
                  className={`mb-4 max-w-[80%] rounded-lg p-3 ${themeClasses[theme].message.assistant}`}
                >
                  <span className="shimmer">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
              {showSources && sources && (
                <div className="mt-4">
                  <button
                    className="mb-2 text-xs text-primary underline"
                    onClick={() => setShowSourcesUI((v) => !v)}
                  >
                    {showSourcesUI ? "Hide Sources" : "Show Sources"}
                  </button>
                  {showSourcesUI && (
                    <div className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                      <p className="mb-1 font-semibold">Sources:</p>
                      <ul className="ml-4 list-disc">
                        {sources.map((source, i) => (
                          <li key={i}>
                            {source.document} (Similarity:{" "}
                            {(source.similarity * 100).toFixed(1)}%)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {hasDocuments && (
              <form
                onSubmit={handleSubmit}
                className="border-t bg-transparent p-4"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
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
            )}
          </>
        ) : (
          <>
            {!isOpen ? (
              <button
                onClick={() => setIsOpen(true)}
                className={`${themeClasses[theme].button} rounded-full p-4 shadow-lg transition-all duration-300`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </button>
            ) : (
              <div
                className={`${themeClasses[theme].container} w-96 rounded-lg shadow-xl transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"}`}
              >
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="text-lg font-semibold">Chat with us</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {isMinimized ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            message.role === "user"
                              ? `${themeClasses[theme].message.user} ml-auto`
                              : `${themeClasses[theme].message.assistant}`
                          }`}
                        >
                          {message.content}
                        </div>
                      ))}
                      {showThinking && (
                        <div
                          className={`mb-4 max-w-[80%] rounded-lg p-3 ${themeClasses[theme].message.assistant}`}
                        >
                          <span className="shimmer">Thinking...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                      {showSources && sources && (
                        <div className="mt-4">
                          <button
                            className="mb-2 text-xs text-primary underline"
                            onClick={() => setShowSourcesUI((v) => !v)}
                          >
                            {showSourcesUI ? "Hide Sources" : "Show Sources"}
                          </button>
                          {showSourcesUI && (
                            <div className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                              <p className="mb-1 font-semibold">Sources:</p>
                              <ul className="ml-4 list-disc">
                                {sources.map((source, i) => (
                                  <li key={i}>
                                    {source.document} (Similarity:{" "}
                                    {(source.similarity * 100).toFixed(1)}%)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {hasDocuments && (
                      <form onSubmit={handleSubmit} className="border-t p-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
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
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
