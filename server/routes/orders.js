// ---------- ORDER ROUTES ----------
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Free delivery above ₹999, otherwise ₹99. (The frontend uses the same rule.)
const shippingFor = (subtotal) => (subtotal >= 999 ? 0 : 99);

// POST /api/orders  — place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, address, paymentMethod, couponCode } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Your cart is empty' });
    if (!address?.fullName || !address?.phone || !address?.line || !address?.city || !address?.pincode) {
      return res.status(400).json({ message: 'Please fill in the full delivery address' });
    }

    // SECURITY: never trust prices sent by the browser. Look each product up in the database.
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: 'A product in your cart no longer exists' });
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Only ${product.stock} left of ${product.name}` });
      }
      orderItems.push({
        product: product._id, name: product.name, image: product.image,
        price: product.price, size: item.size, color: item.color, qty: item.qty,
      });
      subtotal += product.price * item.qty;
    }

    // Apply the coupon (if one was given)
    let discount = 0;
    let appliedCode = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = Math.round((subtotal * coupon.percent) / 100);
        appliedCode = coupon.code;
      }
    }

    const shipping = shippingFor(subtotal - discount);
    const total = subtotal - discount + shipping;

    // Reduce stock now that the order is confirmed
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    const order = await Order.create({
      user: req.user._id, items: orderItems, address, paymentMethod,
      // Mock payment: UPI and Card are marked paid instantly, COD is paid on delivery
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid (mock)',
      subtotal, discount, couponCode: appliedCode, shipping, total,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/mine  — the logged-in customer's order history
router.get('/mine', protect, async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

// ----- Admin only -----
// GET /api/orders  — every order in the shop
router.get('/', protect, adminOnly, async (req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
});

// PUT /api/orders/:id/status  — move an order to Packed / Shipped / Delivered / Cancelled
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // If an admin cancels, put the stock back
  if (req.body.status === 'Cancelled' && order.status !== 'Cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }
  order.status = req.body.status;
  // Cash orders become "Paid" once delivered
  if (order.status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid (cash)';
  await order.save();
  res.json(order);
});

export default router;
