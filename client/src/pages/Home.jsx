// ---------- HOME PAGE ----------
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

// The category tiles: each one links to the shop page with a filter in the URL
const tiles = [
  { label: 'Men', to: '/shop?category=Men', note: 'Runners, canvas, sandals' },
  { label: 'Women', to: '/shop?category=Women', note: 'Flats, sneakers, slides' },
  { label: 'Kids', to: '/shop?category=Kids', note: 'Light, soft, easy to wear' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  // Runs once when the page opens: fetch the featured products from the server
  useEffect(() => {
    api('/products?featured=true').then(setFeatured).catch(console.error);
  }, []);

  return (
    <>
      {/* Hero banner */}
      <section className="hero">
        <div>
          <h1>Walk under any sky.</h1>
          <p>Everyday footwear for men, women and kids. Use code <b>WELCOME10</b> for 10% off your first order, and get free delivery above ₹999.</p>
          <Link to="/shop" className="btn">Shop all footwear</Link>
        </div>
      </section>

      {/* Category tiles */}
      <section className="section">
        <h2>Shop by who's wearing</h2>
        <div className="tiles">
          {tiles.map((t) => (
            <Link key={t.label} to={t.to} className="tile">
              <strong>{t.label}</strong>
              <span>{t.note}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <h2>Featured this week</h2>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </>
  );
}
