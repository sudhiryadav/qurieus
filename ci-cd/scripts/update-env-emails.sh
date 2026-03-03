#!/bin/bash
# Email configuration reference for Qurieus deployment.
# Ensure these vars are set in your env files (prod.qurieus.frontend.env, etc.):
#
# SMTP_FROM_EMAIL=no-reply@qurieus.com     # Transactional emails (verification, password reset)
# ADMIN_EMAIL=hello@qurieus.com            # Admin notifications (subscriptions, alerts)
# NEXT_PUBLIC_CONTACT_EMAIL=contact@qurieus.com   # Contact form submissions
# NEXT_PUBLIC_SUPPORT_EMAIL=support@qurieus.com  # Footer, FAQ, terms, email templates
# NEXT_PUBLIC_SALES_EMAIL=sales@qurieus.com      # Sales/pricing inquiries (optional)
#
# Run: pm2 restart all  (after updating env files)

ENV_DIR="${ENV_DIR:-/home/ubuntu}"
echo "Email config reference. Check env files in $ENV_DIR for:"
echo "  SMTP_FROM_EMAIL, ADMIN_EMAIL, NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_SUPPORT_EMAIL"
