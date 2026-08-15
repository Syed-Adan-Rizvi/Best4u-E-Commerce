// File Path: src/app/api/shop/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; 

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const sort = searchParams.get("sort") || "None"; 

    await connectDB();

    // 1️⃣ CATEGORY LOOKUP (Agar category select ki gayi hai)
    let categoryId = null;
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
      if (categoryDoc) {
        categoryId = categoryDoc._id; 
      } else {
        return NextResponse.json({ success: true, products: [], pagination: {} }, { status: 200 });
      }
    }

    // 🚀 AGGREGATION PIPELINE START
    const pipeline = [];

    // 2️⃣ THE ATLAS SEARCH MAGIC (Auto-correct & Lightning Fast)
    // Yeh pipeline ka sab se pehla step hona zaroori hai
    if (search && search.length >= 2) {
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              {
                autocomplete: {
                  query: search,
                  path: "title",
                  fuzzy: { maxEdits: 1 } // "bead" ko "bed" khud bana dega
                }
              },
              {
                text: {
                  query: search,
                  path: ["description", "tags"],
                  fuzzy: { maxEdits: 1 }
                }
              }
            ]
          }
        }
      });
    }

    // 3️⃣ MATCH STAGE (Filters apply karna)
    let matchStage = { isActive: true };
    if (categoryId) matchStage.category = categoryId;
    matchStage.price = { $gte: minPrice, $lte: maxPrice };

    const sortVal = sort.toLowerCase();
    let sortOptions = {}; 

    if (sortVal === "price: low to high") {
      sortOptions = { price: 1 };
    } else if (sortVal === "price: high to low") {
      sortOptions = { price: -1 };
    } else if (sortVal === "newest") {
       sortOptions = { createdAt: -1 };
    } else if (sortVal === "featured") {
       matchStage.isFeatured = true; 
       sortOptions = { createdAt: -1 }; 
    } 
    else if (sortVal === "trending deals") {
       matchStage.totalClicks = { $gt: 0 }; 
       sortOptions = { totalClicks: -1, createdAt: -1 }; 
    }

    pipeline.push({ $match: matchStage });

    // 4️⃣ SORTING STAGE
    if (Object.keys(sortOptions).length > 0) {
      pipeline.push({ $sort: sortOptions });
    } else if (!search || search.length < 2) {
      // Agar search nahi ho rahi toh default newest products pehle aayenge
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    // 💡 PRO TIP: Agar "Search" active hai aur "Sort" 'None' hai, 
    // toh hum koi sort nahi lagayenge, taake Atlas Search ki "Relevance Score" 
    // apply ho (Yani sab se best match wala product sab se upar aaye!)

    // 5️⃣ PAGINATION & POPULATION (Using $facet)
    const skip = (page - 1) * limit;

    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalDocs" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          // Category data populate karna (kyunke aggregate mein direct populate nahi chalta)
          {
            $lookup: {
              from: "categories", // Database mein collection ka naam (usually lowercase plural)
              localField: "category",
              foreignField: "_id",
              as: "categoryDetails"
            }
          },
          {
            $addFields: {
              category: { $arrayElemAt: ["$categoryDetails", 0] } // Array ko object mein convert karna
            }
          },
          {
            $project: {
              categoryDetails: 0 // Faltu array ko hide kar dena
            }
          }
        ]
      }
    });

    // Run the pipeline
    const [result] = await Product.aggregate(pipeline);

    // 6️⃣ FORMATTING RESPONSE (Aapke frontend ke hisaab se)
    const totalDocs = result.metadata[0]?.totalDocs || 0;
    const products = result.data || [];
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Headers add kar diye taake API kabhi cache na ho
    return NextResponse.json({
      success: true,
      products: products,
      pagination: {
        totalDocs,
        limit,
        totalPages,
        page,
        hasNextPage,
        hasPrevPage,
      }
    }, { status: 200, headers: { "Cache-Control": "no-store" } });

  } catch (error) {
    console.error("❌ [API /shop] Error:", error.message);
    return NextResponse.json({ success: false, error: "Shop data lane mein masla aya." }, { status: 500 });
  }
}














// abhi tak sahi hai 
// // File Path: src/app/api/shop/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; 

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
    
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 12;
//     const search = searchParams.get("search") || "";
//     const categorySlug = searchParams.get("category") || "";
//     const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
//     const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
//     const sort = searchParams.get("sort") || "None"; 

//     await connectDB();

//     let query = { isActive: true };

//     if (search && search.length >= 2) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { tags: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } }
//       ];
//     }

//     if (categorySlug) {
//       const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
//       if (categoryDoc) {
//         query.category = categoryDoc._id; 
//       } else {
//         return NextResponse.json({ success: true, products: [], pagination: {} }, { status: 200 });
//       }
//     }

//     query.price = { $gte: minPrice, $lte: maxPrice };


//     let sortOptions = {}; 
//     const sortVal = sort.toLowerCase();

//     if (sortVal === "price: low to high") {
//       sortOptions = { price: 1 };
//     } else if (sortVal === "price: high to low") {
//       sortOptions = { price: -1 };
//     } else if (sortVal === "newest") {
//        sortOptions = { createdAt: -1 };
//     } else if (sortVal === "featured") {
//        query.isFeatured = true; 
//        sortOptions = { createdAt: -1 }; 
//     } 
//     else if (sortVal === "trending deals") {
//        // 🟢 LOGIC UPDATE: Sirf > 0 clicks wale products API mein bhejo
//        query.totalClicks = { $gt: 0 }; 
//        sortOptions = { totalClicks: -1, createdAt: -1 }; 
//     }

//     // let sortOptions = {}; 

//     // // 🟢 BUG FIX: To lower case to prevent case sensitivity issues
//     // const sortVal = sort.toLowerCase();

//     // if (sortVal === "price: low to high") {
//     //   sortOptions = { price: 1 };
//     // } else if (sortVal === "price: high to low") {
//     //   sortOptions = { price: -1 };
//     // } else if (sortVal === "newest") {
//     //    sortOptions = { createdAt: -1 };
//     // } else if (sortVal === "featured") {
//     //    query.isFeatured = true; 
//     //    sortOptions = { createdAt: -1 }; 
//     // } 
//     // else if (sortVal === "trending deals") {
//     //    sortOptions = { totalClicks: -1, createdAt: -1 }; 
//     // }

//     const options = {
//       page,
//       limit,
//       sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
//       populate: { path: "category", select: "name slug" },
//       lean: true
//     };

//     const result = await Product.paginate(query, options);
// // 🟢 FIX: Headers add kar diye taake API kabhi cache na ho
//     return NextResponse.json({
//       success: true,
//       products: result.docs,
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
//     console.error("❌ [API /shop] Error:", error.message);
//     return NextResponse.json({ success: false, error: "Shop data lane mein masla aya." }, { status: 500 });
//   }
// }



















// // File Path: src/app/api/shop/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; 

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
    
//     // 1️⃣ Parameters Collect Karein
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 12;
//     const search = searchParams.get("search") || "";
//     const categorySlug = searchParams.get("category") || "";
//     const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
//     const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
//     const sort = searchParams.get("sort") || "None"; 

//     await connectDB();

//     // 2️⃣ Base Query
//     let query = { isActive: true };

//     // 3️⃣ Search Logic
//     if (search && search.length >= 2) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { tags: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } }
//       ];
//     }

//     // 4️⃣ Category Filter
//     if (categorySlug) {
//       const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
//       if (categoryDoc) {
//         query.category = categoryDoc._id; 
//       } else {
//         return NextResponse.json({ success: true, products: [], pagination: {} }, { status: 200 });
//       }
//     }

//     // 5️⃣ Price Range Filter
//     query.price = { $gte: minPrice, $lte: maxPrice };

//     // 6️⃣ Combined Sorting & Special Filters Logic
//     let sortOptions = {}; 

//     // Jab normal sort ho
//     if (sort === "Price: Low to High") {
//       sortOptions = { price: 1 };
//     } else if (sort === "Price: High to Low") {
//       sortOptions = { price: -1 };
//     } else if (sort === "Newest") {
//        sortOptions = { createdAt: -1 };
//     } 
//     // Jab Special Filter as a Sort kaam kare
//     else if (sort === "Featured") {
//        query.isFeatured = true; // Query mein filter lagaya
//        sortOptions = { createdAt: -1 }; // Aur nayi cheezein pehle dikhayi
//     } else if (sort === "Trending Deals") {
//        sortOptions = { totalClicks: -1, createdAt: -1 }; // Sabse ziada clicks wale top par
//     } else if (sort === "Hot Deals") {
//        query.originalPrice = { $gt: 0 }; 
//        query.$expr = { $gt: ["$originalPrice", "$price"] }; // Jinpar discount hai
//        sortOptions = { createdAt: -1 };
//     }

//     // 7️⃣ Execute Query with Pagination
//     const options = {
//       page,
//       limit,
//       sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
//       populate: { path: "category", select: "name slug" },
//       lean: true
//     };

//     const result = await Product.paginate(query, options);

//     return NextResponse.json({
//       success: true,
//       products: result.docs,
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
//     console.error("❌ [API /shop] Error:", error.message);
//     return NextResponse.json({ success: false, error: "Shop data lane mein masla aya." }, { status: 500 });
//   }
// }








// // File Path: src/app/api/shop/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; 

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
    
//     // 1️⃣ Parameters Collect Karein
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 12;
//     const search = searchParams.get("search") || "";
//     const categorySlug = searchParams.get("category") || "";
//     const filter = searchParams.get("filter") || "";
//     const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
//     const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    
//     // 🌟 CHANGE 1: Default sort value changed to "None"
//     const sort = searchParams.get("sort") || "None"; 

//     await connectDB();

//     // 2️⃣ Base Query (Implicit AND condition builds here)
//     let query = { isActive: true };

//     // 3️⃣ Search Logic
//     if (search && search.length >= 2) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { tags: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } }
//       ];
//     }

//     // 4️⃣ Category Filter (ANDed with search/filters)
//     if (categorySlug) {
//       const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
//       if (categoryDoc) {
//         query.category = categoryDoc._id; 
//       } else {
//         return NextResponse.json({ success: true, products: [], pagination: {} }, { status: 200 });
//       }
//     }

//     // 5️⃣ Special Filters (ANDed with above)
//     if (filter === "featured") {
//       query.isFeatured = true;
//     } else if (filter === "hot-deals") {
//       query.originalPrice = { $gt: 0 }; 
//       query.$expr = { $gt: ["$originalPrice", "$price"] };
//     } else if (filter === "trending") {
//       query.totalClicks = { $gte: 50 }; 
//     } else if (filter === "new-arrivals") {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       query.createdAt = { $gte: thirtyDaysAgo };
//     }

//     // 6️⃣ Price Range Filter (ANDed)
//     query.price = { $gte: minPrice, $lte: maxPrice };

//     // 7️⃣ Sorting Logic Updated
//     // 🌟 CHANGE 2: Handled "None" - DB will use default insertion order (empty sort options)
//     let sortOptions = {}; 

//     if (sort === "Price: Low to High") {
//       sortOptions = { price: 1 };
//     } else if (sort === "Price: High to Low") {
//       sortOptions = { price: -1 };
//     } else if (sort === "Featured") {
//        sortOptions = { isFeatured: -1, createdAt: -1 };
//     } else if (sort === "Newest") {
//        sortOptions = { createdAt: -1 };
//     }
//     // If sort === "None", sortOptions remains empty.

//     // 8️⃣ Execute Query with Pagination
//     const options = {
//       page,
//       limit,
//       // 🌟 CHANGE 3: sortOptions pass kiya (empty agar None ho)
//       sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined, // mongoose will default sort if undefined
//       populate: { path: "category", select: "name slug" },
//       lean: true
//     };

//     const result = await Product.paginate(query, options);

//     return NextResponse.json({
//       success: true,
//       products: result.docs,
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
//     console.error("❌ [API /shop] Error:", error.message);
//     return NextResponse.json({ success: false, error: "Shop data lane mein masla aya." }, { status: 500 });
//   }
// }












// // File Path: src/app/api/shop/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; // Taake category ID dhoond sakein

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
    
//     // 1️⃣ Parameters Collect Karein
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 12;
//     const search = searchParams.get("search") || "";
//     const categorySlug = searchParams.get("category") || "";
//     const filter = searchParams.get("filter") || ""; // e.g., 'hot-deals', 'trending', 'featured', 'new-arrivals'
//     const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
//     const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
//     const sort = searchParams.get("sort") || "Featured"; // Sort type

//     await connectDB();

//     // 2️⃣ Base Query Banayen (Hamesha active products dikhane hain)
//     let query = { isActive: true };

//     // 3️⃣ Search Logic (Agar search parameter hai)
//     if (search && search.length >= 2) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { tags: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } } // Thoda broad search
//       ];
//     }

//     // 4️⃣ Category Filter (Agar category select ki gayi hai)
//     if (categorySlug) {
//       const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
//       if (categoryDoc) {
//         query.category = categoryDoc._id; // Product ko is category ki ID se match karo
//       } else {
//         // Agar category na mile toh koi result na dikhao
//         return NextResponse.json({ success: true, products: [], pagination: {} }, { status: 200 });
//       }
//     }

//     // 5️⃣ Special Filters (Hot Deals, Trending, Featured, New Arrivals)
//     if (filter === "featured") {
//       query.isFeatured = true;
//     } else if (filter === "hot-deals") {
//       // Misal ke taur par, wo products jinki originalPrice bohot ziada thi (big discount)
//       query.originalPrice = { $gt: 0 }; 
//       query.$expr = { $gt: ["$originalPrice", "$price"] }; // Discounted items
//     } else if (filter === "trending") {
//       query.totalClicks = { $gte: 50 }; // Man lo 50 clicks wale trending hain
//     } else if (filter === "new-arrivals") {
//       // Naye add kiye gaye (aakhri 30 din mein) - Yeh hum sort se b manage kar sakte hain, par theek hai
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       query.createdAt = { $gte: thirtyDaysAgo };
//     }

//     // 6️⃣ Price Range Filter
//     query.price = { $gte: minPrice, $lte: maxPrice };

//     // 7️⃣ Sorting Logic
//     let sortOptions = { createdAt: -1 }; // Default: Newest First
//     if (sort === "Price: Low to High") {
//       sortOptions = { price: 1 };
//     } else if (sort === "Price: High to Low") {
//       sortOptions = { price: -1 };
//     } else if (sort === "Featured") {
//        sortOptions = { isFeatured: -1, createdAt: -1 };
//     } else if (sort === "Newest") {
//        sortOptions = { createdAt: -1 };
//     }

//     // 8️⃣ Execute Query with Pagination
//     const options = {
//       page,
//       limit,
//       sort: sortOptions,
//       populate: { path: "category", select: "name slug" },
//       lean: true
//     };

//     const result = await Product.paginate(query, options);

//     return NextResponse.json({
//       success: true,
//       products: result.docs,
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
//     console.error("❌ [API /shop] Error:", error.message);
//     return NextResponse.json({ success: false, error: "Shop data lane mein masla aya." }, { status: 500 });
//   }
// }