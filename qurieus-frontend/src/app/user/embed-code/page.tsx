"use client";

import ChatWidget from "@/components/ChatWidget";
import { Check, Copy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmbedCode() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [previewConfig, setPreviewConfig] = useState({
    theme: 'light',
    position: 'bottom-right',
    initialMessage: 'Hello! How can I help you today?'
  });
  const [showEmbedWidget, setShowEmbedWidget] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const apiKey = session?.user?.id || '';

  const embedCode = `<script 
  src=\"https://qurieus.com/embed.js\"
  data-api-key=\"${apiKey}\"
  data-initial-message=\"${previewConfig.initialMessage}\"
  data-position=\"${previewConfig.position}\"
  data-theme=\"${previewConfig.theme}\"
></script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Embed Chat Widget</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Add our chat widget to your website by copying and pasting the code below.
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          onClick={() => setShowEmbedWidget((v) => !v)}
        >
          {showEmbedWidget ? 'Hide Embed Widget' : 'Show Embed Widget'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-4 text-xl font-semibold">Widget Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Theme</label>
              <select
                value={previewConfig.theme}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-dark-3 dark:bg-dark-3"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Position</label>
              <select
                value={previewConfig.position}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, position: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-dark-3 dark:bg-dark-3"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Initial Message</label>
              <input
                type="text"
                value={previewConfig.initialMessage}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, initialMessage: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-dark-3 dark:bg-dark-3"
                placeholder="Enter initial message"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Embed Code</h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-dark-3">
              <code className="text-sm">{embedCode}</code>
            </pre>
          </div>

          <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">Important Notes:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>The widget requires an active subscription to work</li>
              <li>Customize the appearance using the configuration options</li>
              <li>Test the widget using the live preview below</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-4 text-xl font-semibold">Live Preview</h2>
        <div className="relative h-[400px] rounded-lg border border-dashed border-gray-300 dark:border-dark-3 overflow-hidden">
          {apiKey ? (
            <ChatWidget
              apiKey={apiKey}
              initialMessage={previewConfig.initialMessage}
              position={previewConfig.position as 'bottom-right' | 'bottom-left'}
              theme={previewConfig.theme as 'light' | 'dark'}
              inline={true}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <div>
                <p className="mb-2 font-semibold">No API key found for your user session.</p>
                <p>Please make sure you are logged in and your account is set up correctly.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEmbedWidget && apiKey && (
        <ChatWidget
          apiKey={apiKey}
          initialMessage={previewConfig.initialMessage}
          position={previewConfig.position as 'bottom-right' | 'bottom-left'}
          theme={previewConfig.theme as 'light' | 'dark'}
        />
      )}
    </div>
  );
}
