const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

const jsonHeaders = {'Content-Type': 'application/json', Accept: 'application/json'};

export async function api(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers: {
            ...jsonHeaders,
            ...(options.headers || {}),
        },
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message = typeof data === 'string'
            ? data
            : data?.error || data?.message || `Error HTTP ${response.status}`;
        throw new Error(message || `Error HTTP ${response.status}`);
    }
    return data;
}

function notifyRefresh() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('nexostore:refresh'));
    }
}

function withRefresh(promise) {
    return promise.then(result => {
        notifyRefresh();
        return result;
    });
}

export async function loadCatalog() {
    const data = await api('/api/catalog');
    return {
        products: Array.isArray(data?.products) ? data.products : [],
        categories: Array.isArray(data?.categories) ? data.categories : [],
        posts: Array.isArray(data?.posts) ? data.posts : [],
    };
}

export async function loadAdminState() {
    const data = await api('/api/state');
    return {
        ...data,
        products: Array.isArray(data?.products) ? data.products : [],
        categories: Array.isArray(data?.categories) ? data.categories : [],
        users: Array.isArray(data?.users) ? data.users : [],
        orders: Array.isArray(data?.orders) ? data.orders : [],
        messages: Array.isArray(data?.messages) ? data.messages : [],
        posts: Array.isArray(data?.posts) ? data.posts : [],
    };
}

export async function listProducts(query = {}) {
    const {products} = await loadCatalog();
    let list = products;
    if (query.category) list = list.filter(p => p.categoryId === query.category);
    if (query.offer) list = list.filter(p => Number(p.oldPrice) > Number(p.price));
    if (query.search) {
        const term = String(query.search).toLocaleLowerCase('es');
        list = list.filter(p => `${p.name || ''} ${p.description || ''}`.toLocaleLowerCase('es').includes(term));
    }
    return list;
}

export const createProduct = fields =>
    withRefresh(api('/api/products', {method: 'POST', body: JSON.stringify(fields)}));

export const updateProduct = (id, patch) =>
    withRefresh(api(`/api/products/${encodeURIComponent(id)}`, {method: 'PUT', body: JSON.stringify(patch)}));

export const deleteProduct = id =>
    withRefresh(api(`/api/products/${encodeURIComponent(id)}`, {method: 'DELETE'}));

export const createCategory = fields =>
    withRefresh(api('/api/categories', {method: 'POST', body: JSON.stringify(fields)}));

export const updateCategory = (id, patch) =>
    withRefresh(api(`/api/categories/${encodeURIComponent(id)}`, {method: 'PUT', body: JSON.stringify(patch)}));

export const deleteCategory = id =>
    withRefresh(api(`/api/categories/${encodeURIComponent(id)}`, {method: 'DELETE'}));

export const createUser = fields =>
    withRefresh(api('/api/admin/users', {method: 'POST', body: JSON.stringify(fields)}));

export const updateUser = (id, patch) =>
    withRefresh(api(`/api/admin/users/${encodeURIComponent(id)}`, {method: 'PATCH', body: JSON.stringify(patch)}));

export const deleteUser = id =>
    withRefresh(api(`/api/admin/users/${encodeURIComponent(id)}`, {method: 'DELETE'}));

export const updateOrder = (id, patch) =>
    withRefresh(api(`/api/admin/orders/${encodeURIComponent(id)}`, {method: 'PATCH', body: JSON.stringify(patch)}));

export const deleteMessage = id =>
    withRefresh(api(`/api/admin/messages/${encodeURIComponent(id)}`, {method: 'DELETE'}));

export const resetDatabase = () =>
    withRefresh(api('/api/admin/reset', {method: 'POST'}));

export async function createOrder({customer, items, paymentMethod, simulateFailure = false}) {
    const order = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({customer, items, paymentMethod, simulateFailure}),
    });
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexostore:order', {detail: order}));
        notifyRefresh();
    }
    return order;
}

export const createMessage = fields =>
    withRefresh(api('/api/messages', {method: 'POST', body: JSON.stringify(fields)}));

export function money(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

export function cartTotal(items, products) {
    return items.reduce((sum, line) => {
        const product = products.find(p => p.id === line.productId);
        return sum + (Number(product?.price) || 0) * (Number(line.quantity) || 0);
    }, 0);
}
