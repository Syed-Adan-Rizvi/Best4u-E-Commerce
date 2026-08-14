import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // 🌟 Pagination Plugin Import Kiya

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true // URL ke liye jaise: /category/bed-and-bath
  },
  // SEO Fields
  metaTitle: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

// 🌟 Pagination apply kiya
categorySchema.plugin(mongoosePaginate);

// Next.js mein baar baar server reload hone par model overwrite na ho, uske liye yeh check zaroori hai
export default mongoose.models.Category || mongoose.model('Category', categorySchema);











// import mongoose from 'mongoose';

// const categorySchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true 
//   },
//   slug: { 
//     type: String, 
//     required: true, 
//     unique: true // URL ke liye jaise: /category/bed-and-bath
//   },
//   // SEO Fields
//   metaTitle: { type: String },
//   metaDescription: { type: String }
// }, { timestamps: true });

// // Next.js mein baar baar server reload hone par model overwrite na ho, uske liye yeh check zaroori hai
// export default mongoose.models.Category || mongoose.model('Category', categorySchema);