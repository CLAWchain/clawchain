import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import NetworkApp from './NetworkApp';
import './index.css';

// Detect if we're on the network subdomain
const isNetworkSubdomain = window.location.hostname === 'network.clawchain.app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isNetworkSubdomain ? (
      <NetworkApp />
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>
);