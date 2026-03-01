import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    withCredentials: true,
    timeout: 10000,
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signup') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;

// Auth API helpers
export const authApi = {
    signup: async (email: string, password: string) => {
        try {
            const res = await api.post('/api/admin/signup', { email, password });
            return res.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Signup failed');
            }
            throw error;
        }
    },
    login: async (email: string, password: string) => {
        try {
            const res = await api.post('/api/admin/login', { email, password });
            return res.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Login failed');
            }
            throw error;
        }
    },
};
