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
            if (path.startsWith('/admin') && path !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
