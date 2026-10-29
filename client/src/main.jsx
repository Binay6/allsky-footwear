// ---------- APP START ----------
// This is the first JavaScript file the browser runs. It puts our React app into <div id="root">.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // BrowserRouter enables page navigation (URLs like /shop, /cart)
  <BrowserRouter>
    {/* Providers share data (the logged-in user and the cart) with every page below them */}
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
