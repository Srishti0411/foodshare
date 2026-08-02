import { create } from 'zustand';

const STORAGE_KEY = 'foodshare.auth';

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

const initial = loadInitial();

export const useAuthStore = create((set) => ({
  token: initial.token,
  user: initial.user,

  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },

  updateUser: (user) => {
    set((state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user }));
      return { user };
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },
}));
