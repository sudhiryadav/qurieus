# Qurieus CI/CD – Google Cloud Run

Push to `prod` on GitHub (`sudhiryadav/qurieus`) → Cloud Build builds the root `Dockerfile` → deploys Cloud Run service `qurieus` in `us-central1`.

GitLab (`origin`) is no longer used for deploy. Push `prod` to GitHub so the trigger runs:

```bash
git push github prod
```

## Layout

One Cloud Run container (free-tier friendly):

- nginx on `$PORT` (8080)
- Next.js on `127.0.0.1:8000`
- FastAPI on `127.0.0.1:8001`
- `/api/v1/` → FastAPI, everything else (including `/api` and `/socket.io`) → Next.js

## One-time GCP setup

Project: `roommate-matcher-473708` (same as myflatmate). Region: `us-central1`.

1. Connect the GitHub repo `sudhiryadav/qurieus` to Cloud Build (same GitHub App as roommate-matcher).
2. Create a trigger on branch `^prod$` using `cloudbuild.yaml`.
3. Copy runtime secrets:

```bash
cp deploy/cloudrun/env.yaml.example deploy/cloudrun/env.yaml
# fill DATABASE_URL and other secrets
gcloud run services update qurieus --region=us-central1 --env-vars-file=deploy/cloudrun/env.yaml
```

## Database (Neon)

Production Postgres is Neon project `qurieus`, database `qurieus`. Prisma migrations run on container startup (`prisma migrate deploy`).

## Env files

- **Build-time (NEXT_PUBLIC_*)**: Cloud Build substitutions in `cloudbuild.yaml`
- **Runtime secrets**: `deploy/cloudrun/env.yaml` (gitignored). See `env.yaml.example`.

Do not set `PORT`. Cloud Run injects `8080`. Redis is optional (omit `REDIS_URL` on Cloud Run).

## Custom domain

Production URL is `https://qurieus.com`. Cloud Run maps `qurieus.com` and `www.qurieus.com`. Hostinger DNS for the apex uses Google Cloud Run A/AAAA records; `www` is a CNAME to `qurieus.com`. Mail (MX, SPF, DKIM, DMARC) is unchanged.

OAuth callback is `https://qurieus.com/api/auth/callback/google` (not the `*.run.app` URL).

