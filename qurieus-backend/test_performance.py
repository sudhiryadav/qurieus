#!/usr/bin/env python3
"""
Performance testing script for Modal.com query endpoint
"""

import requests
import time
import json
import os
from typing import Dict, Any

# Configuration
MODAL_API_KEY = os.environ.get("API_KEY", "your-api-key-here")
MODAL_BASE_URL = "https://your-modal-app.modal.run"  # Replace with your actual Modal URL

def test_query_performance(query: str, user_id: str, collection_name: str = None) -> Dict[str, Any]:
    """Test query performance and return timing metrics."""
    
    headers = {
        "X-API-Key": MODAL_API_KEY,
        "Content-Type": "application/json"
    }
    
    if collection_name:
        headers["X-Collection"] = collection_name
    
    payload = {
        "query": query,
        "user_id": user_id,
        "history": [],
        "collection_name": collection_name
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{MODAL_BASE_URL}/query-documents",
            headers=headers,
            json=payload,
            stream=True,
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text}",
                "total_time": time.time() - start_time
            }
        
        # Process streaming response
        ai_response = ""
        sources = []
        done = False
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    try:
                        data = json.loads(line_str[6:])  # Remove 'data: ' prefix
                        if data.get('response'):
                            ai_response += data['response']
                        if data.get('sources'):
                            sources = data['sources']
                        if data.get('done'):
                            done = True
                            break
                    except json.JSONDecodeError:
                        continue
        
        total_time = time.time() - start_time
        
        return {
            "success": True,
            "total_time": total_time,
            "response_length": len(ai_response),
            "sources_count": len(sources),
            "response_preview": ai_response[:100] + "..." if len(ai_response) > 100 else ai_response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "total_time": time.time() - start_time
        }

def test_keep_warm():
    """Test the keep-warm endpoint."""
    headers = {"X-API-Key": MODAL_API_KEY}
    
    try:
        response = requests.get(f"{MODAL_BASE_URL}/keep-warm", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Keep-warm test: {data}")
            return data.get('models_loaded', False)
        else:
            print(f"❌ Keep-warm failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Keep-warm error: {e}")
        return False

def main():
    """Run performance tests."""
    print("🚀 Starting Modal.com Query Performance Tests")
    print("=" * 50)
    
    # Test keep-warm first
    print("\n1. Testing keep-warm endpoint...")
    models_loaded = test_keep_warm()
    
    if not models_loaded:
        print("⚠️  Models not loaded via keep-warm, but continuing with tests...")
    
    # Test queries
    test_queries = [
        "What are the main topics discussed in the documents?",
        "Can you summarize the key findings?",
        "What are the financial metrics mentioned?",
        "How does this relate to business performance?",
        "What recommendations are provided?"
    ]
    
    user_id = "test-user-123"
    collection_name = "dev_user_documents_embeddings"  # Adjust as needed
    
    print(f"\n2. Testing query performance with collection: {collection_name}")
    print("-" * 50)
    
    results = []
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nQuery {i}: {query}")
        result = test_query_performance(query, user_id, collection_name)
        
        if result["success"]:
            print(f"✅ Success: {result['total_time']:.2f}s")
            print(f"   Response length: {result['response_length']} chars")
            print(f"   Sources: {result['sources_count']}")
            print(f"   Preview: {result['response_preview']}")
        else:
            print(f"❌ Failed: {result['error']}")
        
        results.append(result)
        
        # Small delay between queries
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 PERFORMANCE SUMMARY")
    print("=" * 50)
    
    successful_results = [r for r in results if r["success"]]
    
    if successful_results:
        times = [r["total_time"] for r in successful_results]
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"Successful queries: {len(successful_results)}/{len(test_queries)}")
        print(f"Average response time: {avg_time:.2f}s")
        print(f"Min response time: {min_time:.2f}s")
        print(f"Max response time: {max_time:.2f}s")
        
        # Performance assessment
        if avg_time < 5:
            print("🎉 EXCELLENT performance!")
        elif avg_time < 10:
            print("✅ GOOD performance")
        elif avg_time < 15:
            print("⚠️  ACCEPTABLE performance")
        else:
            print("❌ POOR performance - needs optimization")
    else:
        print("❌ No successful queries to analyze")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main() 