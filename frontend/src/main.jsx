import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// This connects your React app to the "root" div in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)