const API_BASE = window.location.port === '5173' ? '/api' : 'http://localhost:18080/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call failed on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Get all campus locations (academic, hostels, landmarks, etc.)
  getLocations: () => fetchJson('/locations'),

  // Get specific location details
  getLocation: (id) => fetchJson(`/locations/${encodeURIComponent(id)}`),

  // Search locations by query string & optional category
  searchLocations: (q, cat = 'all') =>
    fetchJson(`/search?q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}`),

  // Find shortest route (Dijkstra)
  findRoute: (source, destination, speed = 1.2) =>
    fetchJson('/route', {
      method: 'POST',
      body: JSON.stringify({ source, destination, speed }),
    }),

  // Find alternative routes (Yen's K-Shortest Paths)
  findAlternatives: (source, destination, k = 3, speed = 1.2) =>
    fetchJson('/alternatives', {
      method: 'POST',
      body: JSON.stringify({ source, destination, k, speed }),
    }),

  // Find nearby facilities from source
  findNearby: (source, speed = 1.2) =>
    fetchJson('/nearby', {
      method: 'POST',
      body: JSON.stringify({ source, speed }),
    }),

  // Get full campus map graph (nodes, junctions, and edges)
  getGraph: () => fetchJson('/graph'),

  // Update restriction status on a pathway
  toggleRestrictedPath: (u, v, restricted) =>
    fetchJson('/restricted-path', {
      method: 'POST',
      body: JSON.stringify({ u, v, restricted }),
    }),

  // Reset all pathway restrictions
  resetRestrictions: () =>
    fetchJson('/restricted-path', {
      method: 'POST',
      body: JSON.stringify({ reset: true }),
    }),

  // Get currently restricted pathways
  getRestrictedPaths: () => fetchJson('/restricted-paths'),

  // Run BFS exploration from source
  runBFS: (source, maxHops = 3) =>
    fetchJson('/bfs', {
      method: 'POST',
      body: JSON.stringify({ source, maxHops }),
    }),

  // Get navigation and graph statistics
  getStatistics: () => fetchJson('/statistics'),

  // Get ADSA academic documentation and algorithm specs
  getAdsaInfo: () => fetchJson('/adsa-info'),
};

