// ---------- CART PAGE ----------
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { rupees } from '../api.js';

export default function Cart() {
  const { items, setQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="center-msg">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn">Browse footwear</Link>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h2>Your cart</h2>
      {items.map((i) => (
        <div className="cart-row" key={i.key}>
          <img src={i.image} alt={i.name} />
          <div className="grow">
            <strong>{i.name}</strong>
            <p className="muted">Size {i.size} · {i.color}</p>
            <button className="link-btn" onClick={() => removeItem(i.key)}>Remove</button>
          </div>
          <input type="number" className="qty" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.key, Number(e.target.value))} />
          <strong>{rupees(i.price * i.qty)}</strong>
        </div>
      ))}

      <div className="summary">
        <p>Subtotal <strong>{rupees(subtotal)}</strong></p>
        <p className="muted">Delivery and coupons are applied at checkout.</p>
        <button className="btn" onClick={() => navigate('/checkout')}>Go to checkout</button>
      </div>
    </div>
  );
}
