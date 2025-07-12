# Logging System Setup Guide

This guide explains how to configure Sentry and LogRocket for the comprehensive logging system.

## 🔧 Configuration Files Created

### Sentry Configuration
- `sentry.client.config.js` - Browser-side error tracking
- `sentry.server.config.js` - Server-side error tracking  
- `sentry.edge.config.js` - Edge runtime error tracking

### LogRocket Configuration
- `src/lib/logrocket.ts` - LogRocket initialization and utilities

## 📋 Environment Variables Required

Add these to your `.env` file:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# LogRocket Configuration  
NEXT_PUBLIC_LOGROCKET_APP_ID=your-logrocket-app-id
```

## 🚀 Setup Instructions

### 1. Sentry Setup

1. **Create a Sentry Account**:
   - Go to [sentry.io](https://sentry.io)
   - Sign up and create a new organization
   - Create a new project (Next.js)

2. **Get Your DSN**:
   - In your Sentry project settings, find the DSN
   - Copy the DSN URL (starts with `https://`)

3. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
   ```

4. **Configure Sentry**:
   - The configuration files are already set up
   - Sentry will automatically capture errors and performance data
   - Session replay is enabled for error sessions

### 2. LogRocket Setup

1. **Create a LogRocket Account**:
   - Go to [logrocket.com](https://logrocket.com)
   - Sign up and create a new project
   - Select "Next.js" as your framework

2. **Get Your App ID**:
   - In your LogRocket project settings, find the App ID
   - Copy the App ID

3. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_LOGROCKET_APP_ID=your-actual-app-id
   ```

4. **Configure LogRocket**:
   - LogRocket will automatically initialize when the app loads
   - Session recordings will be captured
   - User identification can be set up in the logger

## 🔗 Sentry-LogRocket Integration

### **What This Integration Does**

When both Sentry and LogRocket are configured, **every Sentry error report will include a LogRocket session URL**. This creates a powerful debugging workflow:

1. **Sentry Error Report** → Click session URL → **LogRocket Session Replay**
2. **See the exact user session** that led to the error
3. **Replay the user's actions** step-by-step before the crash
4. **Understand the full context** of what happened

### **How It Works**

1. **LogRocket generates a session URL** for each user session
2. **Sentry captures this URL** in the `beforeSend` function
3. **Error reports include the session URL** in the `extra` data
4. **Click the URL** in Sentry to jump directly to the LogRocket session

### **Benefits**

- **Faster Debugging**: One click from error to session replay
- **Complete Context**: Error + State + Actions + Session replay
- **Better Error Resolution**: Understand root causes faster
- **User Journey Analysis**: See exactly what led to the error

## 🔍 Features Enabled

### Sentry Features
- ✅ Error tracking with stack traces
- ✅ Performance monitoring
- ✅ Session replay for error sessions
- ✅ Environment-based sampling
- ✅ Development mode filtering
- ✅ **LogRocket session URL integration**

### LogRocket Features
- ✅ Session recordings
- ✅ User identification
- ✅ Event tracking
- ✅ Error monitoring
- ✅ Network request monitoring
- ✅ **Redux action tracking**
- ✅ **State diff visualization**

## 📊 Usage Examples

### In API Routes
```typescript
import { logger } from "@/lib/logger";

// With user context
logger.info("API: Processing request", { apiKey, data }, { userId });

// Error logging
logger.error("API: Error occurred", { error: error.message }, { userId });
```

### In UI Components
```typescript
import { createUILogger } from "@/utils/loggingHelpers";
import { useUser } from "@/hooks/useUser";

const { userId } = useUser();
const uiLogger = createUILogger(userId);

uiLogger.info("User clicked button", { buttonId: "submit" });
```

### User Identification
```typescript
import { identifyUser } from "@/lib/logrocket";

// When user logs in
identifyUser(userId, {
  name: user.name,
  email: user.email
});
```

### Redux Actions (Automatically Tracked)
```typescript
import { useAppDispatch } from "@/lib/store";
import { setSubscriptionPlan } from "@/lib/slices/subscriptionSlice";

const dispatch = useAppDispatch();

// This action will be automatically logged in LogRocket
dispatch(setSubscriptionPlan(newPlan));
```

## 🔍 Debugging Workflow

### **With Sentry-LogRocket Integration**

1. **User reports a bug** → Check Sentry for error reports
2. **Find the error** → Look for the LogRocket session URL in the error details
3. **Click the session URL** → Jump directly to LogRocket session replay
4. **Replay the session** → See exactly what the user did before the error
5. **Analyze state changes** → Check Redux actions and state diffs
6. **Fix the issue** → Implement the fix based on complete context

### **Traditional Workflow (Without Integration)**

1. **User reports a bug** → Try to reproduce manually
2. **Guess what happened** → Based on limited information
3. **Implement fix** → Hope it addresses the root cause
4. **Test manually** → Limited testing scenarios

## 🛡️ Security Considerations

1. **DSN Security**: The Sentry DSN is safe to expose in client-side code
2. **LogRocket App ID**: The LogRocket App ID is also safe for client-side use
3. **Data Privacy**: Both services respect user privacy and GDPR compliance
4. **Environment Filtering**: Errors are filtered in development mode
5. **Session URLs**: Only accessible to your team members

## 🔧 Customization

### Sentry Customization
- Modify `sentry.client.config.js` for browser-specific settings
- Modify `sentry.server.config.js` for server-specific settings
- Adjust sampling rates in production
- Add custom context data in `beforeSend`

### LogRocket Customization
- Modify `src/lib/logrocket.ts` for custom initialization
- Add custom event tracking
- Configure user identification logic
- Set up Redux middleware for action tracking

## 📈 Monitoring

### Sentry Dashboard
- View error rates and trends
- Analyze performance metrics
- Review session replays
- Set up alerts
- **Click LogRocket session URLs** for complete context

### LogRocket Dashboard
- Watch session recordings
- Analyze user behavior
- Monitor errors and performance
- Track custom events
- **View Redux action timeline**
- **See state diffs for each action**

## 🚨 Troubleshooting

### Common Issues

1. **Sentry not capturing errors**:
   - Check DSN is correct
   - Verify environment variables are loaded
   - Check browser console for initialization errors

2. **LogRocket not recording sessions**:
   - Check App ID is correct
   - Verify initialization in browser console
   - Check for ad blockers

3. **Session URLs not appearing in Sentry**:
   - Ensure both services are configured
   - Check that LogRocket is initialized before Sentry
   - Verify the integration code is running

4. **Performance issues**:
   - Adjust sampling rates
   - Filter unnecessary data
   - Monitor bundle size impact

### Debug Mode
Both services have debug modes enabled in development:
- Sentry: `debug: true` in config
- LogRocket: Check browser console for initialization logs

## 📞 Support

- **Sentry**: [docs.sentry.io](https://docs.sentry.io)
- **LogRocket**: [docs.logrocket.com](https://docs.logrocket.com)
- **Project Issues**: Check the project repository

## 🎉 Benefits Summary

### **For Developers**
- **Faster Debugging**: Direct link from errors to session replay
- **Complete Context**: Full user journey with state changes
- **Better Understanding**: Visualize what led to errors
- **Performance Insights**: Identify bottlenecks and slow actions

### **For Users**
- **Better UX**: Faster bug fixes and issue resolution
- **Reliability**: Proactive issue detection and prevention
- **Performance**: Optimized state management and error handling

### **For Business**
- **Reduced Support**: Fewer user-reported issues and faster resolution
- **Data Insights**: Comprehensive user behavior and error analysis
- **Quality Assurance**: Complete testing and monitoring coverage
- **Cost Savings**: Faster development cycles and reduced debugging time 