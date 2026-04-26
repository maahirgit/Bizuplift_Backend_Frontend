// Use Vercel Backend URL if provided, otherwise fallback to local proxy
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Standard fetch wrapper that automatically attaches the
 * JWT token from localStorage to the Authorization header.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/products')
 * @param {object} options - Standard fetch options (method, body, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('bizuplift_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);
        const json = await response.json();
        
        if (!response.ok) {
            throw new Error(json.message || `API Error: ${response.status}`);
        }
        
        // Return the full response so callers can pick what they need
        // (auth responses have { token, user }, data responses have { products }, etc.)
        // If there's a direct `data` field, return it; otherwise the whole object
        return json.data !== undefined ? json.data : json;
    } catch (error) {
        console.error(`[API Fetch Error] ${endpoint}:`, error);
        throw error;
    }
};

// Expose standard REST helpers
export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};
