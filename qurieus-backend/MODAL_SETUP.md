# Modal.com GPU Service Setup Guide

This guide explains how to set up and deploy the Modal.com GPU service for enhanced document processing and embedding generation.

## What is Modal.com?

Modal.com is a cloud platform that provides on-demand GPU instances for AI/ML workloads. It's cost-effective for GPU-intensive tasks like:
- Document processing with OCR
- Embedding generation
- Large language model inference
- Financial data analysis

## Prerequisites

1. **Modal.com Account**: Sign up at [modal.com](https://modal.com)
2. **Modal CLI**: Install the Modal CLI
   ```bash
   pip install modal
   ```
3. **Authentication**: Login to Modal
   ```bash
   modal token new
   ```

## Deployment Steps

### 1. Deploy the GPU Service

Navigate to the Backend directory and deploy the Modal service:

```bash
cd Backend
modal deploy modal_service_persistent.py
```

This will create a Modal app with multiple endpoints, each with its own URL, such as:
- `/upload-document`
- `/query-documents`
- `/user-documents/{user_id}`
- `/delete-document/{user_id}/{document_id}`
- `/delete-all-documents/{user_id}`
- `/health`

### 2. Get the Service URLs

After deployment, Modal will provide a unique URL for each endpoint, for example:
```
https://your-username--upload-document.modal.run
https://your-username--query-documents.modal.run
https://your-username--documents.modal.run
https://your-username--delete-document.modal.run
https://your-username--delete-all-documents.modal.run
https://your-username--health-check.modal.run
```

### 3. Configure Environment Variables

Add these environment variables to your frontend and backend:

```bash
# Modal.com Configuration (use the actual URLs from your deployment)
MODAL_UPLOAD_DOCUMENT_URL=https://your-username--upload-document.modal.run
MODAL_QUERY_DOCUMENTS_URL=https://your-username--query-documents.modal.run
MODAL_GET_USER_DOCUMENTS_URL=https://your-username--documents.modal.run
MODAL_DELETE_DOCUMENT_URL=https://your-username--delete-document.modal.run
MODAL_DELETE_ALL_DOCUMENTS_URL=https://your-username--delete-all-documents.modal.run
MODAL_HEALTH_CHECK_URL=https://your-username--health-check.modal.run
USE_MODAL_PERSISTENT_STORAGE=true
```

> **Note:** There is no longer a single `MODAL_API_URL`. Each endpoint has its own URL and should be used directly in your code.

### 4. Update Backend and Frontend Configuration

Update your backend and frontend to use the new environment variables for each operation. For example:

```typescript
// Query documents
const response = await fetch(process.env.MODAL_QUERY_DOCUMENTS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, user_id })
});

// Upload document
const response = await fetch(process.env.MODAL_UPLOAD_DOCUMENT_URL, {
  method: 'POST',
  body: formData
});

// Delete a document
const response = await fetch(process.env.MODAL_DELETE_DOCUMENT_URL, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id, document_id })
});
```

## Cost Optimization

### GPU Selection
- **T4**: ~$0.35/hour - Good for most tasks
- **A10G**: ~$1.20/hour - Better performance
- **A100**: ~$2.50/hour - Best performance

### Usage Patterns
- **On-demand**: Pay only when processing
- **Cold start**: ~10-30 seconds for first request
- **Warm instances**: Faster subsequent requests

## Integration with Frontend

Update your frontend to use the new Modal endpoint environment variables directly. Do not append paths to the URLs; use them as provided by Modal.

## Monitoring and Logs

### View Modal Logs
```bash
modal logs qurieus-gpu-service
```

### Monitor Usage
```bash
modal app list
modal app logs qurieus-gpu-service
```

## Troubleshooting

### Common Issues

1. **Cold Start Delays**
   - First request may take 10-30 seconds
   - Subsequent requests are faster
   - Consider keeping warm instances for production

2. **GPU Memory Issues**
   - Increase memory allocation in `modal_service_persistent.py`
   - Use smaller models for embeddings

3. **Timeout Issues**
   - Increase timeout values for large documents
   - Process documents in smaller chunks

4. **Authentication Errors**
   - Ensure Modal token is valid
   - Check API key configuration

### Performance Tips

1. **Batch Processing**
   - Process multiple documents together
   - Use batch embedding generation

2. **Model Selection**
   - Use `all-MiniLM-L6-v2` for fast embeddings
   - Use larger models only when needed

3. **Caching**
   - Cache embeddings locally
   - Use Modal's built-in caching

## Security Considerations

1. **API Keys**: Store Modal API keys securely
2. **File Uploads**: Validate file types and sizes
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Authentication**: Ensure proper user authentication

## Cost Estimation

### Typical Usage (Monthly)
- **100 documents/day**: ~$50-100/month
- **1000 documents/day**: ~$200-500/month
- **10000 documents/day**: ~$1000-2000/month

### Cost Breakdown
- **T4 GPU**: $0.35/hour
- **Processing time**: 1-5 minutes per document
- **Storage**: Included in Modal pricing

## Advanced Configuration

### Custom Models
You can modify `modal_service_persistent.py` to use different models:

```python
# For embeddings
embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cuda")

# For LLM responses
# Integrate with OpenAI, Anthropic, or other providers
```

### Scaling
Modal automatically scales based on demand. For high-traffic applications:

1. **Pre-warm instances**: Keep instances warm
2. **Load balancing**: Use multiple Modal apps
3. **Caching**: Cache frequently accessed data

## Migration from Local Processing

### Step-by-Step Migration

1. **Deploy Modal service**
2. **Test with small documents**
3. **Update environment variables**
4. **Switch traffic gradually**
5. **Monitor performance and costs**
6. **Optimize based on usage patterns**

### Rollback Plan
If issues arise, you can quickly switch back to local processing by setting:
```bash
USE_MODAL_PERSISTENT_STORAGE=false
```

## Support

- **Modal Documentation**: [docs.modal.com](https://docs.modal.com)
- **Community**: [Modal Discord](https://discord.gg/modal)
- **Pricing**: [modal.com/pricing](https://modal.com/pricing)

## Example Usage

### Processing a Document
```python
import requests
import base64

# Read file
with open("document.pdf", "rb") as f:
    content = f.read()

# Encode to base64
content_b64 = base64.b64encode(content).decode('utf-8')

# Send to Modal service
response = requests.post(
    "https://your-username--upload-document.modal.run",
    json={
        "file_content": content_b64,
        "file_extension": ".pdf",
        "original_filename": "document.pdf",
        "user_id": "user_id_here"
    }
)

result = response.json()
print(f"Extracted text: {result.get('text_content', '')[:200]}...")
```

### Querying Documents
```python
response = requests.post(
    "https://your-username--query-documents.modal.run",
    json={
        "query": "What is the revenue?",
        "user_id": "user_id_here"
    }
)

result = response.json()
print(f"Query result: {result.get('response', '')}")
``` 