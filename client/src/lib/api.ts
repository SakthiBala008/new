export const API_BASE_URL = '/api';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const portfolioApi = {
  getDashboard: (userId: number) => apiCall(`/dashboard/${userId}`),
  getPortfolios: (userId: number) => apiCall(`/portfolios/${userId}`),
  getPortfolio: (id: number) => apiCall(`/portfolio/${id}`),
  createPortfolio: (data: any) => apiCall('/portfolio', { method: 'POST', body: JSON.stringify(data) }),
  optimizePortfolio: (data: any) => apiCall('/optimize-portfolio', { method: 'POST', body: JSON.stringify(data) }),
  exportPortfolio: (id: number) => apiCall(`/portfolio/${id}/export`),
  getRiskMetrics: (id: number) => apiCall(`/portfolio/${id}/risk-metrics`),
};

export const stockApi = {
  getAllStocks: () => apiCall('/stocks'),
  getStock: (symbol: string) => apiCall(`/stocks/${symbol}`),
};

export const mlApi = {
  getModelPerformance: () => apiCall('/ml-models/performance'),
};
