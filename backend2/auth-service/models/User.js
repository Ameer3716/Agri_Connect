import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      // Password is not required if googleId is present
      required: function() { return !this.googleId; },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    userType: {
      type: String,
      required: [true, 'Please specify your user type'],
      enum: ['Farmer', 'Buyer', 'Admin'],
      default: 'Farmer', // Or 'Buyer' if that's your general default
    },
    googleId: { // For Google OAuth
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but unique if present
    },
    // ... (isActive, etc.)
  },
  { timestamps: true }
);

// Hash password ONLY if it's provided and modified (for standard signup/password changes)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) { // Added !this.password check
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  if (!userPassword) return false; // If user has no password (e.g. Google signup only)
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
export default User;