import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import LogRocket from 'logrocket';

// Import your slices here
import subscriptionReducer from './slices/subscriptionSlice';
import userReducer from './slices/userSlice';
import documentReducer from './slices/documentSlice';
import uiReducer from './slices/uiSlice';

// Create the store with LogRocket middleware
export const store = configureStore({
  reducer: {
    subscription: subscriptionReducer,
    user: userReducer,
    document: documentReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }).concat(
      // Add LogRocket middleware for action/state tracking
      LogRocket.reduxMiddleware()
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 