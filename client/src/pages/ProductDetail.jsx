// ---------- PRODUCT DETAIL PAGE (with size and color variations) ----------
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams(); // the :id from the URL
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  // Load this one product from the server
  useEffect(() => {
    api(`/products/${id}`).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="center-msg">{error}</p>;
  if (!product) return <p className="center-msg">Loading…</p>;

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAdd = (goToCart) => {
    // The customer must pick a size and a color first
    if (!size || !color) return setError('Please choose a size and a color');
    addToCart(product, size, color, qty);
    if (goToCart) navigate('/cart');
    else setError('Added to your cart ✓');
  };

  return (
    <div className="detail">
      <img src={product.image} alt={product.name} />

      <div>
        <h1>{product.name}</h1>
        <p className="muted">{product.category} · {product.type}</p>
        <p className="price big">{rupees(product.price)} <s>{rupees(product.mrp)}</s> <span className="off">{off}% off</span></p>
        <p>{product.description}</p>

        <h4>Size (UK)</h4>
        <div className="chips">
          {product.sizes.map((s) => (
            <button key={s} className={`chip ${size === s ? 'on' : ''}`} onClick={() => { setSize(s); setError(''); }}>{s}</button>
          ))}
        </div>

        <h4>Color</h4>
        <div className="chips">
          {product.colors.map((c) => (
            <button key={c} className={`chip ${color === c ? 'on' : ''}`} onClick={() => { setColor(c); setError(''); }}>{c}</button>
          ))}
        </div>

        {product.stock === 0 ? <p className="out">Out of stock</p> : (
          <>
            {product.stock <= 5 && <p className="out">Only {product.stock} left</p>}
            <div className="row">
              <input type="number" min="1" max={product.stock} value={qty} className="qty"
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), product.stock)))} />
              <button className="btn ghost" onClick={() => handleAdd(false)}>Add to cart</button>
              <button className="btn" onClick={() => handleAdd(true)}>Buy now</button>
            </div>
          </>
        )}
        {error && <p className="notice">{error}</p>}
      </div>
    </div>
  );
}
