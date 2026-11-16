import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to automatically attach active Unit ID
const originalFetch = window.fetch;
window.fetch = function (input, init = {}) {
  const currentUnit = localStorage.getItem('bw_selected_unit');
  if (currentUnit) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      if (!init.headers.has('x-unit-id')) {
        init.headers.set('x-unit-id', currentUnit);
      }
    } else if (Array.isArray(init.headers)) {
      init.headers.push(['x-unit-id', currentUnit]);
    } else {
      init.headers['x-unit-id'] = currentUnit;
    }
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
