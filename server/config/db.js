// ---------- DATABASE CONNECTION ----------
// Mongoose is the library that lets us talk to MongoDB using JavaScript objects.
import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    // MONGO_URI comes from the .env file (your Atlas connection string)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // stop the server, nothing works without a database
  }
}
