import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { z } from "zod";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary";

// 🛡️ ZOD VALIDATION SCHEMA FOR UPDATE
const productUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  description: z.string().min(10).optional(),
  images: z.array(z.string().url()).min(1).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().min(0).optional(),
  originalPrice: z.number().optional().nullable(),
  affiliateLink: z.string().url().optional(),
  source: z.enum(['AmazonAPI', 'Manual_Local', 'Other']).optional(),
  externalId: z.string().optional().nullable(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.object({ title: z.string(), value: z.string() })).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

// 🔒 Helper: Security Check
async function checkAuth(req) {
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  if (isTestingMode) return true;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

// =================================================================
// 📖 PUT STORY: "Product Update Aur Kachra Saaf Karne Ka Safar"
// =================================================================
export async function PUT(req, { params }) {
  let newlyAddedImages = [];
  let newlyAddedVideo = "";

  try {
    const {id} = await params;
    console.log(`🚀 [PUT /api/products/${id}] Update request aayi!`);

    // 🔒 1. SECURITY
    if (!(await checkAuth(req))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // 🛡️ 2. VALIDATION
    const body = await req.json();
    const validation = productUpdateSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    const validatedData = validation.data;

    await connectDB();

    // 🔍 3. PURANA DATA NIKALNA (Comparison ke liye)
    const oldProduct = await Product.findById(id);
    if (!oldProduct) return NextResponse.json({ success: false, error: "Product nahi mila" }, { status: 404 });

    // 🧠 4. SMART DIFFERENCE CALCULATOR
    // A) Nayi uploaded images/videos jo database mein pehle nahi thin (Rollback ke liye)
    if (validatedData.images) {
      newlyAddedImages = validatedData.images.filter(img => !oldProduct.images.includes(img));
    }
    if (validatedData.videoUrl && validatedData.videoUrl !== oldProduct.videoUrl) {
      newlyAddedVideo = validatedData.videoUrl;
    }

    // B) Purani images jo ab Frontend ne nahi bhejin (Yani admin ne delete kar di hain)
    let imagesToDelete = [];
    if (validatedData.images) {
      imagesToDelete = oldProduct.images.filter(img => !validatedData.images.includes(img));
    }
    let videoToDelete = "";
    if (validatedData.videoUrl !== undefined && validatedData.videoUrl !== oldProduct.videoUrl) {
      videoToDelete = oldProduct.videoUrl; // Video change ya remove ho gayi
    }

    // ⚙️ 5. SLUG GENERATOR
    if (validatedData.title && !validatedData.slug) {
      validatedData.slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // 💾 6. DATABASE UPDATE (Pehle database update karenge taake safe rahein)
    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, { returnDocument: 'after' });

    // 🧹 7. THE GARBAGE COLLECTOR (Success ke baad Cloudinary ki safai)
    if (imagesToDelete.length > 0) {
      console.log(`🧹 Cloudinary se ${imagesToDelete.length} purani images udai ja rahi hain...`);
      await Promise.all(imagesToDelete.map(url => deleteMediaFromCloudinary(url)));
    }
    if (videoToDelete) {
      console.log("🧹 Cloudinary se purani video udai ja rahi hai...");
      await deleteMediaFromCloudinary(videoToDelete);
    }

    console.log("🎉 Product update aur kachra saaf ho gaya!");
    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });

  } catch (error) {
    // 🚑 ROLLBACK: Agar database update fail ho gaya, toh NAYI aayi hui images udao
    console.error("❌ Database update fail! Rollback shuru...");
    if (newlyAddedImages.length > 0) await Promise.all(newlyAddedImages.map(url => deleteMediaFromCloudinary(url)));
    if (newlyAddedVideo) await deleteMediaFromCloudinary(newlyAddedVideo);

    if (error.code === 11000) return NextResponse.json({ success: false, error: "Yeh naam pehle se majood hai." }, { status: 400 });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =================================================================
// 📖 DELETE STORY: "Product Aur Uska Saara Wajood Mitaane Ka Safar"
// =================================================================
export async function DELETE(req, { params }) {
  try {
    const {id} = await params;
    console.log(`🚀 [DELETE /api/products/${id}] Delete request aayi!`);

    if (!(await checkAuth(req))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // 1. Pehle product dhundo
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: "Product nahi mila" }, { status: 404 });

    // 2. Product ko database se uda do
    await Product.findByIdAndDelete(id);

    // 3. 🧹 GARBAGE COLLECTION (Cloudinary)
    // Hamara deleteMediaFromCloudinary helper automatically Amazon URLs ko ignore kar dega,
    // isliye hum be-fikar hokar saari images isko bhej sakte hain.
    if (product.images && product.images.length > 0) {
      console.log(`🧹 Product delete ho gaya. Ab Cloudinary media clear kar rahe hain...`);
      await Promise.all(product.images.map(url => deleteMediaFromCloudinary(url)));
    }
    if (product.videoUrl) {
      await deleteMediaFromCloudinary(product.videoUrl);
    }

    console.log("🧨 Boom! Product completely delete ho gaya.");
    return NextResponse.json({ success: true, message: "Product successfully delete ho gaya" }, { status: 200 });

  } catch (error) {
    console.error("❌ [DELETE Error]:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}












// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import { z } from "zod";
// import { deleteMediaFromCloudinary } from "@/lib/cloudinary";

// // 🛡️ ZOD VALIDATION SCHEMA FOR UPDATE
// const productUpdateSchema = z.object({
//   title: z.string().min(3).optional(),
//   slug: z.string().optional(),
//   description: z.string().min(10).optional(),
//   images: z.array(z.string().url()).min(1).optional(),
//   videoUrl: z.string().url().optional().or(z.literal("")),
//   price: z.number().min(0).optional(),
//   originalPrice: z.number().optional().nullable(),
//   affiliateLink: z.string().url().optional(),
//   source: z.enum(['AmazonAPI', 'Manual_Local', 'Other']).optional(),
//   externalId: z.string().optional().nullable(),
//   category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
//   rating: z.number().min(0).max(5).optional(),
//   reviewCount: z.number().min(0).optional(),
//   tags: z.array(z.string()).optional(),
//   features: z.array(z.object({ title: z.string(), value: z.string() })).optional(),
//   isFeatured: z.boolean().optional(),
//   isActive: z.boolean().optional(),
//   metaTitle: z.string().optional(),
//   metaDescription: z.string().optional()
// });

// // 🔒 Helper: Security Check
// async function checkAuth(req) {
//   const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
//   if (isTestingMode) return true;
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   return !!token;
// }

// // =================================================================
// // 📖 PUT STORY: "Product Update Aur Kachra Saaf Karne Ka Safar"
// // =================================================================
// export async function PUT(req, { params }) {
//   let newlyAddedImages = [];
//   let newlyAddedVideo = "";

//   try {
//     const id = params.id;
//     console.log(`🚀 [PUT /api/products/${id}] Update request aayi!`);

//     // 🔒 1. SECURITY
//     if (!(await checkAuth(req))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

//     // 🛡️ 2. VALIDATION
//     const body = await req.json();
//     const validation = productUpdateSchema.safeParse(body);
//     if (!validation.success) return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
//     const validatedData = validation.data;

//     await connectDB();

//     // 🔍 3. PURANA DATA NIKALNA (Comparison ke liye)
//     const oldProduct = await Product.findById(id);
//     if (!oldProduct) return NextResponse.json({ success: false, error: "Product nahi mila" }, { status: 404 });

//     // 🧠 4. SMART DIFFERENCE CALCULATOR
//     // A) Nayi uploaded images/videos (Rollback ke liye)
//     if (validatedData.images) {
//       newlyAddedImages = validatedData.images.filter(img => !oldProduct.images.includes(img));
//     }
//     if (validatedData.videoUrl && validatedData.videoUrl !== oldProduct.videoUrl) {
//       newlyAddedVideo = validatedData.videoUrl;
//     }

//     // B) Purani images jo ab Frontend ne nahi bhejin (Delete karne ke liye)
//     let imagesToDelete = [];
//     if (validatedData.images) {
//       imagesToDelete = oldProduct.images.filter(img => !validatedData.images.includes(img));
//     }
//     let videoToDelete = "";
//     if (validatedData.videoUrl !== undefined && validatedData.videoUrl !== oldProduct.videoUrl) {
//       videoToDelete = oldProduct.videoUrl;
//     }

//     // ⚙️ 5. SLUG GENERATOR
//     if (validatedData.title && !validatedData.slug) {
//       validatedData.slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//     }

//     // 💾 6. DATABASE UPDATE
//     const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, { new: true });

//     // 🧹 7. GARBAGE COLLECTION (Cloudinary safai)
//     if (imagesToDelete.length > 0) {
//       console.log(`🧹 Cloudinary se ${imagesToDelete.length} purani images udai ja rahi hain...`);
//       await Promise.all(imagesToDelete.map(url => deleteMediaFromCloudinary(url)));
//     }
//     if (videoToDelete) {
//       console.log("🧹 Cloudinary se purani video udai ja rahi hai...");
//       await deleteMediaFromCloudinary(videoToDelete);
//     }

//     console.log("🎉 Product update aur kachra saaf ho gaya!");
//     return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });

//   } catch (error) {
//     // 🚑 ROLLBACK
//     console.error("❌ Database update fail! Rollback shuru...");
//     if (newlyAddedImages.length > 0) await Promise.all(newlyAddedImages.map(url => deleteMediaFromCloudinary(url)));
//     if (newlyAddedVideo) await deleteMediaFromCloudinary(newlyAddedVideo);

//     if (error.code === 11000) return NextResponse.json({ success: false, error: "Yeh naam pehle se majood hai." }, { status: 400 });
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // =================================================================
// // 📖 DELETE STORY: "Product Aur Uska Saara Wajood Mitaane Ka Safar"
// // =================================================================
// export async function DELETE(req, { params }) {
//   try {
//     const id = params.id;
//     console.log(`🚀 [DELETE /api/products/${id}] Delete request aayi!`);

//     if (!(await checkAuth(req))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

//     await connectDB();
    
//     // 1. Pehle product ko MongoDB se dhoond kar Node.js ki RAM memory me load kar liya
//     const product = await Product.findById(id);
//     if (!product) return NextResponse.json({ success: false, error: "Product nahi mila" }, { status: 404 });

//     // 2. Product ko MongoDB database se delete kar diya
//     // (Note: Node.js memory mein 'product' object abhi bhi safe pada hua hai!)
//     await Product.findByIdAndDelete(id);

//     // 3. 🧹 GARBAGE COLLECTION (RAM mein majood product object se URLs lekar Cloudinary se delete karna)
//     if (product.images && product.images.length > 0) {
//       console.log(`🧹 Product DB se delete ho gaya. Ab Cloudinary media clear kar rahe hain...`);
//       await Promise.all(product.images.map(url => deleteMediaFromCloudinary(url)));
//     }
//     if (product.videoUrl) {
//       await deleteMediaFromCloudinary(product.videoUrl);
//     }

//     console.log("🧨 Boom! Product database aur Cloudinary dono se delete ho gaya.");
//     return NextResponse.json({ success: true, message: "Product successfully delete ho gaya" }, { status: 200 });

//   } catch (error) {
//     console.error("❌ [DELETE Error]:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }