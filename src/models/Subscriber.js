// 1. Mongoose aur Pagination plugin ko import kar rahe hain
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// 2. Subscriber ka schema define kar rahe hain
const subscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true }); 

// 🌟 Pagination plugin apply kiya
subscriberSchema.plugin(mongoosePaginate);

// 4. Model ko export kar rahe hain safely
export const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);










// // src/models/Subscriber.js

// // 1. Mongoose ko import kar rahe hain
// import mongoose from 'mongoose';

// // 2. Subscriber ka schema define kar rahe hain
// const subscriberSchema = new mongoose.Schema({
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true, // Ek email sirf ek hi baar database mein save ho sakti hai
//     lowercase: true, // Agar user capital letters mein "EMAIL@gmail.com" likhe, toh backend usko chota kar dega
//     trim: true // Agar user email ke aage peche ghalti se space de de, toh yeh spaces hata dega
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true // Shuru mein jab koi subscribe karega toh wo active hoga. 
//     // Unsubscribe link click karne par API isko 'false' kar degi.
//   }

// // 3. timestamps: true karne se Mongoose khud bakhud 'createdAt' add karega, 
// // jisko hum admin panel mein as a 'Subscribed At' date (kis din subscribe kiya) show karenge.
// }, { timestamps: true }); 

// // 4. Model ko export kar rahe hain safely (Next.js hot reload issues se bachne ke liye)
// export const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);