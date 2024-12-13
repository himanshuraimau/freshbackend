import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  deviceData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  temperature: Number,
  humidity: Number,
  location: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

// Add index for faster queries
productSchema.index({ deviceData: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
