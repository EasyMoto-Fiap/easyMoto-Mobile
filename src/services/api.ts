import axios from 'axios';

const api = axios.create({
  baseURL: 'http://74.249.100.243/api',
  timeout: 15000,
});

const API_KEY = 'super-secret-key';
const API_VERSION = '2.0';

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['x-api-key'] = API_KEY;
  config.headers['x-api-version'] = API_VERSION;
  return config;
});

export default api;
