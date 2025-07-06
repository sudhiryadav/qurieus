FROM nvidia/cuda:11.8.0-devel-ubuntu22.04

# ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64:/usr/lib/x86_64-linux-gnu

# # Install dependencies (without trying to install libcuda1)
# RUN apt-get update && apt-get install -y \
#     python3 python3-pip python3-dev python3-venv \
#     git curl cmake build-essential wget ninja-build \
#     && ln -s /usr/bin/python3 /usr/bin/python \
#     && ln -s /usr/local/cuda/lib64/stubs/libcuda.so /usr/lib/x86_64-linux-gnu/libcuda.so.1 \
#     && ln -s /usr/local/cuda/lib64/stubs/libcuda.so /usr/lib/x86_64-linux-gnu/libcuda.so

# # Upgrade pip + install core libraries with compatible versions
# RUN python -m pip install --upgrade pip && \
#     pip install \
#     "numpy<2.0" && \
#     pip install \
#     torch==2.1.0+cu118 \
#     --extra-index-url https://download.pytorch.org/whl/cu118 && \
#     pip install \
#     sentence-transformers \
#     PyMuPDF \
#     python-docx \
#     pandas \
#     fastapi \
#     uvicorn \
#     langdetect \
#     openpyxl \
#     tabulate \
#     xlrd && \
#     pip install "numpy<2.0"


ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git \
    python3-pip \
    python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip + install core libraries with compatible versions
RUN python -m pip install --upgrade pip && \
    pip install \
    torch==2.1.0+cu118 \
    --extra-index-url https://download.pytorch.org/whl/cu118 && \
    pip install \
    sentence-transformers \
    PyMuPDF \
    python-docx \
    pandas \
    fastapi \
    uvicorn \
    langdetect \
    openpyxl \
    tabulate \
    xlrd

RUN HF_TOKEN=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 CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --no-cache-dir --upgrade --force-reinstall \
    https://huggingface.co/abetlen/llama-cpp-python-cuBLAS-wheels/resolve/main/llama_cpp_python-0.3.10+cu118-cp310-cp310-linux_x86_64.whl \
    --extra-index-url https://huggingface.co/api/packages/abetlen/pypi/simple \
    --trusted-host huggingface.co

# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/*


# cd Backend/qurieus-cuda-docker

# # Clear all Docker cache completely
# docker system prune -a --volumes
# docker buildx prune -a
# docker builder prune -a

# # Build with new tag and no cache
# docker buildx build --platform linux/amd64 --no-cache -t ersudhiryadav/qurieus-cuda:v20 . --load

# # Test the image locally to verify CUDA support
# docker run --rm ersudhiryadav/qurieus-cuda:v20 python -c "import llama_cpp; print('llama-cpp-python version:', llama_cpp.__version__); import llama_cpp.llama_cpp as lib; has_cuda = hasattr(lib, 'llama_backend_offload'); print('CUDA support available:', has_cuda)"

# # Push to Docker Hub
# docker push ersudhiryadav/qurieus-cuda:v20

# # Deploy Modal service
# cd Backend
# modal deploy modal_service_persistent.py --verbose

# # Test CUDA function
# modal run modal_service_persistent.py::test_cuda

# # Test query endpoint
# curl -X POST "https://er-sudhir-yadav--query-documents.modal.run" \
#   -H "Content-Type: application/json" \
#   -H 'x-api-key: UjE6@#Nq&WpA9v$!b2^z8%xY_t4cR7qL&JdF5gH0mK3' \
#   -d '{
#     "query": "what is constitution of india?",
#     "user_id": "cmchxfnew000mtqioqa427pqm"
#   }'
    