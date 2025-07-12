import { useSession } from "next-auth/react";

export const useUser = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    userId: session?.user?.id,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    status,
  };
}; 