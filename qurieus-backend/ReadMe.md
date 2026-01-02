# Qurieus Backend

This is the backend service for Qurieus, a document querying and chat application.

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Ollama (for LLM integration)
- Homebrew (for macOS)

## Setup Steps

### 1. Database Setup

1. Install PostgreSQL if not already installed:

   ```bash
   brew install postgresql@14
   ```

2. Start PostgreSQL service:

   ```bash
   brew services start postgresql@14
   ```

3. Create the database:

   ```bash
   createdb qurieus
   ```

4. Install the pgvector extension:
   ```bash
   psql qurieus -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

### 2. Ollama Setup

1. Install Ollama using Homebrew:

   ```bash
   brew install ollama
   ```

2. Pull the required model (Mistral is recommended):

   ```bash
   ollama pull mistral
   ```

   Alternative models available:

   - `llama2`
   - `codellama`
   - `neural-chat`

3. Start the Ollama service:
   ```bash
   ollama serve
   ```

### 3. Backend Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```
   # FastAPI Configuration
   FAST_API_HOST=0.0.0.0
   FAST_API_PORT=8001
   FRONTEND_URL=http://localhost:8000
   NEXTAUTH_SECRET=your-secret-key

   # Ollama Configuration (optional - only if using local Ollama)
   OLLAMA_API_URL=http://localhost:11434
   OLLAMA_MODEL=mistral

   # Qdrant Configuration
   QDRANT_URL=http://localhost:6333
   QDRANT_COLLECTION=qurieus-documents
   QDRANT_API_KEY=your-qdrant-api-key  # Optional

   # AI Service Configuration
   AI_SERVICE_API_KEY=your-ai-service-api-key

   # OCR Configuration
   OCR_ENABLED=true
   OCR_LANGUAGE=eng
   OCR_DPI=300
   OCR_CONFIG=--oem 3 --psm 6
   ```

4. Run database migrations:

   ```bash
   alembic upgrade head
   ```

5. Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

   Or run directly:

   ```bash
   python main.py
   ```

## API Documentation

Once the server is running, you can access:

- API documentation: http://localhost:8001/docs
- Alternative documentation: http://localhost:8001/redoc

## Development

- The server runs on http://localhost:8001 by default
- API endpoints are prefixed with `/api/v1`
- Debug mode is enabled by default in development

## Modal Service Deployment

The backend uses Modal.com for GPU-accelerated LLM inference. The Modal service handles document querying with GPU support.

### Prerequisites for Modal Deployment

1. **Install Modal CLI:**

   ```bash
   pip install modal
   ```

2. **Authenticate with Modal:**

   ```bash
   modal token new
   ```

   Follow the prompts to authenticate with your Modal account.

3. **Set up Modal Secret:**
   Create a Modal secret named `QURIEUS_KEY` with the following environment variables:

   - `API_KEY`: API key for authenticating requests to Modal endpoints
   - `QDRANT_URL`: Qdrant vector database URL
   - `QDRANT_COLLECTION`: Qdrant collection name
   - `QDRANT_API_KEY`: Optional Qdrant API key

   You can create the secret via Modal dashboard or CLI:

   ```bash
   modal secret create QURIEUS_KEY API_KEY=your-api-key QDRANT_URL=your-qdrant-url QDRANT_COLLECTION=your-collection QDRANT_API_KEY=your-qdrant-key
   ```

### Deploy Modal Service

Deploy the Modal service using the following command:

```bash
modal deploy modal_service_persistent.py
```

This will:

- Build the custom Docker image with CUDA 12.1 support
- Install all required dependencies (sentence-transformers, llama-cpp-python, etc.)
- Deploy the FastAPI endpoints to Modal
- Create persistent volumes for model storage

### Modal Service Endpoints

After deployment, Modal will provide URLs for the following endpoints:

1. **Query Documents** (`query-documents`): POST endpoint for querying documents with GPU-accelerated LLM

   - Uses L40S GPU for inference
   - Supports streaming responses
   - Requires `x-api-key` header

2. **Health Check** (`health-check`): GET endpoint to check service health

   - Verifies CUDA availability
   - Checks model loading status
   - Requires `x-api-key` header

3. **Download Model** (`download-model`): POST endpoint to download the LLM model
   - Downloads Mistral-7B-Instruct GGUF model to persistent storage
   - Uses CPU (no GPU required)
   - Requires `x-api-key` header

### Modal Service Configuration

The Modal service (`modal_service_persistent.py`) is configured with:

- **GPU**: L40S for query endpoint, T4 for health check
- **Memory**: 4096 MB
- **Timeout**: 300 seconds (600 for model download)
- **Model**: Mistral-7B-Instruct-v0.2 (GGUF format, Q4_K_M quantization)
- **Embedding Model**: BAAI/bge-small-en-v1.5
- **Persistent Volume**: `qurieus-documents` for model storage

### Updating Modal Deployment

To update the Modal service after code changes:

1. Increment the app version in `modal_service_persistent.py`:

   ```python
   app = modal.App("qurieus-app-v59")  # Increment version number
   ```

2. Redeploy:
   ```bash
   modal deploy modal_service_persistent.py
   ```

### Modal Service URLs

After deployment, copy the Modal endpoint URLs and configure them in your frontend `.env`:

```
MODAL_QUERY_DOCUMENTS_URL=https://your-workspace--query-documents.modal.run
MODAL_DOT_COM_X_API_KEY=your-api-key
```

## Environment Variables

Key environment variables:

- `OLLAMA_API_URL`: Ollama API endpoint (default: http://localhost:11434)
- `OLLAMA_MODEL`: Ollama model to use (default: mistral, options: mistral, llama2, neural-chat, etc.)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js token verification
- `FRONTEND_URL`: Frontend application URL for CORS
- `FAST_API_HOST`: FastAPI server host (default: 0.0.0.0 for production, localhost for development)
- `FAST_API_PORT`: FastAPI server port (default: 8001)
- `QDRANT_URL`: Qdrant vector database URL
- `QDRANT_COLLECTION`: Qdrant collection name for storing document embeddings
- `QDRANT_API_KEY`: Optional Qdrant API key for authenticated access
- `AI_SERVICE_API_KEY`: API key for internal AI service communication (used by Modal service)
- `OCR_ENABLED`: Enable/disable OCR processing (true/false)
- `OCR_LANGUAGE`: OCR language code (default: eng)
- `OCR_DPI`: DPI for OCR page rendering (default: 300)
- `OCR_CONFIG`: Tesseract OCR configuration options

## Troubleshooting

1. If you get database connection errors:

   - Check if PostgreSQL is running
   - Verify the database exists
   - Confirm pgvector extension is installed

2. If Ollama queries fail:

   - Ensure Ollama service is running (`ollama serve`)
   - Verify the model is downloaded (`ollama list`)
   - Check Ollama API URL in settings

3. If Qdrant connection fails:

   - Verify Qdrant is running and accessible
   - Check `QDRANT_URL` and `QDRANT_API_KEY` in settings
   - Ensure the collection exists or can be created automatically

4. For authentication issues:

   - Ensure NEXTAUTH_SECRET matches between frontend and backend
   - Check token format in requests

5. If Modal service queries fail:

   - Verify Modal service is deployed (`modal deploy modal_service_persistent.py`)
   - Check Modal secret `QURIEUS_KEY` is configured correctly
   - Verify `MODAL_QUERY_DOCUMENTS_URL` and `MODAL_DOT_COM_X_API_KEY` are set in frontend
   - Check Modal service logs: `modal app logs qurieus-app-v58`

## License

This project is proprietary and confidential. All rights reserved.

Copyright (c) 2024 Qurieus

This software and its documentation are proprietary and confidential. No part of this software, including but not limited to the source code, documentation, and design, may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of Qurieus.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited. The receipt or possession of the source code and/or related information does not convey or imply any right to use, reproduce, disclose or distribute its contents, or to manufacture, use, or sell anything that it may describe.

## Deployment on AWS EC2 with Nginx and PM2

This section outlines how to deploy the Qurieus FastAPI backend on an AWS EC2 instance. It assumes you have completed the common "Backend Application Setup" steps (cloning, venv, installing dependencies, and creating the `.env` file) on your EC2 instance.

### Prerequisites for EC2:

- An AWS account.
- An EC2 instance (e.g., Ubuntu Server).
- Python 3.8+ (ideally matching your development version) and `python3-venv` installed.
- PostgreSQL and Ollama installed and running on the EC2 instance or accessible to it.
- Your domain name configured to point to your EC2 instance's IP address (if using a domain).
- Nginx installed on the EC2 instance.
- PM2 installed on the EC2 instance (`sudo npm install -g pm2`).

### Deployment Steps:

1. **SSH into your EC2 instance.**

2. **Ensure System Packages are Up-to-Date & Install Python (if needed):**

   ```bash
   sudo apt update
   sudo apt upgrade -y
   sudo apt install python3-pip python3-venv nginx -y # Example for Ubuntu
   ```

3. **Complete Backend Application Setup:**
   Follow steps 1-5 from the "Backend Application Setup (Common Steps)" section _on your EC2 instance_. This includes:

   - Cloning the repository.
   - Creating and activating the virtual environment (`.venv`).
   - Installing Python dependencies (`pip install -r requirements.txt`).
   - Creating and configuring your `.env` file for the EC2 environment.
     - **Crucially for `.env` on EC2:**
       - `FAST_API_HOST` should be set to `"0.0.0.0"` to allow Uvicorn to be accessed by Nginx.
       - `FAST_API_PORT` should be set (e.g., `"8001"`). This is the internal port Nginx will proxy to.
       - Configure `OLLAMA_API_URL`, `FRONTEND_URL` and any other production-specific settings.
   - Running database migrations (`alembic upgrade head`) against your production database.

4. **Test Uvicorn manually (optional but recommended):**
   From the `qurieus-backend` directory (with `.venv` activated):

   ```bash
   uvicorn main:app --host $(grep FAST_API_HOST .env | cut -d '=' -f2) --port $(grep FAST_API_PORT .env | cut -d '=' -f2)
   ```

   Or explicitly: `uvicorn main:app --host 0.0.0.0 --port 8001` (if FAST_API_PORT=8001).
   Access `http://your-ec2-ip:<FAST_API_PORT>/docs` in your browser. Press `Ctrl+C` to stop.

5. **Start the application with PM2:**
   PM2 will manage the Uvicorn process. Ensure you are in the `qurieus-backend` directory.
   The virtual environment (`.venv`) should **not** be active in your shell when running PM2 commands with an interpreter specified.
   Get the absolute path to your venv's Python:

   ```bash
   # Activate venv temporarily if needed to find path
   # source .venv/bin/activate
   # which python
   # Deactivate if you activated it
   # deactivate
   # Example path: /home/ubuntu/qurieus-backend/.venv/bin/python
   ```

   Then start with PM2 (replace with your actual FAST_API_PORT and Python path):

   ```bash
   pm2 start "uvicorn main:app --host 0.0.0.0 --port 8001" --name "qurieus-backend" --interpreter /home/ubuntu/qurieus-backend/.venv/bin/python
   ```

   - Check status: `pm2 list`
   - View logs: `pm2 logs qurieus-backend`
   - Save current PM2 process list to resurrect on reboot: `pm2 save`
   - Set PM2 to start on system boot: `pm2 startup` (follow the instructions it provides).

6. **Configure Nginx as a reverse proxy:**
   Create an Nginx site configuration file (e.g., `/etc/nginx/sites-available/qurieus`):

   ```nginx
   server {
       listen 80;
       server_name qurieus.com www.qurieus.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name qurieus.com www.qurieus.com;

       # SSL Configuration
       ssl_certificate /etc/letsencrypt/live/qurieus.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/qurieus.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;

       # API Proxy Settings
       location /api/v1/ {
           proxy_pass http://localhost:8001/api/v1/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # Increased timeouts for file uploads
           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }

       # Frontend Proxy
       location / {
           proxy_pass http://localhost:8000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # File Upload Settings
       client_max_body_size 60M;

       # Logging
       error_log /var/log/nginx/qurieus_error.log;
       access_log /var/log/nginx/qurieus_access.log;
   }
   ```

7. **Enable the Nginx site configuration:**

   ```bash
   sudo ln -sfn /etc/nginx/sites-available/qurieus /etc/nginx/sites-enabled/qurieus
   ```

   (If you have a default site enabled and it conflicts, remove its symlink: `sudo rm /etc/nginx/sites-enabled/default`)

8. **Set up SSL with Let's Encrypt:**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d qurieus.com -d www.qurieus.com
   ```

   Follow prompts. Certbot will automatically update your Nginx config for SSL.

9. **Test and restart Nginx:**

   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Configure Firewall:**
    Allow HTTP/HTTPS traffic:
    ```bash
    sudo ufw allow 'Nginx Full'
    sudo ufw enable
    ```

### Nginx Configuration Features

1. **SSL/TLS Security**

   - Automatic HTTP to HTTPS redirection
   - Modern SSL protocols (TLSv1.2 and TLSv1.3)
   - Secure certificate storage with Let's Encrypt

2. **API Proxy Settings**

   - Proxies `/api/v1/` requests to FastAPI backend
   - WebSocket support for real-time features
   - Increased timeouts for file uploads
   - Proper header forwarding for security

3. **Frontend Proxy**

   - Serves Next.js frontend
   - WebSocket support
   - Client-side routing handling

4. **File Upload Handling**

   - 60MB maximum file size
   - Optimized timeouts for large uploads
   - Secure multipart/form-data handling

5. **Performance Optimization**
   - Worker processes based on CPU cores
   - Static file caching
   - Gzip compression for text content

### Maintenance and Monitoring

1. **Log Management**

   - Error logs: `/var/log/nginx/qurieus_error.log`
   - Access logs: `/var/log/nginx/qurieus_access.log`
   - Regular log rotation

2. **SSL Certificate Management**

   - Automatic renewal via Certbot
   - Manual renewal check: `sudo certbot renew --dry-run`

3. **Troubleshooting**
   - Check Nginx status: `sudo systemctl status nginx`
   - Test configuration: `sudo nginx -t`
   - View error logs: `sudo tail -f /var/log/nginx/qurieus_error.log`

### Troubleshooting Backend Deployment:

- **502 Bad Gateway from Nginx:** Uvicorn/FastAPI app is not running or Nginx can't reach it.
  - Check PM2 status (`pm2 list`) and logs (`pm2 logs qurieus-backend`).
  - Ensure Uvicorn is listening on `0.0.0.0` and the correct port.
  - Verify `proxy_pass` in Nginx config matches Uvicorn's host and port.
- **Application errors:** Check PM2 logs for Python tracebacks.
- **Database connection issues:** Ensure `DATABASE_URL` is correct and the database is accessible from the EC2 instance.
- **Firewall:** Confirm the EC2 instance's security group and any local firewall (like UFW) allow traffic on port 80/443 (for Nginx) and the Uvicorn port (e.g., 8001) if testing directly.
