import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const channelApi = {
    getChannels: () => api.get('/channels'),
    createDirect: (userId) => api.post('/channels/direct', { userId }),
    createGroup: (name, memberIds) => api.post('/channels/group', { name, memberIds }),
};

export const messageApi = {
    getMessages: (channelId, cursor) =>
        api.get(`/messages/${channelId}`, { params: { cursor } }),
    sendMessage: (channelId, content, replyToId) =>
        api.post(`/messages/${channelId}`, { content, replyToId }),
    editMessage: (messageId, content) =>
        api.put(`/messages/${messageId}`, { content }),
    deleteMessage: (messageId) =>
        api.delete(`/messages/${messageId}`),
};

export const userApi = {
    searchUsers: (query) => api.get('/users/search', { params: { query } }),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
};

export const friendApi = {
    getFriends: () => api.get('/friends'),
    getPending: () => api.get('/friends/pending'),
    sendRequest: (receiverId) => api.post('/friends/request', { receiverId }),
    respondRequest: (requestId, action) => api.post('/friends/respond', { requestId, action })
};
