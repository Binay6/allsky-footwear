// ---------- ADMIN PANEL: dashboard, products, orders, coupons ----------
// Only users with isAdmin = true can reach this page (see RequireAuth in App.jsx).
import { useEffect, useState } from 'react';
import { api, rupees } from '../api.js';

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const tabs = ['dashboard', 'products', 'orders', 'coupons'];

  return (
    <div className="page">
      <h2>Admin panel</h2>
      <div className="chips">
        {tabs.map((t) => (
          <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {/* Show only the section for the selected tab */}
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'products' && <ProductsAdmin />}
      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'coupons' && <CouponsAdmin />}
    </div>
  );
}

/* ---------- 1. Dashboard (sales report) ---------- */
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/admin/stats').then(setStats).catch(console.error); }, []);
  if (!stats) return <p className="muted">Loading…</p>;

  const cards = [
    ['Revenue', rupees(stats.revenue)],
    ['Orders', stats.orders],
    ['Orders to process', stats.pending],
    ['Customers', stats.customers],
    ['Products', stats.products],
  ];
  return (
    <>
      <div className="stats">
        {cards.map(([label, value]) => <div key={label} className="stat"><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <h3>Low stock (5 or fewer left)</h3>
      {stats.lowStock.length === 0 ? <p className="muted">Nothing is running low.</p> :
        stats.lowStock.map((p) => <p key={p._id} className="line"><span>{p.name}</span><span>{p.stock} left</span></p>)}
    </>
  );
}

/* ---------- 2. Products: add, edit, delete ---------- */
const emptyProduct = {
  name: '', description: '', category: 'Men', type: 'Shoes', price: '', mrp: '',
  image: '', sizes: '', colors: '', stock: '', featured: false,
};

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null); // null = we are adding a new product
  const [msg, setMsg] = useState('');

  const load = () => api('/products').then(setProducts);
  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // Fill the form with an existing product so it can be edited
  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({ ...p, sizes: p.sizes.join(', '), colors: p.colors.join(', ') });
    window.scrollTo(0, 0);
  };

  const save = async (e) => {
    e.preventDefault();
    // The form holds text; convert it into the shapes the database expects
    const body = {
      ...form,
      price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock),
      sizes: String(form.sizes).split(',').map((s) => Number(s.trim())).filter(Boolean),
      colors: String(form.colors).split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      setMsg(editingId ? 'Product updated' : 'Product added');
      setForm(emptyProduct);
      setEditingId(null);
      load();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api(`/products/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <form className="admin-form" onSubmit={save}>
        <h3>{editingId ? 'Edit product' : 'Add a product'}</h3>
        <div className="form-grid">
          <input required placeholder="Name" value={form.name} onChange={set('name')} />
          <input placeholder="Image link (https://…)" value={form.image} onChange={set('image')} />
          <select value={form.category} onChange={set('category')}><option>Men</option><option>Women</option><option>Kids</option></select>
          <select value={form.type} onChange={set('type')}><option>Shoes</option><option>Sandals</option><option>Slippers</option><option>Casual</option></select>
          <input required type="number" placeholder="Selling price" value={form.price} onChange={set('price')} />
          <input required type="number" placeholder="MRP (original price)" value={form.mrp} onChange={set('mrp')} />
          <input placeholder="Sizes, comma separated: 6, 7, 8" value={form.sizes} onChange={set('sizes')} />
          <input placeholder="Colors, comma separated: Black, Blue" value={form.colors} onChange={set('colors')} />
          <input required type="number" placeholder="Stock" value={form.stock} onChange={set('stock')} />
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show on home page</label>
          <textarea className="wide" placeholder="Description" value={form.description} onChange={set('description')} />
        </div>
        <div className="row">
          <button className="btn">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Cancel edit</button>}
          {msg && <span className="notice">{msg}</span>}
        </div>
      </form>

      <h3>All products ({products.length})</h3>
      {products.map((p) => (
        <div className="cart-row" key={p._id}>
          <img src={p.image} alt={p.name} />
          <div className="grow"><strong>{p.name}</strong><p className="muted">{p.category} · {p.type} · {rupees(p.price)} · Stock {p.stock}</p></div>
          <button className="btn ghost" onClick={() => startEdit(p)}>Edit</button>
          <button className="btn ghost danger" onClick={() => remove(p._id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

/* ---------- 3. Orders: view and update status ---------- */
function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const load = () => api('/orders').then(setOrders);
  useEffect(() => { load(); }, []);

  // Change the status of one order (this also drives the customer's tracking bar)
  const setStatus = async (id, status) => {
    await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
    load();
  };

  if (orders.length === 0) return <p className="muted">No orders yet.</p>;
  return orders.map((o) => (
    <div className="order" key={o._id}>
      <div className="order-head">
        <strong>#{o._id.slice(-6).toUpperCase()} · {o.user?.name}</strong>
        <span className="muted">{new Date(o.createdAt).toLocaleString('en-IN')} · {o.paymentMethod} · {o.paymentStatus}</span>
        <strong>{rupees(o.total)}</strong>
      </div>
      {o.items.map((i, idx) => <p key={idx} className="line"><span>{i.name} (Size {i.size}, {i.color}) × {i.qty}</span><span>{rupees(i.price * i.qty)}</span></p>)}
      <p className="muted">{o.address.fullName}, {o.address.phone} · {o.address.line}, {o.address.city} {o.address.pincode}</p>
      <label>Status{' '}
        <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
          {['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
    </div>
  ));
}

/* ---------- 4. Coupons: create, switch on/off, delete ---------- */
function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', percent: '', minOrder: '' });
  const [msg, setMsg] = useState('');
  const load = () => api('/coupons').then(setCoupons);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api('/coupons', { method: 'POST', body: { code: form.code, percent: Number(form.percent), minOrder: Number(form.minOrder) || 0 } });
      setForm({ code: '', percent: '', minOrder: '' });
      setMsg('Coupon added');
      load();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <>
      <form className="admin-form" onSubmit={add}>
        <h3>New coupon</h3>
        <div className="form-grid">
          <input required placeholder="Code, e.g. SAVE25" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input required type="number" min="1" max="90" placeholder="Percent off" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />
          <input type="number" placeholder="Minimum order (₹)" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
        </div>
        <div className="row"><button className="btn">Add coupon</button>{msg && <span className="notice">{msg}</span>}</div>
      </form>

      {coupons.map((c) => (
        <div className="cart-row" key={c._id}>
          <div className="grow"><strong>{c.code}</strong> <span className="muted">{c.percent}% off · min ₹{c.minOrder} · {c.active ? 'Active' : 'Paused'}</span></div>
          <button className="btn ghost" onClick={async () => { await api(`/coupons/${c._id}/toggle`, { method: 'PATCH' }); load(); }}>{c.active ? 'Pause' : 'Activate'}</button>
          <button className="btn ghost danger" onClick={async () => { await api(`/coupons/${c._id}`, { method: 'DELETE' }); load(); }}>Delete</button>
        </div>
      ))}
    </>
  );
}
