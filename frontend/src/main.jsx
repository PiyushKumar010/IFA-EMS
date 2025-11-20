import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const DEFAULT_API_BASE_URL = 'https://ifa-bck.onrender.com'
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
const API_BASE_URL = rawApiBaseUrl.endsWith('/')
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl

if (typeof window !== 'undefined' && API_BASE_URL) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const request =
      typeof input === 'string' || input instanceof URL
        ? new Request(input, init)
        : input

    try {
      const url = new URL(request.url, window.location.origin)
      if (url.origin === window.location.origin && url.pathname.startsWith('/api')) {
        const rebasedUrl = `${API_BASE_URL}${url.pathname}${url.search}${url.hash}`
        const proxiedRequest = new Request(rebasedUrl, request)
        return originalFetch(proxiedRequest)
      }
    } catch (err) {
      // If the URL constructor fails, fall back to the original fetch
    }

    return originalFetch(request)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
