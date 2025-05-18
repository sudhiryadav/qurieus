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
- API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## Development

- The server runs on http://localhost:8000 by default
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