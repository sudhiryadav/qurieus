'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface AgentStatusToggleProps {
  isOnline: boolean;
  isAvailable: boolean;
  onStatusChange: (online: boolean, available: boolean) => void;
}

export default function AgentStatusToggle({ 
  isOnline, 
  isAvailable, 
  onStatusChange 
}: AgentStatusToggleProps) {
  const [localOnline, setLocalOnline] = useState(isOnline);
  const [localAvailable, setLocalAvailable] = useState(isAvailable);
  const router = useRouter();

  useEffect(() => {
    setLocalOnline(isOnline);
    setLocalAvailable(isAvailable);
  }, [isOnline, isAvailable]);

  const handleOnlineToggle = () => {
    const newOnline = !localOnline;
    setLocalOnline(newOnline);
    onStatusChange(newOnline, localAvailable);
  };

  const handleAvailableToggle = () => {
    const newAvailable = !localAvailable;
    setLocalAvailable(newAvailable);
    onStatusChange(localOnline, newAvailable);
  };

  const handleLogout = async () => {
    try {
      // Set agent status to offline before logging out
      await axiosInstance.put('/api/agent/status', {
        isOnline: false,
        isAvailable: false
      });
      
      // Sign out and redirect to frontend
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      await signOut({ 
        callbackUrl: frontendUrl,
        redirect: true 
      });
    } catch (error) {
      // Still sign out even if status update fails
      try {
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
        await signOut({ 
          callbackUrl: frontendUrl,
          redirect: true 
        });
      } catch (fallbackError) {
        // Force redirect as last resort
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
        window.location.href = frontendUrl;
      }
    }
  };

  const getStatusText = () => {
    if (!localOnline) return 'Offline';
    if (!localAvailable) return 'Busy';
    return 'Available';
  };

  const getStatusColor = () => {
    if (!localOnline) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (!localAvailable) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusIcon = () => {
    if (!localOnline) return <WifiOff className="w-4 h-4" />;
    if (!localAvailable) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Status Badge */}
      <Badge variant="outline" className={getStatusColor()}>
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </Badge>

      {/* Status Toggle Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-neutral-50 dark:bg-neutral-900">
          <DropdownMenuItem onClick={handleOnlineToggle}>
            <div className="flex items-center space-x-2 w-full">
              {localOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span>{localOnline ? 'Go Offline' : 'Go Online'}</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleAvailableToggle}
            disabled={!localOnline}
            className={!localOnline ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <div className="flex items-center space-x-2 w-full">
              {localAvailable ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{localAvailable ? 'Set Busy' : 'Set Available'}</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <div className="flex items-center space-x-2 w-full">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 