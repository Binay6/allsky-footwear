// ---------- NAVBAR (top bar on every page) ----------
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // When the search form is submitted, go to the shop page with ?search=... in the URL
  const onSearch = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    navigate(`/shop?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="nav">
      <Link to="/" className="logo">All Sky</Link>

      <nav className="nav-links">
        <NavLink to="/shop?category=Men">Men</NavLink>
        <NavLink to="/shop?category=Women">Women</NavLink>
        <NavLink to="/shop?category=Kids">Kids</NavLink>
      </nav>

      <form onSubmit={onSearch} className="nav-search">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shoes, sandals…" aria-label="Search products" />
      </form>

      <div className="nav-right">
        {/* Show the Admin link only to admin users */}
        {user?.isAdmin && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <Link to="/orders">My orders</Link>
            <button className="link-btn" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
        <Link to="/cart" className="cart-link">Cart <span className="badge">{count}</span></Link>
      </div>
    </header>
  );
}
