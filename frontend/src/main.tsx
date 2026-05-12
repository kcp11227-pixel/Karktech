import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App'

// Dev bypass: intercept all axios requests and inject dev token if active
axios.interceptors.request.use((config) => {
  const devToken = localStorage.getItem('dev_bypass_token');
  if (devToken) {
    config.headers.set('Authorization', `Bearer ${devToken}`);
  }
  return config;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
