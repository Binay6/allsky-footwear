// ---------- MY ORDERS: order history + tracking ----------
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';

// The steps shown in the tracker (a cancelled order is shown separately)
const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState(null); // null = still loading

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch(console.error);
  }, []);

  if (!orders) return <p className="center-msg">Loading…</p>;
  if (orders.length === 0) return <div className="center-msg"><h2>No orders yet</h2><Link to="/shop" className="btn">Start shopping</Link></div>;

  return (
    <div className="page narrow">
      <h2>My orders</h2>
      {orders.map((o) => {
        const step = STEPS.indexOf(o.status); // which step the order has reached
        return (
          <div className="order" key={o._id}>
            <div className="order-head">
              <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
              <span className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.paymentMethod} · {o.paymentStatus}</span>
              <strong>{rupees(o.total)}</strong>
            </div>

            {/* Tracking bar */}
            {o.status === 'Cancelled' ? <p className="out">This order was cancelled.</p> : (
              <ol className="track">
                {STEPS.map((s, idx) => <li key={s} className={idx <= step ? 'done' : ''}>{s}</li>)}
              </ol>
            )}

            {o.items.map((i, idx) => (
              <p key={idx} className="line"><span>{i.name} (Size {i.size}, {i.color}) × {i.qty}</span><span>{rupees(i.price * i.qty)}</span></p>
            ))}
            <p className="muted">Ships to {o.address.fullName}, {o.address.line}, {o.address.city} {o.address.pincode}</p>
          </div>
        );
      })}
    </div>
  );
}
