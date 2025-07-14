#!/usr/bin/env python3
"""
Script to add missing payload indexes to Qdrant collection.
Run this script to fix the "Index required but not found" error.
"""

import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PayloadIndexParams

# Load environment variables
load_dotenv()

def fix_qdrant_indexes():
    """Add missing payload indexes to Qdrant collection."""
    
    # Get Qdrant configuration
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_collection = os.getenv("QDRANT_COLLECTION", "dev_user_documents_embeddings")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    
    print(f"Connecting to Qdrant: {qdrant_url}")
    print(f"Collection: {qdrant_collection}")
    
    # Initialize Qdrant client
    if qdrant_api_key:
        qdrant_client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key
        )
    else:
        qdrant_client = QdrantClient(qdrant_url)
    
    try:
        # Check if collection exists
        collection_info = qdrant_client.get_collection(qdrant_collection)
        print(f"Collection '{qdrant_collection}' exists")
        
        # Get existing payload indexes
        existing_indexes = collection_info.payload_indexes
        existing_field_names = [idx.field_name for idx in existing_indexes]
        
        print(f"Existing payload indexes: {existing_field_names}")
        
        # Define required indexes
        required_indexes = [
            ("user_id", "keyword"),
            ("document_id", "keyword"),
            ("filename", "keyword")
        ]
        
        # Create missing indexes
        for field_name, field_schema in required_indexes:
            if field_name not in existing_field_names:
                try:
                    qdrant_client.create_payload_index(
                        collection_name=qdrant_collection,
                        field_name=field_name,
                        field_schema=field_schema
                    )
                    print(f"✅ Created payload index for '{field_name}' ({field_schema})")
                except Exception as e:
                    print(f"❌ Failed to create payload index for '{field_name}': {e}")
            else:
                print(f"⏭️  Payload index for '{field_name}' already exists")
        
        print("\n🎉 Qdrant indexes fix completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    fix_qdrant_indexes() 