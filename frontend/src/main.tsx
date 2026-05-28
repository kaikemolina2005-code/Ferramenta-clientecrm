import React from 'react'
import ReactDOM from 'react-dom/client'
import { initSentry } from './services/sentry'
import App from './App'
import './styles/globals.css'

// Initialize Sentry BEFORE rendering the app
initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
