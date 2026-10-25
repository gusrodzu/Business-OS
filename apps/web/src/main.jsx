import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './framework/AppErrorBoundary';
import AppProviders from './providers/AppProviders';
import './design-system/styles/foundation.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>,
);



// Offline-capable public app shell: service worker never stores customer or API responses.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Native and web app must remain usable if SW registration is unavailable.
    });
  }, {once: true});
}
