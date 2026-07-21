import { create } from "zustand";

interface User {
  id: string;
  email: string;
role: string;
  name: string;
  phone: string;

  // firstName: string;
  // lastName: string;
}

interface AuthState {
  user: User | null;
  authLoading: boolean;

  setUser: (user: User) => void;
  clearUser: () => void;
  setAuthLoading: (value: boolean) => void;
  initUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authLoading: false,

  setUser: (user) => set({ user, authLoading: false }),
  clearUser: () => set({ user: null, authLoading: false }),
  setAuthLoading: (value: any) => set({ authLoading: value }),
  initUser: (user) => set({ user, authLoading: false }),
}));

export const useAuth = () => {
  const { user, authLoading, initUser } = useAuthStore();

  return {
    user,
    authLoading,
    initUser,
  };
};
