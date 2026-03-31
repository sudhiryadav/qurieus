'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket, useChatMessages, useChatStatus } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Building,
  Mail,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axios';
import { trackGaAiConversation } from '@/lib/gtag';
import { FormattedMessage } from '@/utils/formatMessage';

interface AgentChat {
  id: string;
  conversationId: string;
  status: string;
  assignedAt: string;
  priority: string;
  conversation: {
    visitorId: string;
    totalMessages: number;
    lastSeen: string;
    visitorInfo?: {
      name?: string;
      email?: string;
      company?: string;
    };
    messages: Array<{
      id: string;
      content: string;
      role: string;
      createdAt: string;
    }>;
  };
}

interface AgentChatWindowProps {
  chatId: string;
  agentId: string;
  chat?: AgentChat;
  onStatusUpdate?: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  createdAt: string;
  agentId?: string;
}

export default function AgentChatWindow({ chatId, agentId, chat, onStatusUpdate }: AgentChatWindowProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [localStatus, setLocalStatus] = useState<string | undefined>(undefined);
  const [resolving, setResolving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.IO hooks
  const { sendMessage, isConnected } = useSocket({
    chatId,
    agentId,
    role: 'agent'
  });

  const realTimeMessages = useChatMessages(chatId);
  const { status, meta } = useChatStatus(chatId);

  // Keep localStatus in sync with backend status
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat/history`,{
          params: {
            conversationId: chatId,
            limit: 50
          }
        });
        if (response.status === 200) {
          setChatHistory(response.data.messages || []);
          setPreviousMessageCount(response.data.messages?.length || 0);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast.error('Failed to load chat history');
      }
    };

    if (chatId) {
      loadChatHistory();
    }
  }, [chatId]);

  // Combine chat history with real-time messages
  useEffect(() => {
    if (realTimeMessages.length > 0) {
      const latestMessage = realTimeMessages[realTimeMessages.length - 1];
      setChatHistory(prev => {
        // Check if message already exists by ID or content + timestamp
        const exists = prev.some(msg => 
          msg.id === latestMessage.id || 
          (msg.content === latestMessage.content && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(latestMessage.createdAt).getTime()) < 5000) // Within 5 seconds
        );
        if (!exists) {
          return [...prev, latestMessage];
        }
        return prev;
      });
    }
  }, [realTimeMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Only auto-scroll if new messages were added (not on initial load)
    if (chatHistory.length > previousMessageCount && previousMessageCount > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setPreviousMessageCount(chatHistory.length);
    }
  }, [chatHistory, previousMessageCount]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !isConnected) return;

    const messageToSend = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Send message via API for persistence and Socket.IO emission
      const response = await axiosInstance.post(`/api/agent/chats/${chatId}/messages`, {
        content: messageToSend
      });

      if (response.status >= 200 && response.status < 300) {
        trackGaAiConversation({
          conversation_surface: "agent_console",
          chat_id: chatId,
        });
      }

      // Don't add message to local state immediately - let Socket.IO handle it
      // This prevents duplication since the API endpoint emits the Socket.IO event
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
      // Restore message if sending failed
      setMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusUpdate = async (newStatus: 'RESOLVED' | 'CLOSED') => {
    if (newStatus === 'RESOLVED') setResolving(true);
    if (newStatus === 'CLOSED') setClosing(true);
    try {
      const response = await axiosInstance.put(`/api/agent/chats/${chatId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setLocalStatus(newStatus); // Update local status immediately
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }
    } catch (error: any) {
      console.error('Error updating chat status:', error);
      toast.error(error.response?.data?.error || 'Failed to update chat status');
    } finally {
      setResolving(false);
      setClosing(false);
    }
  };

  const getVisitorDisplayName = () => {
    if (chat?.conversation.visitorInfo?.name) {
      return chat.conversation.visitorInfo.name;
    }
    if (chat?.conversation.visitorInfo?.email) {
      return chat.conversation.visitorInfo.email.split('@')[0];
    }
    return `Visitor ${chat?.conversation.visitorId.slice(-6) || ''}`;
  };

  const getVisitorInitials = () => {
    const name = getVisitorDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if chat is resolved or closed
  const isChatResolvedOrClosed = localStatus === 'RESOLVED' || localStatus === 'CLOSED';

  if (!chatId) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a chat to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getVisitorInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{getVisitorDisplayName()}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{chat?.conversation.visitorInfo?.email || 'No email'}</span>
                {chat?.conversation.visitorInfo?.company && (
                  <>
                    <Building className="w-4 h-4" />
                    <span>{chat.conversation.visitorInfo.company}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(chat?.priority || 'NORMAL')}>
              {chat?.priority || 'NORMAL'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(localStatus || status)}>
              {localStatus || status}
            </Badge>
            
            {/* Show resolution info if chat is resolved or closed */}
            {isChatResolvedOrClosed && (
              <div className="flex items-center space-x-2 ml-4 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span>Chat {localStatus?.toLowerCase() || status.toLowerCase()}</span>
                {meta?.resolvedAt && (
                  <span>• {new Date(meta.resolvedAt).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area - Fixed height with proper scrolling */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Container - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'agent'
                    ? 'bg-primary text-primary-foreground'
                    : msg.role === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : msg.role === 'system'
                    ? 'bg-orange-100 text-orange-900 border border-orange-200'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                <FormattedMessage text={msg.content} />
                <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                  <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                  {msg.role === 'assistant' && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">AI</span>
                  )}
                  {msg.role === 'agent' && (
                    <span className="text-xs bg-primary/20 text-primary px-1 rounded">Agent</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isChatResolvedOrClosed ? "Chat is resolved/closed" : "Type your message..."}
              disabled={sending || !isConnected || isChatResolvedOrClosed}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending || !isConnected || isChatResolvedOrClosed}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
            
            {/* Status Management Buttons - Only show if chat is not resolved or closed */}
            {!isChatResolvedOrClosed && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate('RESOLVED')}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={resolving || closing}
                >
                  {resolving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  )}
                  {resolving ? 'Resolving...' : 'Resolve'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate('CLOSED')}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  disabled={resolving || closing}
                >
                  {closing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {closing ? 'Closing...' : 'Close'}
                </Button>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {!isConnected && 'Connecting to chat...'}
            {sending && 'Sending message...'}
            {isChatResolvedOrClosed && 'This chat has been resolved and is no longer active'}
          </div>
        </div>
      </div>
    </Card>
  );
} 