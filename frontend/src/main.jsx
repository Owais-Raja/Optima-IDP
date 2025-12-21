import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

// =================================================================================================
// Application Entry Point
// -------------------------------------------------------------------------------------------------
// Bootstraps the React application:
// - Mounts to the root DOM element.
// - Wraps with React.StrictMode for development checks.
// - Wraps with BrowserRouter for routing context.
// =================================================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ======================= Main App Component ======================= */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

