export const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE = `${API_URL}/api`;

export function apiUrl(path) {
  return `${API_URL}${path}`;
}
