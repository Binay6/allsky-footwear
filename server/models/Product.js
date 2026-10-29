import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Men', 'Women', 'Kids'], required: true },
    type: { type: String, enum: ['Shoes', 'Sandals', 'Slippers', 'Casual'], required: true },
    price: { type: Number, required: true }, // selling price
    mrp: { type: Number, required: true }, // original price (used to show the discount)
    image: { type: String, default: '' },
    sizes: [Number], // product "variations": sizes available
    colors: [String], // product "variations": colors available
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }, // featured products show on the home page
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
