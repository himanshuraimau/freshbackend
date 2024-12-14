import mongoose from 'mongoose';

const deviceDataSchema = new mongoose.Schema({
  device: {
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
deviceDataSchema.index({ device: 1, createdAt: -1 });

// Add additional indexes for graph queries
deviceDataSchema.index({ createdAt: 1 });
deviceDataSchema.index({ device: 1, createdAt: 1 });

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

export default DeviceData;
