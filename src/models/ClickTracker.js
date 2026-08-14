import mongoose from 'mongoose';

const clickTrackerSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  }, // Category yahan isliye save kar rahe hain taake Dashboard mein grouping fast ho
  
  // Optional Security (Agar aap spam clicks rokna chahein baad mein)
  ipAddress: { type: String, default: 'unknown' },
  
}, { timestamps: true }); // 'createdAt' field humein batayegi ke click kis waqt/din hua

export default mongoose.models.ClickTracker || mongoose.model('ClickTracker', clickTrackerSchema);