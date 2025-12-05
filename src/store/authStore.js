import { create } from 'zustand';
import axios from 'axios';
import socketService from '../services/socketService';

const API_URL = 'https://chat-app-backend-a017.onrender.com/api/auth';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Signup failed' });
            throw error;
        }
    },

    verifyOTP: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Verification failed' });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Login failed' });
            throw error;
        }
    },

    logout: () => {
        // Disconnect socket on logout
        socketService.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = response.data.user;
            localStorage.setItem('userId', user.id);
            set({ user, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));
