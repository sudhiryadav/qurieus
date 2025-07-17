'use client';

import AgentChatList from '@/components/Agent/AgentChatList';
import AgentChatWindow from '@/components/Agent/AgentChatWindow';
import AgentStatusToggle from '@/components/Agent/AgentStatusToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentStatus, useSocket } from '@/hooks/useSocket';
import axiosInstance from '@/lib/axios';
import {
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
        await axiosInstance.get('/api/agent/verify');
        setLoading(false);
        
        // Set agent status to online and available by default when they first load the dashboard
        await setDefaultAgentStatus();
      } catch (error) {
        console.error('Error verifying agent role:', error);
        router.push('/dashboard');
        toast.error('Error verifying agent role.');
      }
    };

    checkAgentRole();
  }, [session, status, router]);

  // Set default agent status (online and available)
  const setDefaultAgentStatus = async () => {
    try {
      const response = await axiosInstance.put('/api/agent/status', {
        isOnline: true,
        isAvailable: true
      });
      
      if (response.data.success) {
        setIsOnline(true);
        setIsAvailable(true);
        console.log('Agent status set to online and available');
      }
    } catch (error) {
      console.error('Error setting default agent status:', error);
      // Don't show error toast as this is not critical for dashboard functionality
    }
  };

  // Load assigned chats
  const loadAssignedChats = async () => {
    try {
      const response = await axiosInstance.get('/api/agent/chats');
      setAssignedChats(response.data.chats);
    } catch (error) {
      console.error('Error loading assigned chats:', error);
      toast.error('Failed to load assigned chats');
    }
  };

  // Load current agent status
  const loadAgentStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/agent/status');
      if (response.data.success) {
        setIsOnline(response.data.status.isOnline);
        setIsAvailable(response.data.status.isAvailable);
      }
    } catch (error) {
      console.error('Error loading agent status:', error);
      // Don't show error toast for status loading as it's not critical
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    loadAssignedChats();
    loadAgentStatus();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadAssignedChats();
      loadAgentStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  // Handle status updates
  const handleStatusUpdate = async (online: boolean, available: boolean) => {
    try {
      await axiosInstance.put('/api/agent/status', { isOnline: online, isAvailable: available });
      setIsOnline(online);
      setIsAvailable(available);
      toast.success(`Status updated: ${online ? 'Online' : 'Offline'}, ${available ? 'Available' : 'Busy'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Set agent status to offline before logging out
      await axiosInstance.put('/api/agent/status', { isOnline: false, isAvailable: false });
      toast.success('Logged out successfully');
      // Sign out from NextAuth
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still sign out even if status update fails
      await signOut({ callbackUrl: '/auth/signin' });
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Agent Dashboard</h1>
              <p className="text-gray-600">Manage your assigned chats</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <AgentStatusToggle
                isOnline={isOnline}
                isAvailable={isAvailable}
                onStatusChange={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full height minus header */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Chat List */}
        <div className="w-96 flex-shrink-0 border-r bg-background">
          <div className="h-full p-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <span>Assigned Chats</span>
                  <Badge variant="secondary">{assignedChats.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <Tabs defaultValue="pending" className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
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
                  
                  <div className="flex-1 overflow-hidden mt-4">
                    <TabsContent value="pending" className="h-full m-0 p-4">
                      <div className="h-full overflow-y-auto">
                        <AgentChatList
                          chats={pendingChats}
                          selectedChat={selectedChat}
                          onChatSelect={handleChatSelect}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="active" className="h-full m-0 p-4">
                      <div className="h-full overflow-y-auto">
                        <AgentChatList
                          chats={activeChats}
                          selectedChat={selectedChat}
                          onChatSelect={handleChatSelect}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="resolved" className="h-full m-0 p-4">
                      <div className="h-full overflow-y-auto">
                        <AgentChatList
                          chats={resolvedChats}
                          selectedChat={selectedChat}
                          onChatSelect={handleChatSelect}
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className="flex-1 min-w-0 h-full p-4">
          <AgentChatWindow
            chatId={selectedChat || ''}
            agentId={session?.user?.id || ''}
            chat={assignedChats.find(chat => chat.conversationId === selectedChat)}
            onStatusUpdate={loadAssignedChats}
          />
        </div>
      </div>
    </div>
  );
} 