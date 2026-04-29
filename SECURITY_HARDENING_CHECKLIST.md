# Security Hardening Checklist

## Application Controls
- [ ] Keep `next`, `next-auth`, `prisma`, and FastAPI dependencies patched weekly.
- [ ] Enforce secure headers (HSTS, no-sniff, frame deny, strict referrer policy).
- [ ] Keep CORS allow-lists explicit; never use `*` for authenticated endpoints.
- [ ] Apply endpoint rate limits on auth, upload, contact, and public API routes.
- [ ] Enforce upload controls: allow-list file extensions, max file size, max files/request.
- [ ] Avoid exposing stack traces or token internals in API error responses.
- [ ] Disable API docs/openapi in production for internal services.

## Secrets and Identity
- [ ] Store all secrets only in environment/secret manager, never in code/scripts.
- [ ] Rotate `NEXTAUTH_SECRET`, DB credentials, API keys after any security incident.
- [ ] Use constant-time secret comparison (`hmac.compare_digest`).
- [ ] Set short token lifetimes where feasible and invalidate sessions after rotation.

## Infrastructure Controls
- [ ] Run services as non-root, least-privileged users.
- [ ] Deny unnecessary outbound traffic from app containers/hosts.
- [ ] Restrict backend ingress to known frontends/services only.
- [ ] Place WAF/CDN in front of internet-facing endpoints.
- [ ] Enable centralized logs, anomaly alerts, and retention for incident response.

## Monitoring and Detection
- [ ] Alert on sustained 401/403/429 spikes.
- [ ] Alert on unusual multipart upload volume and large payload bursts.
- [ ] Alert on abnormal process execution / shell-like behavior on hosts.
- [ ] Track dependency vulnerabilities in CI and block critical findings.

## SDLC and Operations
- [ ] Add mandatory security review for auth, upload, and API changes.
- [ ] Run periodic DAST on staging and SAST in CI for each PR.
- [ ] Maintain tested backup + restore playbooks.
- [ ] Maintain incident response runbook and tabletop exercise at least quarterly.
