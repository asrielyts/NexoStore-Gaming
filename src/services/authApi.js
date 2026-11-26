import {api} from '../data/database';

export const loginApi = (email, password) => api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
    headers: {'Content-Type': 'application/json'}
});
export const registerApi = (name, email, password) => api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({name, email, password}),
    headers: {'Content-Type': 'application/json'}
});
export const currentUserApi = () => api('/api/auth/me');
export const logoutApi = () => api('/api/auth/logout', {method: 'POST'});
