// ---------- CHECKOUT PAGE: address, coupon, mock payment ----------
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form values
  const [address, setAddress] = useState({ fullName: user.name, phone: '', line: '', city: '', pincode: '' });
  const [payment, setPayment] = useState('COD');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, percent, discount } after a successful Apply
  const [couponMsg, setCouponMsg] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // set after success to show the thank-you screen

  // Money maths (same rules as the server: free delivery from ₹999)
  const discount = coupon ? coupon.discount : 0;
  const shipping = subtotal - discount >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const setField = (key) => (e) => setAddress({ ...address, [key]: e.target.value });

  // Ask the server whether the coupon code is valid
  const applyCoupon = async () => {
    try {
      const data = await api('/coupons/validate', { method: 'POST', body: { code: couponInput, subtotal } });
      setCoupon(data);
      setCouponMsg(`${data.code} applied: you save ${rupees(data.discount)}`);
    } catch (e) {
      setCoupon(null);
      setCouponMsg(e.message);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    // Basic checks for the mock payment details
    if (payment === 'UPI' && !/^[\w.\-]+@[\w]+$/.test(upi)) return setError('Enter a valid UPI ID, like name@bank');
    if (payment === 'Card' && (card.number.replace(/\s/g, '').length !== 16 || !card.expiry || card.cvv.length < 3)) {
      return setError('Enter a 16-digit card number, expiry and CVV (any test values work)');
    }
    setPlacing(true);
    try {
      // Only send what the server needs: product id, size, color, qty. The server works out prices itself.
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ product: i.product, size: i.size, color: i.color, qty: i.qty })),
          address, paymentMethod: payment, couponCode: coupon?.code,
        },
      });
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // Thank-you screen after a successful order
  if (placedOrder) {
    return (
      <div className="center-msg">
        <h2>Order placed. Thank you!</h2>
        <p>Order #{placedOrder._id.slice(-6).toUpperCase()} · Total {rupees(placedOrder.total)} · {placedOrder.paymentStatus}</p>
        <button className="btn" onClick={() => navigate('/orders')}>Track my order</button>
      </div>
    );
  }

  if (items.length === 0) return <div className="center-msg"><p>Your cart is empty.</p><Link to="/shop" className="btn">Browse footwear</Link></div>;

  return (
    <form className="checkout" onSubmit={placeOrder}>
      {/* Left: address and payment */}
      <div>
        <h2>Delivery address</h2>
        <div className="form-grid">
          <input required placeholder="Full name" value={address.fullName} onChange={setField('fullName')} />
          <input required placeholder="Phone (10 digits)" pattern="[0-9]{10}" value={address.phone} onChange={setField('phone')} />
          <input required className="wide" placeholder="House no., street, area" value={address.line} onChange={setField('line')} />
          <input required placeholder="City" value={address.city} onChange={setField('city')} />
          <input required placeholder="Pincode" pattern="[0-9]{6}" value={address.pincode} onChange={setField('pincode')} />
        </div>

        <h2>Payment (demo only)</h2>
        <div className="chips">
          {['COD', 'UPI', 'Card'].map((m) => (
            <button type="button" key={m} className={`chip ${payment === m ? 'on' : ''}`} onClick={() => setPayment(m)}>
              {m === 'COD' ? 'Cash on delivery' : m}
            </button>
          ))}
        </div>
        {payment === 'UPI' && <input placeholder="UPI ID, e.g. name@okbank" value={upi} onChange={(e) => setUpi(e.target.value)} />}
        {payment === 'Card' && (
          <div className="form-grid">
            <input className="wide" placeholder="Card number (16 digits)" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
            <input placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
            <input placeholder="CVV" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
          </div>
        )}
        <p className="muted">No real payment happens. Card and UPI details are not sent to the server or saved.</p>
      </div>

      {/* Right: order summary */}
      <aside className="summary">
        <h3>Order summary</h3>
        {items.map((i) => (
          <p key={i.key} className="line"><span>{i.name} ({i.size}, {i.color}) × {i.qty}</span><span>{rupees(i.price * i.qty)}</span></p>
        ))}

        <div className="row">
          <input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
          <button type="button" className="btn ghost" onClick={applyCoupon}>Apply</button>
        </div>
        {couponMsg && <p className={coupon ? 'ok' : 'out'}>{couponMsg}</p>}

        <p className="line"><span>Subtotal</span><span>{rupees(subtotal)}</span></p>
        {discount > 0 && <p className="line ok"><span>Discount</span><span>− {rupees(discount)}</span></p>}
        <p className="line"><span>Delivery</span><span>{shipping === 0 ? 'Free' : rupees(shipping)}</span></p>
        <p className="line total"><span>Total</span><span>{rupees(total)}</span></p>

        {error && <p className="out">{error}</p>}
        <button className="btn" disabled={placing}>{placing ? 'Placing order…' : `Place order · ${rupees(total)}`}</button>
      </aside>
    </form>
  );
}
