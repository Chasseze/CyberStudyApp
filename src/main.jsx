import React from 'react';
import ReactDOM from 'react-dom/client';
import CyberTrackerAppWithAuth from '../CyberTrackerAppWithAuth.jsx';
import { AuthProvider } from '../AuthContext.jsx';
import { SyncProvider } from '../SyncContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary componentName="Application">
      <ToastProvider>
        <AuthProvider>
          <SyncProvider>
            <CyberTrackerAppWithAuth />
          </SyncProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
