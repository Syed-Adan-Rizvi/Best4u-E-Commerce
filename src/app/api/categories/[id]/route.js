import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { z } from "zod"; 

// 🛡️ ZOD VALIDATION SCHEMA FOR UPDATE (Sab fields optional hoti hain)
const categoryUpdateSchema = z.object({
  name: z.string().min(3, "Category ka naam kam az kam 3 characters ka hona chahiye").max(50, "Naam bohot lamba hai").optional(),
  slug: z.string().optional(),
  metaTitle: z.string().max(60, "SEO Title 60 characters se lamba na ho").optional(),
  metaDescription: z.string().max(160, "SEO Description 160 characters se lambi na ho").optional(),
});

// 🔒 Helper Function: Security Check
async function checkAuth(req) {
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  if (isTestingMode) return true; 
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token; 
}

// =================================================================
// 📖 PUT STORY: "Purani Category Ko Update Karne Ka Safar"
// =================================================================
export async function PUT(req, { params }) {
  try {
    const {id} = await params;
    console.log(`🚀 [PUT /api/categories/${id}] Update request aayi!`);

    // 🔒 STEP 1: SECURITY CHECK
    const isAuthorized = await checkAuth(req);
    if (!isAuthorized) {
      console.log("⛔ Security check FAIL!");
      return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
    }

    // 🛡️ STEP 2: ZOD VALIDATION
    const body = await req.json();
    console.log("📦 Update karne ke liye yeh data aaya:", body);

    const validation = categoryUpdateSchema.safeParse(body);
    if (!validation.success) {
      console.log("❌ Zod Validation FAIL:", validation.error.errors[0].message);
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    console.log("✅ Zod Validation PASS!");
    const validatedData = validation.data;

    // ⚙️ STEP 3: SLUG UPDATE LOGIC
    if (validatedData.name && !validatedData.slug) {
      validatedData.slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      console.log(`🔗 Naam change hua toh naya slug bana liya: ${validatedData.slug}`);
    }

    // 💾 STEP 4: DATABASE UPDATE
    await connectDB();
    const category = await Category.findByIdAndUpdate(id, validatedData, { new: true });
    
    if (!category) {
      console.log("⚠️ Error: Category ID database mein nahi mili.");
      return NextResponse.json({ success: false, error: "Category nahi mili" }, { status: 404 });
    }
    
    console.log("🎉 Category successfully update ho gayi!");
    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    console.error("❌ [PUT Error]:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =================================================================
// 📖 DELETE STORY: "Category Ko Hamesha Ke Liye Udane Ka Safar"
// =================================================================
export async function DELETE(req, { params }) {
  try {
    const {id} = await params;
    console.log(`🚀 [DELETE /api/categories/${id}] Delete request aayi!`);

    // 🔒 STEP 1: SECURITY CHECK
    const isAuthorized = await checkAuth(req);
    if (!isAuthorized) {
      console.log("⛔ Security check FAIL!");
      return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
    }

    // 🗑️ STEP 2: DATABASE SE DELETE KARNA
    await connectDB();
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      console.log("⚠️ Error: Jo ID delete karni thi wo Database mein thi hi nahi.");
      return NextResponse.json({ success: false, error: "Category nahi mili" }, { status: 404 });
    }
    
    console.log("🧨 Boom! Category hamesha ke liye delete ho gayi.");
    return NextResponse.json({ success: true, message: "Category successfully delete ho gayi" }, { status: 200 });
  } catch (error) {
    console.error("❌ [DELETE Error]:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

















// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt"; // Security Token Check
// import connectDB from "@/lib/db";
// import Category from "@/models/Category";
// import { z } from "zod"; // 🌟 Zod Import

// // 🌟 Zod Validation Schema for UPDATE (PUT)
// // Update (PUT) mein hum sab kuch 'optional()' rakhte hain kyunke 
// // ho sakta hai admin sirf 'name' change kare, ya sirf SEO details.
// const categoryUpdateSchema = z.object({
//   name: z.string().min(3, "Category ka naam kam az kam 3 characters ka hona chahiye").max(50, "Naam bohot lamba hai").optional(),
//   slug: z.string().optional(),
//   metaTitle: z.string().max(60, "SEO Title 60 characters se lamba na ho").optional(),
//   metaDescription: z.string().max(160, "SEO Description 160 characters se lambi na ho").optional(),
// });

// // Helper Function: Security Check Code repeat hone se bachane ke liye
// async function checkAuth(req) {
//   const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
//   if (isTestingMode) return true; // Testing mode ON hai toh aage jane do
  
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   return !!token; // Agar token hai toh true, warna false
// }

// // PUT - Existing category ko update karna (STRICTLY SECURE & VALIDATED)
// export async function PUT(req, { params }) {
//   try {
//     // 1. API LEVEL SECURITY CHECK
//     const isAuthorized = await checkAuth(req);
//     if (!isAuthorized) {
//       return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
//     }

//     const id = params.id;
//     const body = await req.json();

//     // 🌟 2. ZOD VALIDATION APPLY (Database se pehle)
//     const validation = categoryUpdateSchema.safeParse(body);
    
//     if (!validation.success) {
//       // Agar data ghalat hai toh yahi se error wapis bhej do
//       return NextResponse.json({ 
//         success: false, 
//         error: validation.error.errors[0].message 
//       }, { status: 400 });
//     }

//     const validatedData = validation.data; // Yeh ab 100% safe aur clean data hai

//     // 3. Slug Logic (Zod wale clean data par apply kiya)
//     if (validatedData.name && !validatedData.slug) {
//       validatedData.slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//     }

//     // 4. Main Database Logic
//     await connectDB();
//     const category = await Category.findByIdAndUpdate(id, validatedData, { new: true });
    
//     if (!category) {
//       return NextResponse.json({ success: false, error: "Category nahi mili" }, { status: 404 });
//     }
    
//     return NextResponse.json({ success: true, category }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // DELETE - Category ko udana (STRICTLY SECURE)
// export async function DELETE(req, { params }) {
//   try {
//     // 1. API LEVEL SECURITY CHECK
//     const isAuthorized = await checkAuth(req);
//     if (!isAuthorized) {
//       return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
//     }

//     // 2. Main Logic
//     await connectDB();
//     const id = params.id;

//     const category = await Category.findByIdAndDelete(id);
    
//     if (!category) {
//       return NextResponse.json({ success: false, error: "Category nahi mili" }, { status: 404 });
//     }
    
//     return NextResponse.json({ success: true, message: "Category successfully delete ho gayi" }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }