// ---------- SEED SCRIPT ----------
// Fills the database with sample data so the shop is not empty.
// Run it with:  npm run seed     (WARNING: it deletes existing products, orders, coupons and users first)
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Order from './models/Order.js';

dotenv.config();

// Makes a simple placeholder picture with the product name on it.
// Later you can replace these with real photo links from the admin panel.
const img = (text, bg = 'E3ECFB', fg = '1F4FBF') =>
  `https://placehold.co/600x600/${bg}/${fg}?text=${encodeURIComponent(text)}`;

const SHOE = [6, 7, 8, 9, 10, 11];
const KIDS = [1, 2, 3, 4, 5, 6];

const products = [
  { name: 'Cloudstep Runner', category: 'Men', type: 'Shoes', price: 1899, mrp: 2499, sizes: SHOE, colors: ['Black', 'Sky Blue'], stock: 25, featured: true, description: 'Lightweight everyday running shoe with a cushioned sole and breathable mesh upper.' },
  { name: 'Trail Master', category: 'Men', type: 'Shoes', price: 2299, mrp: 2999, sizes: SHOE, colors: ['Olive', 'Grey'], stock: 18, featured: true, description: 'Grippy outsole and a sturdy upper built for muddy paths and weekend treks.' },
  { name: 'Skyline Sandals', category: 'Men', type: 'Sandals', price: 799, mrp: 1099, sizes: SHOE, colors: ['Brown', 'Black'], stock: 40, featured: false, description: 'Adjustable velcro straps and a soft footbed for all-day comfort.' },
  { name: 'Breeze Flip-Flops', category: 'Men', type: 'Slippers', price: 349, mrp: 499, sizes: SHOE, colors: ['Navy', 'Grey'], stock: 60, featured: false, description: 'Quick-dry flip-flops for the beach, pool or a trip to the corner shop.' },
  { name: 'Urban Canvas', category: 'Men', type: 'Casual', price: 1299, mrp: 1799, sizes: SHOE, colors: ['White', 'Navy'], stock: 30, featured: true, description: 'Classic canvas sneakers that go with jeans, shorts and everything else.' },
  { name: 'Aurora Flats', category: 'Women', type: 'Casual', price: 999, mrp: 1499, sizes: [4, 5, 6, 7, 8], colors: ['Blush', 'Black'], stock: 35, featured: true, description: 'Soft ballet flats with a cushioned insole, easy to wear from office to evening.' },
  { name: 'Petal Sandals', category: 'Women', type: 'Sandals', price: 899, mrp: 1299, sizes: [4, 5, 6, 7, 8], colors: ['Gold', 'Tan'], stock: 28, featured: false, description: 'Cushioned strappy sandals with a light, flexible sole.' },
  { name: 'Cozy Cloud Slides', category: 'Women', type: 'Slippers', price: 449, mrp: 699, sizes: [4, 5, 6, 7, 8], colors: ['Lilac', 'Cream'], stock: 50, featured: false, description: 'Extra soft slides for home and short walks.' },
  { name: 'Stride Sneakers', category: 'Women', type: 'Shoes', price: 1799, mrp: 2399, sizes: [4, 5, 6, 7, 8], colors: ['White', 'Pink'], stock: 22, featured: true, description: 'Clean low-top sneakers with memory-foam insoles for long days on your feet.' },
  { name: 'Mini Dash', category: 'Kids', type: 'Shoes', price: 999, mrp: 1399, sizes: KIDS, colors: ['Red', 'Blue'], stock: 30, featured: false, description: 'Light school-and-play shoes with easy velcro closure.' },
  { name: 'Puddle Jumpers', category: 'Kids', type: 'Sandals', price: 599, mrp: 849, sizes: KIDS, colors: ['Yellow', 'Green'], stock: 4, featured: false, description: 'Water-friendly sandals with a non-slip sole for splashy days.' },
  { name: 'Tiny Toes Slippers', category: 'Kids', type: 'Slippers', price: 299, mrp: 449, sizes: KIDS, colors: ['Blue', 'Pink'], stock: 45, featured: false, description: 'Soft, squishy slippers that stay on little feet.' },
].map((p) => ({ ...p, image: img(p.name) }));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.all([User.deleteMany(), Product.deleteMany(), Coupon.deleteMany(), Order.deleteMany()]);

  // Two accounts you can log in with
  await User.create([
    { name: 'Shop Admin', email: 'admin@allsky.com', password: await bcrypt.hash('admin123', 10), isAdmin: true },
    { name: 'Demo Customer', email: 'user@allsky.com', password: await bcrypt.hash('user123', 10) },
  ]);

  await Product.insertMany(products);

  await Coupon.insertMany([
    { code: 'WELCOME10', percent: 10, minOrder: 0 },
    { code: 'FESTIVE15', percent: 15, minOrder: 999 },
    { code: 'SKY20', percent: 20, minOrder: 1999 },
  ]);

  console.log('Done! Admin: admin@allsky.com / admin123   Customer: user@allsky.com / user123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
