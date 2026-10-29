// ---------- API HELPER ----------
// One small function that every page uses to talk to the backend.
// Usage:  const products = await api('/products');
//         await api('/orders', { method: 'POST', body: { ... } });
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token'); // saved at login time
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // If we have a token, send it so the server knows who we are
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  // If the server answered with an error, throw it so the page can show the message
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// Formats a number as Indian rupees, e.g. 1899 -> ₹1,899
export const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');
