"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";
import UserAutocomplete from "@/components/Common/UserAutocomplete";
import RichTextEditor from "@/components/Common/RichTextEditor";
import { Send, Users, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          /* surfaced via toast */
        }
      } else {
        showToast.success(`Email sent successfully to ${sent} users!`);
      }

      setSelectedUsers([]);
      setSubject("");
      setBody("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      showToast.error(e.response?.data?.error || e.message || "Failed to send email");
    } finally {
      setSending(false);
      setSendingProgress({ sent: 0, total: 0, failed: 0 });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Broadcast</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Send emails to selected users from your application.
        </p>
      </div>

      {/* Main Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        {/* Recipients Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <Label className="text-sm font-medium">Recipients</Label>
          </div>
          <UserAutocomplete
            users={users}
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
            isLoading={loading}
            placeholder="Search and select users..."
          />
          {selectedUsers.length > 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Subject Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <Label className="text-sm font-medium">Subject</Label>
          </div>
          <Input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            fieldSize="lg"
          />
        </div>

        {/* Body Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <Label className="text-sm font-medium">Email Body</Label>
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
          <Button
            size="lg"
            onClick={handleSend}
            loading={sending}
            disabled={!selectedUsers.length || !subject.trim() || !body.trim()}
          >
            <Send className="h-4 w-4" />
            {sending
              ? `Sending... (${sendingProgress.sent}/${sendingProgress.total})`
              : "Send Email"}
          </Button>
        </div>

        {/* Progress Indicator */}
        {sending && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Sending Progress
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {sendingProgress.sent} / {sendingProgress.total}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-dark-3">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                style={{
                  width: `${sendingProgress.total > 0 ? (sendingProgress.sent / sendingProgress.total) * 100 : 0}%`,
                }}
              />
            </div>
            {sendingProgress.failed > 0 && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {sendingProgress.failed} emails failed to send
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {selectedUsers.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email Summary</h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedUsers.length}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Subject:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{subject || "Not set"}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Content Length:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {body.replace(/<[^>]*>/g, "").length} characters
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
