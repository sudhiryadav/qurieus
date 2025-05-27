import Image from 'next/image';

export default function ChatWithYourDocuments() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Chat with Your Documents</h1>
      <p className="mb-6 text-lg">
        Upload your PDFs, DOCX, and other files to Qurieus and instantly ask questions about their content. Our AI understands your documents and provides context-aware answers, saving you hours of manual searching.
      </p>
      <Image
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
        alt="Chat with documents illustration"
        width={800}
        height={400}
        className="rounded-lg mb-6"
      />
      <h2 className="text-2xl font-semibold mb-2">How it works</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Upload one or more documents (PDF, DOCX, TXT, etc.)</li>
        <li>Ask questions in natural language</li>
        <li>Get instant, accurate answers with references to your files</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Use Cases</h2>
      <ul className="list-disc pl-6">
        <li>Quickly find information in contracts, manuals, or research papers</li>
        <li>Summarize lengthy documents</li>
        <li>Extract key facts or data from reports</li>
      </ul>
    </div>
  );
} 