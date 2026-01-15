// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request Failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Shopping List API
export const shoppingAPI = {
    getAll: () => apiCall('/api/shopping'),

    add: (item) => apiCall('/api/shopping', {
        method: 'POST',
        body: JSON.stringify(item),
    }),

    markPurchased: (id, purchasedBy) => apiCall(`/api/shopping/${id}/purchase`, {
    method: 'PUT',
    body: JSON.stringify({ purchased_by: purchasedBy }),
    }),
    
    unmarkPurchased: (id) => apiCall(`/api/shopping/${id}/unpurchase`, {
        method: 'PUT',
    }),
    
    delete: (id) => apiCall(`/api/shopping/${id}`, {
        method: 'DELETE',
    }),
    
    clearPurchased: () => apiCall('/api/shopping/purchased/clear', {
        method: 'DELETE',
    }),
};

// Members API
export const membersApi = {
  getAll: () => apiCall('/api/members'),
  
  getOne: (id) => apiCall(`/api/members/${id}`),
  
  add: (member) => apiCall('/api/members', {
    method: 'POST',
    body: JSON.stringify(member),
  }),
  
  update: (id, member) => apiCall(`/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  }),
  
  delete: (id) => apiCall(`/api/members/${id}`, {
    method: 'DELETE',
  }),
};

// Expenses API
export const expensesApi = {
  getAll: () => apiCall('/api/expenses'),
  
  getBalance: () => apiCall('/api/expenses/balance'),
  
  add: (expense) => apiCall('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  }),
  
  delete: (id) => apiCall(`/api/expenses/${id}`, {
    method: 'DELETE',
  }),
};

// Events API
export const eventsApi = {
  getAll: () => apiCall('/api/events'),
  
  getUpcoming: () => apiCall('/api/events/upcoming'),
  
  add: (event) => apiCall('/api/events', {
    method: 'POST',
    body: JSON.stringify(event),
  }),
  
  update: (id, event) => apiCall(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  }),
  
  delete: (id) => apiCall(`/api/events/${id}`, {
    method: 'DELETE',
  }),
};

// Appliances API
export const appliancesApi = {
  getAll: () => apiCall('/api/appliances'),
  
  start: (id, startedBy, durationMinutes) => apiCall(`/api/appliances/${id}/start`, {
    method: 'PUT',
    body: JSON.stringify({ started_by: startedBy, duration_minutes: durationMinutes }),
  }),
  
  markDone: (id) => apiCall(`/api/appliances/${id}/done`, {
    method: 'PUT',
  }),
  
  reset: (id) => apiCall(`/api/appliances/${id}/reset`, {
    method: 'PUT',
  }),
};

// Health check
export const healthCheck = () => apiCall('/api/health');