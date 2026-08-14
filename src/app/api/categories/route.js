import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { z } from "zod"; 

export const dynamic = "force-dynamic";

// 🛡️ ZOD VALIDATION SCHEMA: Kachra data block karne ke liye
const categoryZodSchema = z.object({
  name: z.string().min(3, "Category ka naam kam az kam 3 characters ka hona chahiye").max(50, "Naam bohot lamba hai"),
  slug: z.string().optional(),
  metaTitle: z.string().max(60, "SEO Title 60 characters se lamba na ho").optional(),
  metaDescription: z.string().max(160, "SEO Description 160 characters se lambi na ho").optional(),
});

// =================================================================
// 📖 GET STORY: "Pagination Ke Sath Categories Dikhane Ka Safar"
// =================================================================
// export async function GET(req) { // 🌟 req parameter add kiya
//   try {
//     console.log("🚀 [GET /api/categories] Request aayi hai!");
    
//     await connectDB();
//     console.log("🔌 Database connect ho gaya.");

//     // 🌟 PAGINATION MAGIC: URL se page aur limit uthao
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page")) || 1; 
//     const limit = parseInt(searchParams.get("limit")) || 10; 

//     const options = {
//       page: page,
//       limit: limit,
//       sort: { createdAt: -1 }, 
//     };

//     // 🚀 Purana '.find()' replace ho gaya '.paginate()' se
//     const result = await Category.paginate({}, options);
//     console.log(`✅ Page ${page} par ${result.docs.length} categories bheji ja rahi hain.`);
    
//     // Naya structured response
//     return NextResponse.json({ 
//       success: true, 
//       categories: result.docs, 
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
//     console.error("❌ [GET /api/categories] Error aagaya:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }



// =================================================================
// 📖 GET STORY: "Pagination + Full Database Search" (Public/Admin adaptable)
// =================================================================
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1; 
    
    // 🌟 CHANGE 1: Default limit ko adapt kiya taake public shop sari categories le sake
    // Agar frontend se limit=-1 aaye, toh hum limit ko 100000000 set kar denge (effectively unlimited)
    let limit = parseInt(searchParams.get("limit"));
    if (isNaN(limit)) {
        limit = 10; // Default for Admin Panel
    }
    
    const search = searchParams.get("search") || "";

    // 🔍 Search Logic
    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    // ⚙️ Pagination/Sorting Options
    const options = {
      page: page,
      // 🌟 CHANGE 2: Agar limit -1 ho toh effectively pagination bypass ho jati hai paginate() mein
      limit: limit === -1 ? 1000000 : limit, // Mongoose paginate high limit se handle karta hai
      sort: { createdAt: -1 }, 
      lean: true
    };

    // 🚀 Data Fetching
    const result = await Category.paginate(query, options);
    
    // 🌟 CHANGE 3: Response structure adaptable banaya
    const responseData = {
      success: true,
      categories: result.docs,
    };

    // Pagination info sirf tabhi bhejo agar actually limit lagayi ho (Admin use)
    if (limit !== -1) {
      responseData.pagination = {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    }
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}




// =================================================================
// 📖 POST STORY: "Nayi Category Banane Ka Safar"
// =================================================================
export async function POST(req) {
  try {
    console.log("🚀 [POST /api/categories] Nayi category banane ki request aayi!");

    // 🔒 STEP 1: SECURITY GUARD (Sirf admin allow hai)
    const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
    if (!isTestingMode) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        console.log("⛔ Security check FAIL! Request block kar di gayi.");
        return NextResponse.json({ success: false, error: "Unauthorized Access." }, { status: 401 });
      }
    }
    console.log("🔓 Security check PASS! Aage barho.");

    // 🛡️ STEP 2: DATA READ & ZOD VALIDATION
    const body = await req.json();
    console.log("📦 Frontend se yeh data aaya:", body);

    const validation = categoryZodSchema.safeParse(body);
    if (!validation.success) {
      console.log("❌ Zod Validation FAIL:", validation.error.errors[0].message);
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    console.log("✅ Zod Validation PASS! Data bilkul clean hai.");
    const validatedData = validation.data;

    // ⚙️ STEP 3: SLUG GENERATOR (URL friendly naam)
    let slug = validatedData.slug;
    if (!slug && validatedData.name) {
      slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      console.log(`🔗 Frontend ne slug nahi bheja, humne khud bana liya: ${slug}`);
    }

    // 💾 STEP 4: DATABASE MEIN SAVE KARNA
    await connectDB();
    const category = await Category.create({ ...validatedData, slug });
    console.log(`🎉 Nayi Category database mein successfully save ho gayi! ID: ${category._id}`);
    
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    
    // 🌟 UPGRADE: Duplicate Category Error Handle (Agar same naam ya slug ki category pehle se ho)
    if (error.code === 11000) {
      console.error("❌ [POST] Duplicate Slug Error:", error.message);
      return NextResponse.json({ success: false, error: "Is naam (ya slug) ki category pehle se majood hai. Koi aur naam rakhein." }, { status: 400 });
    }

    console.error("❌ [POST /api/categories] Server Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


















// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// import Category from "@/models/Category";
// import { z } from "zod"; 

// // 🛡️ ZOD VALIDATION SCHEMA: Kachra data block karne ke liye
// const categoryZodSchema = z.object({
//   name: z.string().min(3, "Category ka naam kam az kam 3 characters ka hona chahiye").max(50, "Naam bohot lamba hai"),
//   slug: z.string().optional(),
//   metaTitle: z.string().max(60, "SEO Title 60 characters se lamba na ho").optional(),
//   metaDescription: z.string().max(160, "SEO Description 160 characters se lambi na ho").optional(),
// });

// // =================================================================
// // 📖 GET STORY: "Sab Categories Dikhane Ka Safar"
// // =================================================================
// export async function GET() {
//   try {
//     console.log("🚀 [GET /api/categories] Request aayi hai!");
    
//     await connectDB();
//     console.log("🔌 Database connect ho gaya.");

//     const categories = await Category.find({}).sort({ createdAt: -1 });
//     console.log(`✅ Total ${categories.length} categories mil gayin. Data bheja ja raha hai.`);
    
//     return NextResponse.json({ success: true, categories }, { status: 200 });
//   } catch (error) {
//     console.error("❌ [GET /api/categories] Error aagaya:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // =================================================================
// // 📖 POST STORY: "Nayi Category Banane Ka Safar"
// // =================================================================
// export async function POST(req) {
//   try {
//     console.log("🚀 [POST /api/categories] Nayi category banane ki request aayi!");

//     // 🔒 STEP 1: SECURITY GUARD (Sirf admin allow hai)
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
//     console.log("📦 Frontend se yeh data aaya:", body);

//     const validation = categoryZodSchema.safeParse(body);
//     if (!validation.success) {
//       console.log("❌ Zod Validation FAIL:", validation.error.errors[0].message);
//       return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
//     }
//     console.log("✅ Zod Validation PASS! Data bilkul clean hai.");
//     const validatedData = validation.data;

//     // ⚙️ STEP 3: SLUG GENERATOR (URL friendly naam)
//     let slug = validatedData.slug;
//     if (!slug && validatedData.name) {
//       slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//       console.log(`🔗 Frontend ne slug nahi bheja, humne khud bana liya: ${slug}`);
//     }

//     // 💾 STEP 4: DATABASE MEIN SAVE KARNA
//     await connectDB();
//     const category = await Category.create({ ...validatedData, slug });
//     console.log(`🎉 Nayi Category database mein successfully save ho gayi! ID: ${category._id}`);
    
//     return NextResponse.json({ success: true, category }, { status: 201 });
//   } catch (error) {
//     console.error("❌ [POST /api/categories] Server Error:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }












