"use client";

import { Check, Copy, Code, Upload, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

export default function EmbedCode() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewConfig, setPreviewConfig] = useState({
    theme: 'light',
    position: 'bottom-right',
    initialMessage: 'Hello! How can I help you today?'
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
    const fetchDocuments = async () => {
        try {
          const response = await axiosInstance.get('/api/admin/documents');
          setDocuments(response.data.documents || []);
        } catch (error) {
          console.error('Error fetching documents:', error);
        } finally {
          setLoading(false);
        }
    };

    fetchDocuments();
  }, [status, session?.user?.id,router]);

  // Load and initialize the embed script for preview
  useEffect(() => {
    if (!session?.user?.id) return;

    if (showPreview) {
      // Create and add the script tag to document head (like a user would do)
      const script = document.createElement('script');
      script.src = '/embed.js';
      script.setAttribute('data-api-key', session.user.id);
      script.setAttribute('data-initial-message', previewConfig.initialMessage);
      script.setAttribute('data-position', previewConfig.position);
      script.setAttribute('data-theme', previewConfig.theme);
      script.setAttribute('data-show-sources', 'false');
      script.async = true;
      script.id = 'qurieus-preview-script'; // Add ID for easy removal
      
      // Add to document head
      document.head.appendChild(script);
    } else {
      // Remove the script tag when preview is hidden
      const existingScript = document.getElementById('qurieus-preview-script');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Also remove any existing chat widget elements
      const existingWidget = document.getElementById('qurieus-chat-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
    }

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('qurieus-preview-script');
      if (existingScript) {
        existingScript.remove();
      }
      const existingWidget = document.getElementById('qurieus-chat-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
    };
  }, [showPreview, previewConfig, session?.user?.id]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
              <Code className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold">No Documents Found</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to add documents to your knowledge base before you can embed the chat widget.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/user/knowledge-base')}
              className="inline-flex items-center space-x-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Documents</span>
            </button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Once you have documents in your knowledge base, you&apos;ll be able to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Configure and customize your chat widget</li>
                <li>Preview how it will look on your website</li>
                <li>Get the embed code to add to your site</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const apiKey = session?.user?.id || '';
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://qurieus.com';

  const embedCode = `<script 
  src=\"${currentDomain}/embed.js\"
  data-api-key=\"${apiKey}\"
  data-initial-message=\"${previewConfig.initialMessage}\"
  data-position=\"${previewConfig.position}\"
  data-theme=\"${previewConfig.theme}\"
  async
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

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Embed Chat Widget</h1>
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
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePreview}
                className={`flex items-center justify-center rounded-lg border px-4 py-2 transition-colors ${
                  showPreview 
                    ? 'border-primary bg-primary text-white hover:bg-primary/90' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:hover:bg-dark-4'
                }`}
                title={showPreview ? 'Hide Preview' : 'Show Preview'}
              >
                <Eye className="h-4 w-4" />
              </button>
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
          </div>
          
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-dark-3">
              <code className="text-sm">{embedCode}</code>
            </pre>
          </div>
          <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">Important Notes:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>Add our chat widget to your website by copying and pasting the code above.</li>
              <li>The widget requires an active subscription to work</li>
              <li>Customize the appearance using the configuration options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
