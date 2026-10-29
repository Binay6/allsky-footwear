import mongoose from 'mongoose';

// One line inside an order (a copy of the product details at the time of purchase)
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  image: String,
  price: Number,
  size: Number,
  color: String,
  qty: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [itemSchema],
    address: {
      fullName: String,
      phone: String,
      line: String,
      city: String,
      pincode: String,
    },
    paymentMethod: { type: String, enum: ['COD', 'UPI', 'Card'], required: true },
    paymentStatus: { type: String, default: 'Pending' }, // "Pending" for COD, "Paid (mock)" otherwise
    subtotal: Number,
    discount: Number,
    couponCode: String,
    shipping: Number,
    total: Number,
    // The order tracking steps. The admin moves an order through these.
    status: {
      type: String,
      enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
