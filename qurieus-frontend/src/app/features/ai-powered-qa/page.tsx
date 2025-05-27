import Image from 'next/image';

export default function AIPoweredQA() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">AI-Powered Q&amp;A</h1>
      <p className="mb-6 text-lg">
        Qurieus uses advanced AI models to answer your questions based on your uploaded documents. Get precise, context-aware answers in seconds, even for complex queries.
      </p>
      <Image
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
        alt="AI Q&A illustration"
        width={800}
        height={400}
        className="rounded-lg mb-6"
      />
      <h2 className="text-2xl font-semibold mb-2">What you can do</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Ask follow-up questions and get conversational answers</li>
        <li>Clarify complex topics with AI explanations</li>
        <li>Get references to the exact part of your document</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Benefits</h2>
      <ul className="list-disc pl-6">
        <li>Save time searching for answers</li>
        <li>Reduce manual document review</li>
        <li>Empower your team with instant knowledge</li>
      </ul>
    </div>
  );
} 