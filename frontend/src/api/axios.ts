import axios from 'axios';

const dynamicBaseUrl = `http://${window.location.hostname}/pea/backend/public/api`;

const api = axios.create({
  baseURL: dynamicBaseUrl, 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add a request interceptor to auto-inject the auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // When sending FormData (file uploads), remove Content-Type
    // so the browser auto-sets it with the correct multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle session expiration (401)
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login if unauthorized
      localStorage.clear();
      window.location.href = '/pea/login';
    }
    return Promise.reject(error);
  }
);

export default api;
//on local working code
// import axios from 'axios';

// const hostname = window.location.hostname;

// // Add only this special case for local React dev
// const apiHost =
//   hostname === 'localhost' || hostname === '127.0.0.1'
//     ? '197.156.90.84' // put your real public server IP here
//     : hostname;

// const dynamicBaseUrl = `http://${apiHost}/pea/backend/public/api`;

// const api = axios.create({
//   baseURL: dynamicBaseUrl,
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   },
// });

// export default api;
