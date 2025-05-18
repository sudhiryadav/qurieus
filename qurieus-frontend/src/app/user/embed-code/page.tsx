"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Copy, Check } from "lucide-react";

export default function EmbedCode() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      const frontendUrl = window.location.origin;
      const code = `<script>
  window.QurieusChatConfig = {
    documentOwnerId: '${session.user.id}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${frontendUrl}/embed.js" async></script>`;
      setEmbedCode(code);
    }
  }, [session]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy embed code");
    }
  };

  const handleApplyEmbedCode = () => {
    try {
      // Remove any existing chat container
      const existingContainer = document.getElementById('qurieus-chat-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const configScript = document.createElement('script');
      configScript.textContent = `window.QurieusChatConfig = {
        documentOwnerId: '${session?.user?.id}',
        theme: 'light',
        position: 'bottom-right'
      };`;
      document.head.appendChild(configScript);

      const embedScript = document.createElement('script');
      embedScript.src = window.location.origin + '/embed.js';
      embedScript.async = true;
      document.head.appendChild(embedScript);

      toast.success("Embed code applied successfully!");
    } catch (err) {
      toast.error("Failed to apply embed code");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">
        Embed Chat Widget
      </h1>

      <div className="mb-8">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">
            Your Embed Code
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Copy and paste this code into your website to add the chat widget.
          </p>
          <div className="relative">
            <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-dark-3">
              <code>{embedCode}</code>
            </pre>
            <Button
              onClick={handleCopy}
              className="absolute right-2 top-2"
              variant="outline"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">
          Live Demo
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Test the embed code on this page by clicking the button below.
        </p>
        <Button onClick={handleApplyEmbedCode} className="mt-2">
          Apply Embed Code
        </Button>
      </Card>

      <Card className="p-6 mt-8">
        <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">
          Customization Options
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Change <code>theme: &quot;light&quot;</code> to <code>theme: &quot;dark&quot;</code>{" "}
              for dark mode.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Position
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Available positions: <code>bottom-right</code>, <code>bottom-left</code>,{" "}
              <code>top-right</code>, <code>top-left</code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
