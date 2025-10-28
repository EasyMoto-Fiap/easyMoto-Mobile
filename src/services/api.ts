import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:5230/api',
  timeout: 15000,
});

const API_KEY = 'EM_3f8b2a4c9b7e4e6e9a7c1f2d3a5b8c';
const API_VERSION = '2.0';

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['x-api-key'] = API_KEY;
  config.headers['x-api-version'] = API_VERSION;
  return config;
});

export default api;
