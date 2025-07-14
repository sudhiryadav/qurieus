'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSocket, useAgentStatus } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  WifiOff,
  Settings
} from 'lucide-react';
import AgentChatList from '@/components/Agent/AgentChatList';
import AgentChatWindow from '@/components/Agent/AgentChatWindow';
import AgentStatusToggle from '@/components/Agent/AgentStatusToggle';
import { toast } from 'react-toastify';

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

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [assignedChats, setAssignedChats] = useState<AgentChat[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Socket.IO hooks
  const { isConnected } = useSocket({
    agentId: session?.user?.id,
    role: 'agent',
    autoConnect: true
  });

  const agentStatuses = useAgentStatus();

  // Check if user is an agent
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    // Verify user is an agent
    const checkAgentRole = async () => {
      try {
        const response = await fetch('/api/agent/verify');
        if (!response.ok) {
          router.push('/dashboard');
          toast.error('Access denied. Agent role required.');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error verifying agent role:', error);
        router.push('/dashboard');
        toast.error('Error verifying agent role.');
      }
    };

    checkAgentRole();
  }, [session, status, router]);

  // Load assigned chats
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadAssignedChats = async () => {
      try {
        const response = await fetch('/api/agent/chats');
        if (response.ok) {
          const data = await response.json();
          setAssignedChats(data.chats);
        }
      } catch (error) {
        console.error('Error loading assigned chats:', error);
        toast.error('Failed to load assigned chats');
      }
    };

    loadAssignedChats();
    // Refresh every 30 seconds
    const interval = setInterval(loadAssignedChats, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  // Handle status updates
  const handleStatusUpdate = async (online: boolean, available: boolean) => {
    try {
      const response = await fetch('/api/agent/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: online, isAvailable: available })
      });

      if (response.ok) {
        setIsOnline(online);
        setIsAvailable(available);
        toast.success(`Status updated: ${online ? 'Online' : 'Offline'}, ${available ? 'Available' : 'Busy'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  const pendingChats = assignedChats.filter(chat => chat.status === 'PENDING');
  const activeChats = assignedChats.filter(chat => chat.status === 'ACTIVE');
  const resolvedChats = assignedChats.filter(chat => chat.status === 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Status Controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <AgentStatusToggle
          isOnline={isOnline}
          isAvailable={isAvailable}
          onStatusChange={handleStatusUpdate}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Chat List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assigned Chats</span>
                <Badge variant="secondary">{assignedChats.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending ({pendingChats.length})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({activeChats.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    Resolved ({resolvedChats.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-4">
                  <AgentChatList
                    chats={pendingChats}
                    selectedChat={selectedChat}
                    onChatSelect={handleChatSelect}
                  />
                </TabsContent>
                
                <TabsContent value="active" className="mt-4">
                  <AgentChatList
                    chats={activeChats}
                    selectedChat={selectedChat}
                    onChatSelect={handleChatSelect}
                  />
                </TabsContent>
                
                <TabsContent value="resolved" className="mt-4">
                  <AgentChatList
                    chats={resolvedChats}
                    selectedChat={selectedChat}
                    onChatSelect={handleChatSelect}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Chat Window */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <AgentChatWindow
              chatId={selectedChat}
              agentId={session.user.id}
              chat={assignedChats.find(c => c.conversationId === selectedChat)}
            />
          ) : (
            <Card className="h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a chat to start responding</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 