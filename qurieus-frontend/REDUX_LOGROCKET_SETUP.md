# Redux + LogRocket Integration Setup

This document explains the Redux and LogRocket integration that provides comprehensive state tracking and debugging capabilities.

## 🎯 **What We've Implemented**

### **Redux Store with LogRocket Middleware**
- **Automatic Action Logging**: Every Redux action is captured in LogRocket
- **State Diff Tracking**: Shows what changed in your state after each action
- **Time Travel Debugging**: Replay actions step-by-step in LogRocket
- **Performance Monitoring**: Track action processing times
- **Bandwidth Optimization**: Only logs differences to minimize data usage

## 📁 **File Structure**

```
src/lib/
├── store.ts                 # Redux store with LogRocket middleware
├── providers.tsx            # Redux Provider component
├── slices/
│   ├── subscriptionSlice.ts # Subscription state management
│   ├── userSlice.ts        # User authentication state
│   ├── documentSlice.ts    # Document management state
│   └── uiSlice.ts          # UI state (sidebar, theme, modals)
└── logrocket.ts            # LogRocket initialization

src/hooks/
├── useSubscription.ts       # Hook for subscription state
├── useSidebar.ts           # Hook for sidebar state
└── useUser.ts              # Hook for user state
```

## 🔧 **Key Features**

### **1. Redux Slices**

#### **Subscription Slice**
```typescript
// Track subscription plans, loading states, errors
const { subscriptionPlan, isLoading, error } = useSubscription();
```

#### **User Slice**
```typescript
// Track user authentication, profile data
const { user, isAuthenticated } = useUser();
```

#### **Document Slice**
```typescript
// Track document uploads, progress, status
const { documents, uploadProgress } = useDocuments();
```

#### **UI Slice**
```typescript
// Track sidebar, theme, notifications, modals
const { sidebarOpen, theme, notifications } = useUI();
```

### **2. LogRocket Integration**

#### **Automatic Tracking**
- All Redux actions are automatically logged
- State changes are tracked with diffs
- User sessions include complete action history
- Performance metrics for each action

#### **Manual Tracking**
```typescript
import { identifyUser, trackEvent } from '@/lib/logrocket';

// Identify user when they log in
identifyUser(userId, { name: user.name, email: user.email });

// Track custom events
trackEvent('subscription_created', { plan: 'pro', amount: 29.99 });
```

## 🚀 **Usage Examples**

### **Replacing Context with Redux**

#### **Before (Context)**:
```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

const { subscriptionPlan, setSubscriptionPlan } = useSubscription();
```

#### **After (Redux)**:
```typescript
import { useSubscription } from '@/hooks/useSubscription';

const { subscriptionPlan, updateSubscriptionPlan } = useSubscription();
```

### **Tracking User Actions**

```typescript
import { useAppDispatch } from '@/lib/store';
import { setSubscriptionPlan } from '@/lib/slices/subscriptionSlice';

const dispatch = useAppDispatch();

// This action will be automatically logged in LogRocket
dispatch(setSubscriptionPlan(newPlan));
```

### **Document Upload Tracking**

```typescript
import { addDocument, setUploadProgress } from '@/lib/slices/documentSlice';

// Track document upload start
dispatch(addDocument({ id: 'doc1', name: 'report.pdf', status: 'uploading' }));

// Track upload progress
dispatch(setUploadProgress({ id: 'doc1', progress: 50 }));

// Track upload completion
dispatch(updateDocumentStatus({ id: 'doc1', status: 'uploaded' }));
```

## 📊 **LogRocket Dashboard Features**

### **Action Timeline**
- See every Redux action in chronological order
- View action payloads and metadata
- Track action processing times

### **State Changes**
- Visual diff of state before/after each action
- Identify which actions caused specific state changes
- Debug unexpected state mutations

### **Performance Analysis**
- Identify slow actions
- Track memory usage patterns
- Monitor re-render frequency

### **User Journey**
- Complete user session replay
- Action-by-action playback
- Error context and state at time of error

## 🔍 **Debugging Workflow**

### **1. Identify the Issue**
- User reports a bug
- Find their session in LogRocket
- Replay their actions step-by-step

### **2. Analyze State Changes**
- See exactly what changed in Redux state
- Identify which action caused the issue
- Understand the data flow

### **3. Fix and Verify**
- Implement the fix
- Test with similar user actions
- Verify state changes are correct

## 🛠 **Development Tools**

### **Redux DevTools**
- Available in development mode
- Time travel debugging
- Action replay
- State inspection

### **LogRocket Console**
- Real-time action logging
- State diff visualization
- Performance metrics
- Error tracking

## 📈 **Benefits**

### **For Developers**
- **Faster Debugging**: See exactly what happened
- **Better Understanding**: Visualize state changes
- **Performance Insights**: Identify bottlenecks
- **Error Context**: Full state at time of error

### **For Users**
- **Better UX**: Faster bug fixes
- **Reliability**: Proactive issue detection
- **Performance**: Optimized state management

### **For Business**
- **Reduced Support**: Fewer user-reported issues
- **Data Insights**: User behavior analysis
- **Quality Assurance**: Comprehensive testing coverage

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required for LogRocket
NEXT_PUBLIC_LOGROCKET_APP_ID=your-app-id

# Optional: Sentry integration
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### **Store Configuration**
```typescript
// src/lib/store.ts
export const store = configureStore({
  reducer: {
    subscription: subscriptionReducer,
    user: userReducer,
    document: documentReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(LogRocket.reduxMiddleware()),
  devTools: process.env.NODE_ENV !== 'production',
});
```

## 🚨 **Best Practices**

### **1. Action Naming**
- Use descriptive action names
- Include relevant metadata
- Keep payloads serializable

### **2. State Structure**
- Normalize complex data
- Avoid deeply nested state
- Use selectors for derived data

### **3. Performance**
- Use Redux Toolkit for immutability
- Implement proper memoization
- Monitor action frequency

### **4. Security**
- Don't log sensitive data
- Sanitize user inputs
- Use environment-based filtering

## 📞 **Support**

- **Redux Toolkit**: [redux-toolkit.js.org](https://redux-toolkit.js.org)
- **LogRocket**: [docs.logrocket.com](https://docs.logrocket.com)
- **React Redux**: [react-redux.js.org](https://react-redux.js.org)

## 🎉 **Next Steps**

1. **Migrate Components**: Replace context usage with Redux hooks
2. **Add Selectors**: Create memoized selectors for performance
3. **Implement Persistence**: Add Redux Persist for state persistence
4. **Add Middleware**: Implement custom middleware for specific needs
5. **Monitor Performance**: Set up alerts for slow actions 