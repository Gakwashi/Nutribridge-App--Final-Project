const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  },

  // Auth endpoints
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  // Recipe endpoints
  async generateRecipes(recipeData: any) {
    return this.request('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  },

  async getRecipeHistory() {
    return this.request('/recipes/history');
  },

  // Payment endpoints
  async initiatePayment(paymentData: any) {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async upgradeToPremium() {
    return this.request('/payments/upgrade', {
      method: 'POST',
    });
  }
};
