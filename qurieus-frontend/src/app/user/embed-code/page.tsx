"use client";

import { Check, Copy, Code, Upload, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

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
  const [isDefaultForSite, setIsDefaultForSite] = useState<boolean | null>(null);
  const [settingDefault, setSettingDefault] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
    const fetchDocuments = async () => {
        try {
          const response = await axiosInstance.get('/api/admin/documents');
          setDocuments(response.data.documents || []);
        } catch (error) {
        } finally {
          setLoading(false);
        }
    };

    fetchDocuments();
  }, [status, session?.user?.id, router]);

  // Check if current user is set as default embed for this website (super admin only)
  useEffect(() => {
    if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") return;
    fetch("/api/site-config/embed")
      .then((res) => res.json())
      .then((data) => setIsDefaultForSite(data.embedUserId === session?.user?.id))
      .catch(() => setIsDefaultForSite(false));
  }, [session?.user?.id, session?.user?.role]);

  const setAsDefaultForWebsite = async () => {
    if (!session?.user?.id) return;
    setSettingDefault(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "embed_user_id", value: session.user.id }),
      });
      if (res.ok) setIsDefaultForSite(true);
    } finally {
      setSettingDefault(false);
    }
  };

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
            <div className="flex items-center gap-3 ml-4">
              <Code className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-dark dark:text-white">Embed Code</h1>
            </div>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">No Documents Found</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to add documents to your knowledge base before you can embed the chat widget.
          </p>
          
          <div className="space-y-4">
            <Button size="lg" onClick={() => router.push("/user/knowledge-base")}>
              <Upload className="h-5 w-5" />
              Upload Documents
            </Button>
            
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
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Embed Chat Widget</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Widget Configuration</h2>
          
          <div className="space-y-4">
            <FormField label="Theme">
              <NativeSelect
                value={previewConfig.theme}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, theme: e.target.value }))}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </NativeSelect>
            </FormField>

            <FormField label="Position">
              <NativeSelect
                value={previewConfig.position}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </NativeSelect>
            </FormField>

            <FormField label="Initial Message">
              <Input
                type="text"
                value={previewConfig.initialMessage}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, initialMessage: e.target.value }))}
                placeholder="Enter initial message"
              />
            </FormField>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Embed Code</h2>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={showPreview ? "default" : "outline"}
                size="icon"
                onClick={togglePreview}
                title={showPreview ? "Hide Preview" : "Show Preview"}
                aria-label={showPreview ? "Hide Preview" : "Show Preview"}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button type="button" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-dark-3">
              <code className="text-sm text-gray-900 dark:text-gray-200">{embedCode}</code>
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
          {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN") && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-3">
              <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">Website default</h3>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Use your account as the default embed for this website (Qurieus homepage). The widget on the main site will use your knowledge base.
              </p>
              <Button
                onClick={setAsDefaultForWebsite}
                loading={settingDefault}
                disabled={isDefaultForSite === true}
              >
                {settingDefault
                  ? "Saving…"
                  : isDefaultForSite
                    ? "Already default"
                    : "Set as default for this website"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
