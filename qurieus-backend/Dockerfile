# Qurieus Backend (FastAPI)
FROM python:3.11-slim

WORKDIR /app

# Install system deps for PyMuPDF, pytesseract (optional for OCR)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies (skip modal for smaller image if not needed at runtime)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY generate_postman.py .
COPY app ./app

# Optional: create upload dir
RUN mkdir -p uploaded_docs

# Backend listens on 8001
ENV FAST_API_HOST=0.0.0.0
ENV FAST_API_PORT=8001
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
