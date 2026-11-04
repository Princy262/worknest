import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // sends the login cookie with every request
});

// If the login expires while someone is using the app, send them to the login page.
// Calls to /auth/... are skipped, because a 401 there is a normal answer
// (wrong password, or "nobody is logged in yet").
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/');

    if (error.response?.status === 401 && !isAuthCall && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;