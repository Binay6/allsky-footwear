import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // stored as a hash, never plain text
    isAdmin: { type: Boolean, default: false }, // true = can open the admin panel
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export default mongoose.model('User', userSchema);
