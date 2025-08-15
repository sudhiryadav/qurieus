/**
 * Formats chat message content to make URLs clickable and apply basic formatting
 * @param text - The raw message text
 * @returns Formatted HTML string with clickable URLs
 */
export function formatMessageText(text: string): string {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  let formattedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Make URLs clickable - match both http/https and www patterns
  formattedText = formattedText.replace(
    /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
    (url) => {
      // Ensure URL has protocol
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${url}</a>`;
    }
  );
  
  // Split text into lines for better list processing
  const lines = formattedText.split('\n');
  const processedLines = [];
  let inNumberedList = false;
  let inBulletList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for numbered list items
    if (/^\d+\.\s+/.test(line)) {
      if (!inNumberedList) {
        processedLines.push('<ol class="list-decimal ml-4 my-2">');
        inNumberedList = true;
      }
      processedLines.push('<li class="my-1">' + line.replace(/^\d+\.\s+/, '') + '</li>');
    }
    // Check for bullet list items
    else if (/^[-*•]\s+/.test(line)) {
      if (!inBulletList) {
        processedLines.push('<ul class="list-disc ml-4 my-2">');
        inBulletList = true;
      }
      processedLines.push('<li class="my-1">' + line.replace(/^[-*•]\s+/, '') + '</li>');
    }
    // Regular line
    else {
      // Close any open lists
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      if (inBulletList) {
        processedLines.push('</ul>');
        inBulletList = false;
      }
      processedLines.push(line);
    }
  }
  
  // Close any remaining open lists
  if (inNumberedList) {
    processedLines.push('</ol>');
  }
  if (inBulletList) {
    processedLines.push('</ul>');
  }
  
  // Join lines back together
  formattedText = processedLines.join('\n');
  
  // Format bold text (**text** or __text__)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  formattedText = formattedText.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');
  
  // Format italic text (*text* or _text_)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  formattedText = formattedText.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
  
  // Format code blocks (```code```)
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>');
  
  // Format inline code (`code`)
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Format line breaks
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  return formattedText;
}

/**
 * React component version that safely renders formatted message content
 * @param text - The raw message text
 * @returns JSX element with formatted content
 */
export function FormattedMessage({ text }: { text: string }) {
  return (
    <div 
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: formatMessageText(text) }}
    />
  );
}
