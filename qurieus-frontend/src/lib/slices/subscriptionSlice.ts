import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionPlan } from '@prisma/client';

interface SubscriptionState {
  subscriptionPlan: SubscriptionPlan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptionPlan: null,
  isLoading: false,
  error: null,
};

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscriptionPlan: (state, action: PayloadAction<SubscriptionPlan | null>) => {
      state.subscriptionPlan = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearSubscription: (state) => {
      state.subscriptionPlan = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { 
  setSubscriptionPlan, 
  setLoading, 
  setError, 
  clearSubscription 
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer; 