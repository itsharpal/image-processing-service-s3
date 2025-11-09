import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: {
    type: String, 
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Object
  }
}, { timestamps: true });

export const Image = mongoose.model('Image', imageSchema);