// src/api/products/route.js

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; // GET mein category populate karne ke liye
import { z } from "zod";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary"; 

export const dynamic = "force-dynamic";

// 🛡️ ZOD VALIDATION SCHEMA
const productZodSchema = z.object({
  title: z.string().min(3, "Product ka title kam az kam 3 characters ka hona chahiye"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description thori detail mein likhein"),
  
  images: z.array(z.string().url("Image URL valid nahi hai")).min(1, "Kam az kam 1 image lazmi hai"),
  videoUrl: z.string().url("Video URL valid nahi hai").optional().or(z.literal("")),
  
  price: z.number({ required_error: "Price lazmi hai" }).min(0, "Price minus mein nahi ho sakti"),
  originalPrice: z.number().optional().nullable(),
  
  affiliateLink: z.string().url("Affiliate link lazmi aur valid hona chahiye"),
  
  source: z.enum(['AmazonAPI', 'Manual_Local', 'Other'], { required_error: "Source batana lazmi hai" }),
  // UPGRADE: externalId ko properly optional aur nullable banaya
  externalId: z.string().optional().nullable(), 
  
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Category ki ID valid nahi hai"),
  
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  
  tags: z.array(z.string()).optional(),
  features: z.array(z.object({
    title: z.string(),
    value: z.string()
  })).optional(),
  
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

// =================================================================
// 📖 GET STORY: "Pagination Ke Sath Products Dikhane Ka Safar"
// =================================================================
// export async function GET(req) {
//   try {
//     console.log("🚀 [GET /api/products] Products fetch karne ki request aayi!");
//     await connectDB();
//     console.log("🔌 Database connect ho gaya.");

//     // 🌟 PAGINATION MAGIC: URL se page aur limit uthao
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page")) || 1; 
//     const limit = parseInt(searchParams.get("limit")) || 10; 

//     // ⚙️ Pagination options set karein
//     const options = {
//       page: page,
//       limit: limit,
//       sort: { createdAt: -1 }, 
//       populate: { path: 'category', select: 'name slug' }, // Category data sath laane ke liye
//     };

//     // 🚀 Purana '.find()' replace ho gaya '.paginate()' se
//     const result = await Product.paginate({}, options);
    
//     console.log(`✅ Page ${page} par ${result.docs.length} products bheje ja rahe hain.`);
    
//     // Naya structured response bhej rahe hain
//     return NextResponse.json({ 
//       success: true, 
//       products: result.docs, // Note: Ab frontend par data.products se loop chalega
//       pagination: {
//         totalDocs: result.totalDocs,
//         limit: result.limit,
//         totalPages: result.totalPages,
//         page: result.page,
//         hasNextPage: result.hasNextPage,
//         hasPrevPage: result.hasPrevPage,
//       }
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error("❌ [GET /api/products] Error aagaya:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }






  // =================================================================
// 📖 GET STORY: "Pagination + Full Database Search (Title & ASIN)"
// =================================================================
// =================================================================
// 📖 GET STORY: "Pagination + Single Product Fetch"
// =================================================================
export async function GET(req) {
  try {
    console.log("🚀 [GET /api/products] Products fetch karne ki request aayi!");
    await connectDB();

    const { searchParams } = new URL(req.url);
    
    // 🌟 NAYA LOGIC: Agar URL mein 'id' aati hai, toh sirf 1 product bhejo!
    const singleId = searchParams.get("id");
    if (singleId) {
      const product = await Product.findById(singleId).populate('category', 'name slug');
      if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      return NextResponse.json({ success: true, product }, { status: 200 });
    }

    // ⚙️ BAQI PURANA PAGINATION LOGIC
    const page = parseInt(searchParams.get("page")) || 1; 
    const limit = parseInt(searchParams.get("limit")) || 10; 
    const search = searchParams.get("search") || ""; 

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { externalId: { $regex: search, $options: "i" } } 
        ]
      };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, 
      populate: { path: 'category', select: 'name slug' }, 
    };

    const result = await Product.paginate(query, options);
    
    return NextResponse.json({ 
      success: true, 
      products: result.docs, 
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ [GET /api/products] Error aagaya:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}




// =================================================================
// 📖 POST STORY: "Naya Product Banane Ka Safar (With Rollback Logic)"
// =================================================================
export async function POST(req) {
  let uploadedImages = [];
  let uploadedVideo = "";

  try {
    console.log("🚀 [POST /api/products] Naya Product add karne ki request aayi!");

    const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
    if (!isTestingMode) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        console.log("⛔ Security check FAIL! Request block kar di gayi.");
        return NextResponse.json({ success: false, error: "Unauthorized Access." }, { status: 401 });
      }
    }
    console.log("🔓 Security check PASS!");

    const body = await req.json();
    console.log(`📦 Frontend se data aaya hai: ${body.title}`);

    const validation = productZodSchema.safeParse(body);
    if (!validation.success) {
      console.log("❌ Zod Validation FAIL:", validation.error.errors[0].message);
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    
    console.log("✅ Zod Validation PASS!");
    const validatedData = validation.data;

    uploadedImages = validatedData.images || [];
    uploadedVideo = validatedData.videoUrl || "";

    let slug = validatedData.slug;
    if (!slug && validatedData.title) {
      slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      console.log(`🔗 Frontend ne slug nahi bheja, humne khud bana liya: ${slug}`);
    }

    await connectDB();
    const product = await Product.create({ ...validatedData, slug });
    console.log(`🎉 Naya Product database mein successfully save ho gaya! ID: ${product._id}`);
    
    return NextResponse.json({ success: true, product }, { status: 201 });
    
  } catch (error) {
    console.error("❌ [POST /api/products] Database fail ho gaya! Rollback shuru kiya ja raha hai...");

    if (uploadedImages.length > 0) {
      console.log(`🧹 Rollback: ${uploadedImages.length} nayi images ko delete kar rahe hain...`);
      await Promise.all(uploadedImages.map(url => deleteMediaFromCloudinary(url)));
    }

    if (uploadedVideo) {
      console.log("🧹 Rollback: Nayi video ko delete kar rahe hain...");
      await deleteMediaFromCloudinary(uploadedVideo);
    }

    // 🌟 UPGRADE: Duplicate Error Handle for BOTH Slug and ASIN
    if (error.code === 11000) {
      console.error("❌ [POST] Duplicate Error:", error.message);
      
      // Agar error mein 'externalId' likha hua aaye, iska matlab duplicate Amazon product hai
      if (error.message.includes('externalId')) {
        return NextResponse.json({ success: false, error: "Yeh Amazon product (ASIN) pehle se database mein mojood hai!" }, { status: 400 });
      }
      // Warna duplicate slug/title ka error hai
      return NextResponse.json({ success: false, error: "Is naam (ya slug) ka product pehle se majood hai. Koi aur naam rakhein." }, { status: 400 });
    }
    
    console.error("❌ [POST /api/products] Server Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

















// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; // GET mein category ka naam dikhane ke liye chahiye
// import { z } from "zod";
// import { deleteMediaFromCloudinary } from "@/lib/cloudinary"; // 🌟 Smart Garbage Collector Import kiya

// // 🛡️ ZOD VALIDATION SCHEMA (Products Ke Liye)
// const productZodSchema = z.object({
//   title: z.string().min(3, "Product ka title kam az kam 3 characters ka hona chahiye"),
//   slug: z.string().optional(),
//   description: z.string().min(10, "Description thori detail mein likhein"),
  
//   images: z.array(z.string().url("Image URL valid nahi hai")).min(1, "Kam az kam 1 image lazmi hai"),
//   videoUrl: z.string().url("Video URL valid nahi hai").optional().or(z.literal("")),
  
//   price: z.number({ required_error: "Price lazmi hai" }).min(0, "Price minus mein nahi ho sakti"),
//   originalPrice: z.number().optional().nullable(),
  
//   affiliateLink: z.string().url("Affiliate link lazmi aur valid hona chahiye"),
  
//   source: z.enum(['AmazonAPI', 'Manual_Local', 'Other'], { required_error: "Source batana lazmi hai" }),
//   externalId: z.string().optional().nullable(),
  
//   category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Category ki ID valid nahi hai"),
  
//   rating: z.number().min(0).max(5).optional(),
//   reviewCount: z.number().min(0).optional(),
  
//   tags: z.array(z.string()).optional(),
//   features: z.array(z.object({
//     title: z.string(),
//     value: z.string()
//   })).optional(),
  
//   isFeatured: z.boolean().optional(),
//   isActive: z.boolean().optional(),
  
//   metaTitle: z.string().optional(),
//   metaDescription: z.string().optional()
// });

// // =================================================================
// // 📖 GET STORY: "Dukaan Ke Saare Products Dikhane Ka Safar"
// // =================================================================
// export async function GET() {
//   try {
//     console.log("🚀 [GET /api/products] Products fetch karne ki request aayi!");
    
//     await connectDB();
//     console.log("🔌 Database connect ho gaya.");

//     const products = await Product.find({}).populate('category', 'name slug').sort({ createdAt: -1 });
    
//     console.log(`✅ Total ${products.length} products mil gaye. Data bheja ja raha hai.`);
//     return NextResponse.json({ success: true, products }, { status: 200 });
    
//   } catch (error) {
//     console.error("❌ [GET /api/products] Error aagaya:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // =================================================================
// // 📖 POST STORY: "Naya Product Banane Ka Safar (With Rollback Logic)"
// // =================================================================
// export async function POST(req) {
//   // 🌟 Rollback variables: Inko bahar banaya taake 'catch' block inko access kar sake
//   let uploadedImages = [];
//   let uploadedVideo = "";

//   try {
//     console.log("🚀 [POST /api/products] Naya Product add karne ki request aayi!");

//     // 🔒 STEP 1: SECURITY GUARD
//     const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
//     if (!isTestingMode) {
//       const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//       if (!token) {
//         console.log("⛔ Security check FAIL! Request block kar di gayi.");
//         return NextResponse.json({ success: false, error: "Unauthorized Access." }, { status: 401 });
//       }
//     }
//     console.log("🔓 Security check PASS! Aage barho.");

//     // 🛡️ STEP 2: DATA READ & ZOD VALIDATION
//     const body = await req.json();
//     console.log(`📦 Frontend se data aaya hai: ${body.title} (Source: ${body.source})`);

//     const validation = productZodSchema.safeParse(body);
//     if (!validation.success) {
//       console.log("❌ Zod Validation FAIL:", validation.error.errors[0].message);
//       return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
//     }
    
//     console.log("✅ Zod Validation PASS! Data bilkul clean hai.");
//     const validatedData = validation.data;

//     // 🌟 STEP 3: ROLLBACK DATA READY KARNA
//     // Zod se pass hone ke baad URLs yahan save kar lo, agar DB fail hua toh inhi ko udana hai
//     uploadedImages = validatedData.images || [];
//     uploadedVideo = validatedData.videoUrl || "";

//     // ⚙️ STEP 4: SLUG GENERATOR
//     let slug = validatedData.slug;
//     if (!slug && validatedData.title) {
//       slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//       console.log(`🔗 Frontend ne slug nahi bheja, humne khud bana liya: ${slug}`);
//     }

//     // 💾 STEP 5: DATABASE MEIN SAVE KARNA (Agar yahan error aaya toh seedha catch mein jayega)
//     await connectDB();
//     const product = await Product.create({ ...validatedData, slug });
//     console.log(`🎉 Naya Product database mein successfully save ho gaya! ID: ${product._id}`);
    
//     return NextResponse.json({ success: true, product }, { status: 201 });
    
//   } catch (error) {
//     // 🚑 THE ROLLBACK STRATEGY (Kachra saaf karna)
//     console.error("❌ [POST /api/products] Database fail ho gaya! Rollback shuru kiya ja raha hai...");

//     // 1. Agar nayi images Cloudinary par upload ho chuki thin, toh unko udao
//     if (uploadedImages.length > 0) {
//       console.log(`🧹 Rollback: ${uploadedImages.length} nayi images ko Cloudinary se delete kar rahe hain...`);
//       // Promise.all use kiya hai taake saari images ek hi waqt mein parallel delete hon (Fast Performance)
//       await Promise.all(uploadedImages.map(url => deleteMediaFromCloudinary(url)));
//     }

//     // 2. Agar nayi video upload ho chuki thi, toh usko bhi udao
//     if (uploadedVideo) {
//       console.log("🧹 Rollback: Nayi video ko Cloudinary se delete kar rahe hain...");
//       await deleteMediaFromCloudinary(uploadedVideo);
//     }

//     // Mongoose Duplicate Slug Error Handling
//     if (error.code === 11000) {
//       console.error("❌ [POST] Duplicate Slug Error:", error.message);
//       return NextResponse.json({ success: false, error: "Is naam (ya slug) ka product pehle se majood hai. Koi aur naam rakhein." }, { status: 400 });
//     }
    
//     console.error("❌ [POST /api/products] Server Error:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }