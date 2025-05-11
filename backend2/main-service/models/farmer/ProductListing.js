import mongoose from 'mongoose';

const productListingSchema = new mongoose.Schema(
  {
    farmer: { // Link to the User (Farmer) who created this listing
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // Consider an enum for categories if you want them predefined
      // enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Livestock', 'Other']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: { // e.g., kg, quintal, dozen, liter, piece
      type: String,
      required: [true, 'Unit for quantity is required'],
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    imageUrl: { // URL to the product image
      type: String,
      trim: true,
      // default: '/images/placeholder.png' // A default placeholder image path
    },
    location: { // Farm location or pickup point
      type: String,
      trim: true,
    },
    status: { // Listing status
      type: String,
      enum: ['active', 'inactive', 'sold'],
      default: 'active',
    },
    // dateListed will be handled by timestamps.createdAt
  },
  {
    timestamps: true, // Adds createdAt (for dateListed) and updatedAt
  }
);

// Index for efficient querying
productListingSchema.index({ farmer: 1, status: 1, createdAt: -1 });
productListingSchema.index({ category: 1, status: 1 }); // For marketplace browsing

const ProductListing = mongoose.model('ProductListing', productListingSchema);

export default ProductListing;