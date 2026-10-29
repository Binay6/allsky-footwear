// ---------- PRODUCT ROUTES ----------
import express from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products?category=Men&type=Shoes&search=run&minPrice=500&maxPrice=2000&sort=price_asc
// Anyone can browse products (no login needed). Filters are optional.
router.get('/', async (req, res) => {
  const { category, type, search, minPrice, maxPrice, sort, featured } = req.query;

  // Build the MongoDB filter step by step, only adding what the user asked for
  const filter = {};
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (featured) filter.featured = true;
  if (search) filter.name = { $regex: search, $options: 'i' }; // 'i' = ignore upper/lower case
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice); // greater than or equal
    if (maxPrice) filter.price.$lte = Number(maxPrice); // less than or equal
  }

  // Sorting options
  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 } };
  const products = await Product.find(filter).sort(sorts[sort] || { createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id  (one product, for the detail page)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(404).json({ message: 'Product not found' }); // happens when the id format is invalid
  }
});

// ----- Admin only: create, update, delete -----
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    // { new: true } returns the updated product instead of the old one
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

export default router;
