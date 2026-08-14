// src/models/SiteSettings.js

// 1. Sab se pehle hum mongoose ko import kar rahe hain taake apna schema (structure) define kar sakein
import mongoose from 'mongoose';

// 2. Ab hum SiteSettings ka blueprint bana rahe hain. 
// Yeh blueprint database ko batayega ke kaunsa data kis format mein aayega.
const siteSettingsSchema = new mongoose.Schema({
  
  // --- GENERAL SETTINGS ---
  // Website ka basic naam aur logo yahan save hoga
  siteName: { 
    type: String, 
    default: 'Verdant Finds' 
  },
  siteLogo: { 
    type: String, // Kal ko agar logo image lagani ho toh uska URL yahan aayega
    default: '' 
  },
  
  // --- HERO SECTION SETTINGS ---
  // Hero section mein jo typewriter effect chalega, uski lines yahan array mein aayengi
  heroTypewriterLines: [{ 
    type: String 
  }],
  // Background images jo fade in/out hongi, unke links is array mein aayenge
  heroImages: [{ 
    type: String 
  }],
  // Typewriter ke niche jo choti si detail/description hai, wo yahan save hogi
  heroDescription: { 
    type: String 
  },
  
  // --- TRUST BADGES ---
  // Jese 500+ Curated Products. Isko array of objects rakha hai taake kal ko 4 badges karne hon toh aasan ho
  trustBadges: [{
    icon: { type: String },  // Badge ke sath agar koi SVG ya icon URL lagana ho
    value: { type: String }, // Jese: "50k+"
    label: { type: String }  // Jese: "Happy Shoppers"
  }],

  // --- FOOTER & CONTACT SETTINGS ---
  // User ka flexible idea: Social links ki array of objects! 
  // Is se naye platforms (TikTok, Pinterest) add karna bohot aasan hoga.
  socialLinks: [{
    platformName: { type: String }, // Jese: "Instagram"
    url: { type: String },          // Jese: "https://instagram.com/..."
    icon: { type: String }          // React Icons ka naam ya image URL
  }],
  
  // Support ya footer ke liye contact details
  contactEmail: { 
    type: String, 
    default: 'hello@verdantfinds.com' 
  },

  // --- SEO SETTINGS ---
  // Jab koi homepage search kare toh Google par kya show ho, wo details yahan aayengi
  metaTitle: { 
    type: String 
  },
  metaDescription: { 
    type: String 
  }

// 3. Timestamps true karne se Mongoose khud bakhud 'createdAt' aur 'updatedAt' fields add kar dega.
}, { timestamps: true });

// 4. Aakhir mein hum model ko export kar rahe hain. 
// "mongoose.models.SiteSettings" is liye check kar rahe hain taake Next.js ke hot-reload 
// hone par bar bar naya model na bane aur error na aaye.
export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);