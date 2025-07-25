import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const apiClient = axios.create();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Xử lý tài khoản bị vô hiệu hóa
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            error.response.data &&
            error.response.data.message &&
            (
                error.response.data.message.includes('vô hiệu hóa') ||
                error.response.data.message.includes('bị khóa') ||
                error.response.data.message.toLowerCase().includes('deactivated')
            )
        ) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/login?deactivated=1';
            return Promise.reject(error);
        }
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/accounts/refresh-token')) {
                // Nếu refresh token cũng hết hạn, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                const response = await axios.post(`${API_URL}/accounts/refresh-token`, { refreshToken });
                if (response.data.status === 'Success') {
                    const newAccessToken = response.data.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                    processQueue(null, newAccessToken);
                    return apiClient(originalRequest);
                } else {
                    processQueue(error, null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient; 