import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    percent: { type: Number, required: true }, // e.g. 10 means 10% off
    minOrder: { type: Number, default: 0 }, // cart must be at least this much
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
