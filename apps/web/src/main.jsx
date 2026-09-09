import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './framework/AppErrorBoundary';
import AppProviders from './providers/AppProviders';
import './design-system/styles/tokens.css';
import './design-system/styles/md3-foundation.css';
import './design-system/styles/md3-full-rollout.css';
import './design-system/styles/globals.css';
import './design-system/styles/detail-drawer-global.css';
import './design-system/styles/modal-centered-global.css';
import './design-system/styles/global-standard.css';

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
