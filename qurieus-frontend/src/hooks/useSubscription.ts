import { useAppSelector, useAppDispatch } from '@/lib/store';
import { setSubscriptionPlan, setLoading, setError, clearSubscription } from '@/lib/slices/subscriptionSlice';
import { SubscriptionPlan } from '@prisma/client';

export const useSubscription = () => {
  const dispatch = useAppDispatch();
  const { subscriptionPlan, isLoading, error } = useAppSelector(state => state.subscription);

  const updateSubscriptionPlan = (plan: SubscriptionPlan | null) => {
    dispatch(setSubscriptionPlan(plan));
  };

  const setSubscriptionLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  const setSubscriptionError = (error: string | null) => {
    dispatch(setError(error));
  };

  const clearSubscriptionData = () => {
    dispatch(clearSubscription());
  };

  return {
    subscriptionPlan,
    isLoading,
    error,
    updateSubscriptionPlan,
    setSubscriptionLoading,
    setSubscriptionError,
    clearSubscriptionData,
  };
}; 