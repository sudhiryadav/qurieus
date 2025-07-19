"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Session Debug</h1>
        <p className="text-gray-600 mt-2">
          Debug information about your current session
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
          <CardDescription>
            Current authentication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {status === 'authenticated' ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
            <CardDescription>
              Your current session information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Links</CardTitle>
          <CardDescription>
            Test navigation to protected routes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a 
            href="/user/profile" 
            className="block p-3 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-800"
          >
            /user/profile
          </a>
          <a 
            href="/user/dashboard" 
            className="block p-3 bg-green-100 hover:bg-green-200 rounded-md text-green-800"
          >
            /user/dashboard
          </a>
          <a 
            href="/admin" 
            className="block p-3 bg-purple-100 hover:bg-purple-200 rounded-md text-purple-800"
          >
            /admin
          </a>
        </CardContent>
      </Card>
    </div>
  );
} 