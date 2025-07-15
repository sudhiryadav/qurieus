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
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axios';

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
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent';
  createdAt: string;
  agentId?: string;
}

export default function AgentChatWindow({ chatId, agentId, chat }: AgentChatWindowProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.IO hooks
  const { sendMessage, isConnected } = useSocket({
    chatId,
    agentId,
    role: 'agent'
  });

  const realTimeMessages = useChatMessages(chatId);
  const { status, meta } = useChatStatus(chatId);

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
        // Check if message already exists
        const exists = prev.some(msg => msg.id === latestMessage.id);
        if (!exists) {
          return [...prev, latestMessage];
        }
        return prev;
      });
    }
  }, [realTimeMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      // Send via API
      await axiosInstance.post(`/api/agent/chats/${chatId}/messages`, { 
        content: message.trim() 
      });
      setMessage('');
      toast.success('Message sent');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
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

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-sm">
                {getVisitorInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{getVisitorDisplayName()}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
                  <span>{isConnected ? 'Online' : 'Offline'}</span>
                </div>
                {chat?.conversation.visitorInfo?.company && (
                  <div className="flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    <span>{chat.conversation.visitorInfo.company}</span>
                  </div>
                )}
                {chat?.conversation.visitorInfo?.email && (
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    <span>{chat.conversation.visitorInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(chat?.priority || 'NORMAL')}>
              {chat?.priority || 'NORMAL'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending || !isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending || !isConnected}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {!isConnected && 'Connecting to chat...'}
              {sending && 'Sending message...'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 