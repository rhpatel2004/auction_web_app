// src/api.js
const BASE_URL = 'http://localhost:5000/api'; // Replace with your backend URL if different

const api = {
  // Authentication
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getUser: async () => {
     const userId = localStorage.getItem('userId');
     // Simple "auth" (INSECURE - for demo only)
    if (!userId) {
      return null;
    }

    const response = await fetch(`${BASE_URL}/user`, {
       method: 'GET',
    });

    if (!response.ok) {
       localStorage.removeItem('userId');
       localStorage.removeItem('userRole');
      return null; // Or throw an error, depending on your error handling
    }
    return response.json();
  },

  // Products
  getProducts: async () => {
    const response = await fetch(`${BASE_URL}/products`);
    return response.json();
  },

  getProduct: async (productId) => {
    const response = await fetch(`${BASE_URL}/products/${productId}`);
    return response.json();
  },

  addProduct: async (productData) => {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
       headers: {
        'Content-Type': 'application/json',
        // Include any necessary headers (e.g., for authentication)
      },
      body: JSON.stringify(productData),
    });
     if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to add product'); // Provide more specific error
    }
    return response.json();
  },

  placeBid: async (productId, bidAmount) => {
     const userId = localStorage.getItem('userId');
    const response = await fetch(`${BASE_URL}/products/${productId}/bid`, {
      method: 'POST',
       headers: {
        'Content-Type': 'application/json',
        // Include any necessary headers (e.g., for authentication)
      },
      body: JSON.stringify({ amount: bidAmount }),
    });
    return response.json();
  },
};

export default api;