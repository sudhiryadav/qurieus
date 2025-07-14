'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MessageSquare, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface AgentChatListProps {
  chats: AgentChat[];
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
}

export default function AgentChatList({ chats, selectedChat, onChatSelect }: AgentChatListProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

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

  const getVisitorDisplayName = (chat: AgentChat) => {
    if (chat.conversation.visitorInfo?.name) {
      return chat.conversation.visitorInfo.name;
    }
    if (chat.conversation.visitorInfo?.email) {
      return chat.conversation.visitorInfo.email.split('@')[0];
    }
    return `Visitor ${chat.conversation.visitorId.slice(-6)}`;
  };

  const getVisitorInitials = (chat: AgentChat) => {
    const name = getVisitorDisplayName(chat);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastMessage = (chat: AgentChat) => {
    const messages = chat.conversation.messages;
    if (messages.length === 0) return 'No messages yet';
    
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
        <p>No chats in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat.conversationId}
          className={`cursor-pointer transition-all duration-200 ${
            selectedChat === chat.conversationId
              ? 'ring-2 ring-primary bg-primary/5'
              : hoveredChat === chat.conversationId
              ? 'shadow-md bg-gray-50'
              : 'hover:shadow-sm'
          }`}
          onClick={() => onChatSelect(chat.conversationId)}
          onMouseEnter={() => setHoveredChat(chat.conversationId)}
          onMouseLeave={() => setHoveredChat(null)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm">
                  {getVisitorInitials(chat)}
                </AvatarFallback>
              </Avatar>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {getVisitorDisplayName(chat)}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(chat.priority)}`}
                    >
                      {chat.priority}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(chat.status)}`}
                    >
                      {chat.status}
                    </Badge>
                  </div>
                </div>

                {/* Visitor Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  {chat.conversation.visitorInfo?.company && (
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      <span>{chat.conversation.visitorInfo.company}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    <span>{chat.conversation.totalMessages} messages</span>
                  </div>
                </div>

                {/* Last Message */}
                <p className="text-xs text-gray-600 truncate mb-2">
                  {getLastMessage(chat)}
                </p>

                {/* Time Info */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>
                      Assigned {formatDistanceToNow(new Date(chat.assignedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      Last seen {formatDistanceToNow(new Date(chat.conversation.lastSeen), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 