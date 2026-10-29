// ---------- COUPON ROUTES ----------
import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// POST /api/coupons/validate  { code, subtotal }
// Used at checkout when the customer clicks "Apply".
router.post('/validate', protect, async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), active: true });
  if (!coupon) return res.status(400).json({ message: 'This coupon code is not valid' });
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ message: `Add items worth ₹${coupon.minOrder} to use this coupon` });
  }
  const discount = Math.round((subtotal * coupon.percent) / 100);
  res.json({ code: coupon.code, percent: coupon.percent, discount });
});

// ----- Admin only -----
router.get('/', protect, adminOnly, async (req, res) => {
  res.json(await Coupon.find().sort({ createdAt: -1 }));
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Coupon.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'That code already exists' : err.message });
  }
});

// Turn a coupon on/off without deleting it
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  coupon.active = !coupon.active;
  await coupon.save();
  res.json(coupon);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

export default router;
