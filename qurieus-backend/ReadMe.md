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
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qurieus
   OLLAMA_API_URL=http://localhost:11434
   NEXTAUTH_SECRET=your-secret-key
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

Once the server is running, you can access:
- API documentation: http://localhost:8001/docs
- Alternative documentation: http://localhost:8001/redoc

## Development

- The server runs on http://localhost:8001 by default
- API endpoints are prefixed with `/api/v1`
- Debug mode is enabled by default in development

## Environment Variables

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OLLAMA_API_URL`: Ollama API endpoint (default: http://localhost:11434)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js token verification
- `FRONTEND_URL`: Frontend application URL for CORS

## Troubleshooting

1. If you get database connection errors:
   - Check if PostgreSQL is running
   - Verify the database exists
   - Confirm pgvector extension is installed

2. If Ollama queries fail:
   - Ensure Ollama service is running (`ollama serve`)
   - Verify the model is downloaded (`ollama list`)
   - Check Ollama API URL in settings

3. For authentication issues:
   - Ensure NEXTAUTH_SECRET matches between frontend and backend
   - Check token format in requests

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

1.  **SSH into your EC2 instance.**

2.  **Ensure System Packages are Up-to-Date & Install Python (if needed):**
    ```bash
    sudo apt update
    sudo apt upgrade -y
    sudo apt install python3-pip python3-venv nginx -y # Example for Ubuntu
    ```

3.  **Complete Backend Application Setup:**
    Follow steps 1-5 from the "Backend Application Setup (Common Steps)" section *on your EC2 instance*. This includes:
    - Cloning the repository.
    - Creating and activating the virtual environment (`.venv`).
    - Installing Python dependencies (`pip install -r requirements.txt`).
    - Creating and configuring your `.env` file for the EC2 environment.
        - **Crucially for `.env` on EC2:**
            - `DATABASE_URL` must point to your production database.
            - `API_HOST` should be set to `"0.0.0.0"` to allow Uvicorn to be accessed by Nginx.
            - `API_PORT` should be set (e.g., `"8001"`). This is the internal port Nginx will proxy to.
            - `SECRET_KEY` must be a strong, unique secret.
            - Configure `OLLAMA_API_URL`, `FRONTEND_URL` and any other production-specific settings.
    - Running database migrations (`alembic upgrade head`) against your production database.

4.  **Test Uvicorn manually (optional but recommended):**
    From the `qurieus-backend` directory (with `.venv` activated):
    ```bash
    uvicorn main:app --host $(grep API_HOST .env | cut -d '=' -f2) --port $(grep API_PORT .env | cut -d '=' -f2)
    ```
    Or explicitly: `uvicorn main:app --host 0.0.0.0 --port 8001` (if API_PORT=8001).
    Access `http://your-ec2-ip:<API_PORT>/docs` in your browser. Press `Ctrl+C` to stop.

5.  **Start the application with PM2:**
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
    Then start with PM2 (replace with your actual API_PORT and Python path):
    ```bash
    pm2 start "uvicorn main:app --host 0.0.0.0 --port 8001" --name "qurieus-backend" --interpreter /home/ubuntu/qurieus-backend/.venv/bin/python
    ```
    - Check status: `pm2 list`
    - View logs: `pm2 logs qurieus-backend`
    - Save current PM2 process list to resurrect on reboot: `pm2 save`
    - Set PM2 to start on system boot: `pm2 startup` (follow the instructions it provides).

6.  **Configure Nginx as a reverse proxy:**
    Create an Nginx site configuration file (e.g., `/etc/nginx/sites-available/qurieus`):
    ```nginx
    server {
        listen 80;
        # For SSL (after certbot), it might look like:
        # listen 443 ssl; 
        # listen [::]:443 ssl;
        # ssl_certificate /etc/letsencrypt/live/api.your_domain.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/api.your_domain.com/privkey.pem;
        # include /etc/letsencrypt/options-ssl-nginx.conf;
        # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        server_name api.your_domain.com; # Or your EC2 IP if not using a domain

        location / {
            proxy_pass http://127.0.0.1:8001; # Must match API_PORT from .env
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $server_name; # Important for FastAPI to build correct URLs
            proxy_read_timeout 300s; # Optional: Increase timeout for long-running requests
            proxy_connect_timeout 75s; # Optional
        }

        # Optional: Add rate limiting, client_max_body_size, logging, etc.
         client_max_body_size 60M; # If handling large file uploads
    }
    ```
    - Update `server_name` to your backend's domain or IP.
    - Ensure `proxy_pass` points to `127.0.0.1` and the `API_PORT` your Uvicorn application is listening on.

7.  **Enable the Nginx site configuration:**
    ```bash
    sudo ln -sfn /etc/nginx/sites-available/qurieus /etc/nginx/sites-enabled/qurieus
    ```
    (If you have a default site enabled and it conflicts, remove its symlink: `sudo rm /etc/nginx/sites-enabled/default`)

8.  **Test Nginx configuration:**
    ```bash
    sudo nginx -t
    ```

9.  **Restart Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

10. **Configure Firewall (if applicable):**
    Allow HTTP/HTTPS traffic (example for UFW):
    ```bash
    sudo ufw allow 'Nginx Full' 
    # Or more specifically:
    # sudo ufw allow 80/tcp
    # sudo ufw allow 443/tcp
    # sudo ufw enable # If not already enabled
    ```

11. **Set up SSL with Let's Encrypt (Recommended if using a domain):**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d api.your_domain.com # Add other domains with -d if needed
    ```
    Follow prompts. Certbot will attempt to update your Nginx config for SSL. Review the changes.

Your Qurieus FastAPI backend should now be accessible, proxied by Nginx.

### Troubleshooting Backend Deployment:
-   **502 Bad Gateway from Nginx:** Uvicorn/FastAPI app is not running or Nginx can't reach it.
    -   Check PM2 status (`pm2 list`) and logs (`pm2 logs qurieus-backend`).
    -   Ensure Uvicorn is listening on `0.0.0.0` and the correct port.
    -   Verify `proxy_pass` in Nginx config matches Uvicorn's host and port.
-   **Application errors:** Check PM2 logs for Python tracebacks.
-   **Database connection issues:** Ensure `DATABASE_URL` is correct and the database is accessible from the EC2 instance.
-   **Firewall:** Confirm the EC2 instance's security group and any local firewall (like UFW) allow traffic on port 80/443 (for Nginx) and the Uvicorn port (e.g., 8001) if testing directly.
