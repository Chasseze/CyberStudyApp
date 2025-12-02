import React from 'react'
import ReactDOM from 'react-dom/client'
import CyberTrackerAppWithAuth from '../CyberTrackerAppWithAuth.jsx'
import { AuthProvider } from '../AuthContext.jsx'
import { SyncProvider } from '../SyncContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SyncProvider>
        <CyberTrackerAppWithAuth />
      </SyncProvider>
    </AuthProvider>
  </React.StrictMode>
)
