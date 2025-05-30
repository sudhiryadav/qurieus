import Image from 'next/image';

export default function KnowledgeSearchSummarization() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Knowledge Search &amp; Summarization</h1>
      <p className="mb-6 text-lg">
        Instantly search across all your uploaded documents and receive concise, AI-generated summaries. Qurieus helps you find the information you need and understand it faster.
      </p>
      <Image
        src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80"
        alt="Knowledge search and summarization illustration"
        width={800}
        height={400}
        className="rounded-lg mb-6"
      />
      <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Full-text search across all your documents</li>
        <li>AI-generated summaries for quick understanding</li>
        <li>Highlight and extract key points</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Use Cases</h2>
      <ul className="list-disc pl-6">
        <li>Research and academic work</li>
        <li>Business intelligence and reporting</li>
        <li>Legal and compliance document review</li>
      </ul>
    </div>
  );
} 