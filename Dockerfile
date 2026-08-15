# Cloud Run (free-tier friendly): one service, nginx routes /api/v1 to FastAPI
# and everything else (including /api and /socket.io) to Next.js.
# The container listens on $PORT (8080).
#
# NEXT_PUBLIC_* values are baked in at image build time. Set them as Cloud Build
# substitutions. Runtime secrets stay in Cloud Run Variables & Secrets.

FROM node:24-bookworm-slim AS frontend-deps
WORKDIR /app/qurieus-frontend

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY qurieus-frontend/package.json qurieus-frontend/yarn.lock ./
RUN yarn config set ignore-engines true \
  && (yarn install --frozen-lockfile --network-timeout 600000 || yarn install --network-timeout 600000)

FROM node:24-bookworm-slim AS frontend-build
WORKDIR /app/qurieus-frontend

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY --from=frontend-deps /app/qurieus-frontend /app/qurieus-frontend
COPY qurieus-frontend/ ./

# Dummy URL so `prisma generate` can run without Cloud Run secrets.
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/qurieus?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
ENV YARN_IGNORE_ENGINES=1

RUN yarn config set ignore-engines true

ARG NEXT_PUBLIC_APP_URL=https://qurieus.com
ARG NEXT_PUBLIC_SITE_URL=https://qurieus.com
ARG NEXT_PUBLIC_CONTACT_EMAIL=contact@qurieus.com
ARG NEXT_PUBLIC_SUPPORT_EMAIL=support@qurieus.com
ARG NEXT_PUBLIC_SALES_EMAIL=sales@qurieus.com
ARG NEXT_PUBLIC_SUPPORT_ADDRESS="Frontslash, New Delhi"
ARG NEXT_PUBLIC_SUPPORT_PHONE=+919953633888
ARG NEXT_PUBLIC_SENTRY_DSN=
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SYGMQN1JQY
ARG NEXT_PUBLIC_LOGROCKET_APP_ID=wdxmnh/qurieus
ARG NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
ARG NEXT_PUBLIC_MAX_FILE_SIZE=10
ARG NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
ARG NEXT_PUBLIC_MAX_FILES=5

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL \
    NEXT_PUBLIC_SALES_EMAIL=$NEXT_PUBLIC_SALES_EMAIL \
    NEXT_PUBLIC_SUPPORT_ADDRESS=$NEXT_PUBLIC_SUPPORT_ADDRESS \
    NEXT_PUBLIC_SUPPORT_PHONE=$NEXT_PUBLIC_SUPPORT_PHONE \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_LOGROCKET_APP_ID=$NEXT_PUBLIC_LOGROCKET_APP_ID \
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=$NEXT_PUBLIC_PADDLE_CLIENT_TOKEN \
    NEXT_PUBLIC_MAX_FILE_SIZE=$NEXT_PUBLIC_MAX_FILE_SIZE \
    NEXT_PUBLIC_MAX_FILE_SIZE_MB=$NEXT_PUBLIC_MAX_FILE_SIZE_MB \
    NEXT_PUBLIC_MAX_FILES=$NEXT_PUBLIC_MAX_FILES

RUN yarn prisma generate
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn build

FROM node:24-bookworm-slim AS backend-deps
WORKDIR /app/qurieus-backend

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       python3 python3-venv python3-pip python3-dev \
       build-essential libmupdf-dev \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/app/hf-cache \
    TRANSFORMERS_CACHE=/app/hf-cache

COPY qurieus-backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
  && pip install --no-cache-dir -r requirements.txt \
  && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-small-en-v1.5', device='cpu')"

FROM node:24-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       nginx openssl ca-certificates curl \
       python3 libgomp1 \
       tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
       chromium \
       fonts-liberation libnss3 libatk-bridge2.0-0 libgtk-3-0 libasound2 \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@1.22.22 --activate

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PATH="/opt/venv/bin:/usr/local/bin:$PATH" \
    HF_HOME=/app/hf-cache \
    TRANSFORMERS_CACHE=/app/hf-cache \
    TRANSFORMERS_OFFLINE=1 \
    HF_HUB_OFFLINE=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY --from=backend-deps /opt/venv /opt/venv
COPY --from=backend-deps /app/hf-cache /app/hf-cache
COPY qurieus-backend /app/qurieus-backend
RUN mkdir -p /app/qurieus-backend/uploaded_docs

COPY --from=frontend-build /app/qurieus-frontend/package.json /app/qurieus-frontend/yarn.lock /app/qurieus-frontend/
COPY --from=frontend-build /app/qurieus-frontend/node_modules /app/qurieus-frontend/node_modules
COPY --from=frontend-build /app/qurieus-frontend/.next /app/qurieus-frontend/.next
COPY --from=frontend-build /app/qurieus-frontend/public /app/qurieus-frontend/public
COPY --from=frontend-build /app/qurieus-frontend/prisma /app/qurieus-frontend/prisma
COPY --from=frontend-build /app/qurieus-frontend/prisma.config.ts /app/qurieus-frontend/prisma.config.ts
COPY --from=frontend-build /app/qurieus-frontend/next.config.js /app/qurieus-frontend/next.config.js
COPY --from=frontend-build /app/qurieus-frontend/server.js /app/qurieus-frontend/server.js
COPY --from=frontend-build /app/qurieus-frontend/src/templates /app/qurieus-frontend/src/templates

COPY deploy/cloudrun/nginx.conf.template /etc/nginx/nginx.conf.template
COPY deploy/cloudrun/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p /var/cache/nginx /var/log/nginx /tmp \
  && rm -f /etc/nginx/sites-enabled/default

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
