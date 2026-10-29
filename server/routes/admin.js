// ---------- ADMIN DASHBOARD NUMBERS ----------
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats  — the "sales report" cards on the dashboard
router.get('/stats', protect, adminOnly, async (req, res) => {
  const orders = await Order.find();
  const live = orders.filter((o) => o.status !== 'Cancelled'); // ignore cancelled orders for revenue
  res.json({
    revenue: live.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
    pending: orders.filter((o) => ['Placed', 'Packed'].includes(o.status)).length,
    customers: await User.countDocuments({ isAdmin: false }),
    products: await Product.countDocuments(),
    lowStock: await Product.find({ stock: { $lte: 5 } }).select('name stock'), // 5 or fewer left
  });
});

export default router;
