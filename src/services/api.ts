import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.203.27.184/api',
  timeout: 15000,
});

export default api;
