# Use NVIDIA base image with CUDA support
FROM nvidia/cuda:12.2.0-base-ubuntu20.04

# Set working directory
WORKDIR /app

# --- Install basic dependencies only if not already installed ---
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    sudo \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# --- Set Python3 as default ---
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1

# --- Install Ollama only if not already installed ---
RUN if ! command -v ollama >/dev/null 2>&1; then \
    curl -fsSL https://ollama.com/install.sh | bash; \
fi

# --- Pull preferred Ollama models if not already pulled ---
RUN ollama list | grep -q mistral || ollama pull mistral
RUN ollama list | grep -q neural-chat || ollama pull neural-chat

# --- Copy and install Python dependencies ---
COPY requirements.txt ./
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

# --- Copy application code ---
COPY . .

# --- Expose required ports ---
EXPOSE 11434
EXPOSE 8000
EXPOSE 8001

# --- Run Ollama and FastAPI server ---
CMD ollama serve & uvicorn main:app --host 0.0.0.0 --port 8001
