import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// protect: only logged-in users may continue
export async function protect(req, res, next) {
  try {
    // The browser sends:  Authorization: Bearer <token>
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Please log in first' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if token is fake/expired
    req.user = await User.findById(decoded.id).select('-password'); // attach user to the request
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next(); // go to the next function (the route handler)
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

// adminOnly: must be used AFTER protect. Blocks normal customers.
export function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admins only' });
  next();
}
