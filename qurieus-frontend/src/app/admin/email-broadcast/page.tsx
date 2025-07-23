"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";
import UserAutocomplete from "@/components/Common/UserAutocomplete";
import RichTextEditor from "@/components/Common/RichTextEditor";
import { Send, Users, MessageSquare, FileText } from "lucide-react";
import { useTheme } from "next-themes";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminEmailBroadcastPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/admin/users");
        setUsers(res.data.users || []);
      } catch (err) {
        showToast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSend = async () => {
    if (!selectedUsers.length || !subject.trim() || !body.trim()) {
      showToast.error("Please fill all fields and select at least one user.");
      return;
    }
    
    setSending(true);
    setSendingProgress({ sent: 0, total: selectedUsers.length, failed: 0 });
    
    try {
      const response = await axiosInstance.post("/api/admin/send-email", {
        userIds: selectedUsers.map((u) => u.id),
        subject,
        html: body,
      });
      
      const { sent, failed, total, errors } = response.data;
      setSendingProgress({ sent, total, failed });
      
      if (failed > 0) {
        showToast.warning(`Email sent to ${sent} users, but ${failed} failed. Check console for details.`);
        if (errors) {
          console.error('Failed emails:', errors);
        }
      } else {
        showToast.success(`Email sent successfully to ${sent} users!`);
      }
      
      setSelectedUsers([]);
      setSubject("");
      setBody("");
    } catch (err: any) {
      showToast.error(err.response?.data?.error || err.message || "Failed to send email");
    } finally {
      setSending(false);
      setSendingProgress({ sent: 0, total: 0, failed: 0 });
    }
  };

  return (
    <>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Broadcast</h1>
          </div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Send emails to selected users from your application.</p>
        </div>

        {/* Main Form */}
        <div className={`rounded-lg shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Recipients Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recipients</label>
            </div>
            <UserAutocomplete
              users={users}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              isLoading={loading}
              placeholder="Search and select users..."
            />
            {selectedUsers.length > 0 && (
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Subject Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Body Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Body</label>
            </div>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your email content here..."
              className="min-h-[300px]"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending || !selectedUsers.length || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending... ({sendingProgress.sent}/{sendingProgress.total})
                </>
              ) : (
                "Send Email"
              )}
            </button>
          </div>

          {/* Progress Indicator */}
          {sending && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  Sending Progress
                </span>
                <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  {sendingProgress.sent} / {sendingProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sendingProgress.total > 0 ? (sendingProgress.sent / sendingProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              {sendingProgress.failed > 0 && (
                <p className={`text-sm mt-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  {sendingProgress.failed} emails failed to send
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {selectedUsers.length > 0 && (
          <div className={`mt-6 rounded-lg shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recipients:</span>
                <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedUsers.length}</span>
              </div>
              <div>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subject:</span>
                <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{subject || "Not set"}</span>
              </div>
              <div>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Content Length:</span>
                <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{body.replace(/<[^>]*>/g, '').length} characters</span>
              </div>
            </div>
          </div>
        )}
      </>
  );
}