const API_URL = 'http://localhost:8080';

export async function api(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(
            typeof data === 'string'
                ? data
                : data.message || `Error HTTP ${response.status}`
        );
    }

    return data;
}