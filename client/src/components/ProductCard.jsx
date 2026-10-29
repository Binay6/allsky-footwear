// ---------- PRODUCT CARD (one product in a grid) ----------
import { Link } from 'react-router-dom';
import { rupees } from '../api.js';

export default function ProductCard({ product }) {
  // Work out the "% off" label from the original price (mrp) and selling price
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <Link to={`/product/${product._id}`} className="card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.category} · {product.type}</p>
        <p className="price">
          {rupees(product.price)} <s>{rupees(product.mrp)}</s> {off > 0 && <span className="off">{off}% off</span>}
        </p>
        {product.stock === 0 && <p className="out">Out of stock</p>}
      </div>
    </Link>
  );
}
