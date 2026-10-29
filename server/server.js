// ---------- SERVER ENTRY POINT ----------
// Run this file to start the backend:  npm run dev
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import couponRoutes from './routes/coupons.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

dotenv.config(); // loads the values from the .env file
connectDB();

const app = express();
app.use(cors()); // lets the React app (a different port) call this server
app.use(express.json()); // lets us read JSON sent in request bodies

// Each line below says: "requests starting with this URL go to that file"
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (req, res) => res.json({ message: 'All Sky API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
