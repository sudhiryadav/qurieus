import Image from 'next/image';

export default function EasyWebsiteEmbedding() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Easy Website Embedding</h1>
      <p className="mb-6 text-lg">
        Add a chat widget to your website in minutes. Qurieus lets your visitors interact with your knowledge base using natural language, providing instant answers and support.
      </p>
      <Image
        src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
        alt="Website embedding illustration"
        width={800}
        height={400}
        className="rounded-lg mb-6"
      />
      <h2 className="text-2xl font-semibold mb-2">How it helps</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Embed with a simple code snippet</li>
        <li>Provide 24/7 support and answers to your users</li>
        <li>Increase engagement and reduce support tickets</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Example Use Cases</h2>
      <ul className="list-disc pl-6">
        <li>Customer support for SaaS products</li>
        <li>Internal knowledge base for teams</li>
        <li>Educational websites and online courses</li>
      </ul>
    </div>
  );
} 