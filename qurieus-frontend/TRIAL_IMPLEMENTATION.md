# Free Trial Implementation

This document describes the custom Free Trial implementation for Qurieus that handles trials without requiring Paddle integration.

## Overview

The Free Trial system is implemented entirely in the frontend and provides:
- Card-free trial activation
- Automatic trial expiration
- Email notifications
- In-app trial expiration warnings
- Usage limits based on subscription plan configuration

## Key Components

### 1. Trial API (`/api/user/trial`)
- **POST**: Creates a new trial subscription
- **GET**: Checks trial status and handles expiration
- Sends welcome email using Resend
- Uses existing `SubscriptionPlan` configuration

### 2. Trial Management Service (`lib/trialManagement.ts`)
- `checkTrialExpiration()`: Expires trials and sends notification emails
- `sendTrialExpiringWarnings()`: Sends warning emails at 1, 3, and 7 days before expiration

### 3. Trial Expiration Banner (`components/TrialExpirationBanner.tsx`)
- Shows in-app warnings when trial is expiring
- Different styles for critical (1 day), warning (3 days), and info (7 days)
- Integrated into user layout

### 4. Updated Pricing Component
- Free Trial plans show "Free for X days" instead of "₹0/month"
- "Start Free Trial" button for trial plans
- Handles trial creation without Paddle

### 5. Admin Interface Updates
- Free Trial plans show special messaging
- No Paddle sync for trial plans
- Displays trial configuration details

## Configuration

### Environment Variables Required
```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Subscription Plan Configuration
The Free Trial plan in the database should have:
- `name`: "Free Trial"
- `description`: "7 days" (or desired duration)
- `price`: 0
- `maxDocs`: 5 (or desired limit)
- `maxStorageMB`: 10 (or desired limit)
- `maxQueriesPerDay`: 25 (or desired limit)

## Email Templates

The system sends three types of emails:
1. **Trial Started**: Welcome email with trial details
2. **Trial Expiring**: Warning emails at 1, 3, and 7 days before expiration
3. **Trial Expired**: Notification when trial has expired

All emails are sent using Resend and include:
- Trial duration and limits
- Upgrade options
- Call-to-action buttons

## Cron Jobs

The system includes automated tasks:
- **Every hour**: Check trial expiration and send warnings
- **Every 5 minutes**: Paddle sync (existing functionality)

## Usage Flow

1. **User clicks "Start Free Trial"**
   - Creates trial subscription in database
   - Sends welcome email
   - User gets immediate access

2. **During trial**
   - User sees trial expiration banner if expiring soon
   - Usage limits are enforced based on plan configuration

3. **Trial expiration**
   - System automatically expires trial
   - Sends expiration email
   - User must upgrade to continue

## Benefits

✅ **No card required** - Users can start trials immediately  
✅ **Better conversion** - No payment friction for trials  
✅ **Full control** - Customizable duration and limits  
✅ **Automatic management** - Expiration and notifications handled automatically  
✅ **Clean Paddle dashboard** - No confusing "free" products  
✅ **Flexible conversion** - Users upgrade when ready  

## Setup Instructions

1. **Install dependencies**:
   ```bash
   yarn add resend
   ```

2. **Set environment variables**:
   ```env
   RESEND_API_KEY=your_resend_api_key
   ```

3. **Update Free Trial plan** in database:
   - Ensure plan name is "Free Trial"
   - Set desired duration in description
   - Configure usage limits

4. **Run cleanup script** (optional):
   ```bash
   node scripts/cleanup-free-trial-paddle.js
   ```

5. **Test the implementation**:
   - Create a new user account
   - Start a free trial
   - Verify email notifications
   - Test expiration flow

## Monitoring

The system logs trial-related activities:
- `[TRIAL]` prefixed logs for trial management
- `[CRON]` prefixed logs for automated tasks
- Email sending success/failure logs

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check RESEND_API_KEY is set correctly
   - Verify Resend account is active
   - Check email templates for syntax errors

2. **Trials not expiring**
   - Verify cron jobs are running
   - Check database connection
   - Review trial management logs

3. **Banner not showing**
   - Check subscription data structure
   - Verify trial end date calculation
   - Review component props

### Debug Commands

```bash
# Check trial status
curl -X GET /api/user/trial

# Manually trigger trial management
node -e "require('./lib/trialManagement').checkTrialExpiration()"
``` 