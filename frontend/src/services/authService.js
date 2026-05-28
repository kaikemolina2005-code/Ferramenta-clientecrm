import api from './api';
export const authService = {
    async login(payload) {
        const response = await api.post('/auth/login', payload);
        const { token, user } = response.data.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { token, user };
    },
    async logout() {
        try {
            await api.post('/auth/logout');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },
    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data.data;
    },
    async updateProfile(data) {
        const response = await api.put('/auth/profile', data);
        return response.data.data;
    },
    getToken() {
        return localStorage.getItem('auth_token');
    },
    setToken(token) {
        localStorage.setItem('auth_token', token);
    },
    isAuthenticated() {
        return !!this.getToken();
    },
};
