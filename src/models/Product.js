// File Path: src/models/Product.js
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  videoUrl: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  affiliateLink: { type: String, required: true },
  source: { 
    type: String, 
    required: true,
    enum: ['AmazonAPI', 'Manual_Local', 'Other'] 
  },
  externalId: { 
    type: String, 
    default: null,
    unique: true, 
    sparse: true  
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  features: [{
    title: { type: String },
    value: { type: String } 
  }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalClicks: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String }

}, { timestamps: true });

// 🚀 OPTIMIZATION MAGIC: Text Indexing for Lightning Fast Search
// MongoDB automatically Title aur Tags ko analyze karke dictionary bana lega.
productSchema.index({
  title: 'text',
  tags: 'text'
}, {
  name: 'SearchIndex', 
  weights: { title: 10, tags: 5 } // Title ko zyada importance (weight) de rahe hain
});

// Pagination plugin
productSchema.plugin(mongoosePaginate);

export default mongoose.models.Product || mongoose.model('Product', productSchema);
















// import mongoose from 'mongoose';
// import mongoosePaginate from 'mongoose-paginate-v2'; // Pagination plugin

// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   slug: { type: String, required: true, unique: true },
//   description: { type: String, required: true },
//   images: [{ type: String, required: true }],
//   videoUrl: { type: String },
//   price: { type: Number, required: true },
//   originalPrice: { type: Number },
//   affiliateLink: { type: String, required: true },
//   source: { 
//     type: String, 
//     required: true,
//     enum: ['AmazonAPI', 'Manual_Local', 'Other'] 
//   },
//   externalId: { 
//     type: String, 
//     default: null,
//     unique: true, // ASIN ab unique hoga!
//     sparse: true  // Null values par duplicate error nahi aayega!
//   },
//   category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//   rating: { type: Number, default: 0 },
//   reviewCount: { type: Number, default: 0 },
//   tags: [{ type: String }],
//   features: [{
//     title: { type: String },
//     value: { type: String } 
//   }],
//   isFeatured: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true },
//   totalClicks: { type: Number, default: 0 },
//   metaTitle: { type: String },
//   metaDescription: { type: String }

// }, { timestamps: true });

// // Pagination apply ki
// productSchema.plugin(mongoosePaginate);

// export default mongoose.models.Product || mongoose.model('Product', productSchema);



















// import mongoose from 'mongoose';

// const productSchema = new mongoose.Schema({
//   // 1. Basic Info & Media
//   title: { 
//     type: String, 
//     required: true 
//   },
//   slug: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   description: { 
//     type: String, 
//     required: true 
//   },
//   images: [{ 
//     type: String, // Ab yeh array of strings hai taake multiple images show ho sakein
//     required: true 
//   }],
//   videoUrl: { 
//     type: String // YouTube ya Cloudinary ka link (optional)
//   },

//   // 2. Pricing & Links
//   price: { 
//     type: Number, 
//     required: true 
//   },
//   originalPrice: { 
//     type: Number 
//   },
//   affiliateLink: { 
//     type: String, 
//     required: true 
//   },

//   // 3. Source & Identification
//   source: { 
//     type: String, 
//     required: true,
//     enum: ['AmazonAPI', 'Manual_Local', 'Other'] // Strict control ke data kahan se aaya
//   },
//   externalId: { 
//     type: String, // ASIN ya external API ID. Manual ke liye null hoga.
//     default: null 
//   },

//   // 4. Relationships, Details & Social Proof
//   category: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Category', 
//     required: true 
//   },
//   rating: { 
//     type: Number,
//     default: 0 
//   },
//   reviewCount: { 
//     type: Number,
//     default: 0 
//   },
//   tags: [{ 
//     type: String 
//   }],
//   features: [{
//     title: { type: String }, // e.g., "Color"
//     value: { type: String }  // e.g., "Black"
//   }],

//   // 5. Control & Tracking
//   isFeatured: { 
//     type: Boolean, 
//     default: false 
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true // Agar product out of stock ya API se hatt jaye toh isko false kar denge
//   },
//   totalClicks: { 
//     type: Number, 
//     default: 0 // Analytics ke liye ke affiliate link par kitni baar click hua
//   },

//   // 6. SEO Fields
//   metaTitle: { type: String },
//   metaDescription: { type: String }

// }, { timestamps: true });

// export default mongoose.models.Product || mongoose.model('Product', productSchema);