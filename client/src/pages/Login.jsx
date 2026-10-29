// ---------- LOGIN / REGISTER PAGE (one page, two modes) ----------
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      // Go back to the page the user wanted (e.g. checkout), or home
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form className="auth" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
      {mode === 'register' && <input required placeholder="Full name" value={form.name} onChange={set('name')} />}
      <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} />
      <input required type="password" placeholder="Password (6+ characters)" value={form.password} onChange={set('password')} />
      {error && <p className="out">{error}</p>}
      <button className="btn">{mode === 'login' ? 'Log in' : 'Create account'}</button>
      <button type="button" className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
      </button>
      <p className="muted">Demo logins after seeding: admin@allsky.com / admin123 · user@allsky.com / user123</p>
    </form>
  );
}
