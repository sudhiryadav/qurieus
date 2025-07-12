import { useAppSelector, useAppDispatch } from '@/lib/store';
import { setSidebarOpen, toggleSidebar } from '@/lib/slices/uiSlice';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector(state => state.ui);

  const updateSidebarOpen = (open: boolean) => {
    dispatch(setSidebarOpen(open));
  };

  const toggleSidebarOpen = () => {
    dispatch(toggleSidebar());
  };

  return {
    sidebarOpen,
    updateSidebarOpen,
    toggleSidebarOpen,
  };
}; 