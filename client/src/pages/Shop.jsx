// ---------- SHOP PAGE: product catalog with filters ----------
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  // The filters live in the URL (e.g. /shop?category=Men&type=Shoes), so links and the back button work
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read each filter from the URL
  const category = params.get('category') || '';
  const type = params.get('type') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';
  const maxPrice = params.get('maxPrice') || '';

  // Change one filter in the URL (an empty value removes it)
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  // Whenever the URL filters change, ask the server for matching products
  useEffect(() => {
    setLoading(true);
    api(`/products?${params.toString()}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="shop">
      {/* Left column: filters */}
      <aside className="filters">
        <h3>Filters</h3>

        <label>Category
          <select value={category} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All</option>
            <option>Men</option><option>Women</option><option>Kids</option>
          </select>
        </label>

        <label>Type
          <select value={type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All</option>
            <option>Shoes</option><option>Sandals</option><option>Slippers</option><option>Casual</option>
          </select>
        </label>

        <label>Max price
          <select value={maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)}>
            <option value="">Any</option>
            <option value="500">Up to ₹500</option>
            <option value="1000">Up to ₹1,000</option>
            <option value="2000">Up to ₹2,000</option>
          </select>
        </label>

        <label>Sort by
          <select value={sort} onChange={(e) => setFilter('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>

        <button className="btn ghost" onClick={() => setParams({})}>Clear filters</button>
      </aside>

      {/* Right column: the products */}
      <section>
        <h2>{search ? `Results for "${search}"` : category ? `${category}'s footwear` : 'All footwear'}</h2>
        {loading ? <p className="muted">Loading…</p> : products.length === 0 ? (
          <p className="muted">No products match these filters. Try clearing a filter.</p>
        ) : (
          <div className="grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>
    </div>
  );
}
