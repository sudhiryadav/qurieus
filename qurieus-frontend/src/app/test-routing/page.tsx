export default function TestRoutingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Routing Test Page</h1>
      <p className="text-gray-600 mb-4">
        If you can see this page, basic routing is working.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-100 rounded-md">
          <h2 className="font-semibold text-green-800">✅ Basic Routing Works</h2>
          <p className="text-green-700">This page loaded successfully.</p>
        </div>
        
        <div className="p-4 bg-blue-100 rounded-md">
          <h2 className="font-semibold text-blue-800">🔗 Test Links</h2>
          <div className="space-y-2 mt-2">
            <a href="/user/profile" className="block text-blue-600 hover:underline">
              /user/profile
            </a>
            <a href="/user/dashboard" className="block text-blue-600 hover:underline">
              /user/dashboard
            </a>
            <a href="/debug-session" className="block text-blue-600 hover:underline">
              /debug-session
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 