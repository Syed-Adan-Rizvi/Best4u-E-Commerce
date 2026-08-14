// File Path: src/app/api/search/suggest/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] }, { status: 200 });
    }

    await connectDB();

    // 🚀 ATLAS SEARCH MAGIC (Aggregation Pipeline)
    const suggestions = await Product.aggregate([
      {
        // 1. Sabse pehle Atlas Search chalega
        $search: {
          index: "default", // Jo naam humne Atlas par rakha tha
          autocomplete: {
            query: query,
            path: "title",
            fuzzy: {
              maxEdits: 1, // Agar user 1 spelling ghalat likhe, tab bhi sahi match nikal laye
              prefixLength: 1 // Pehla lafz sahi hona chahiye (e.g., 's' in 'smart')
            }
          }
        }
      },
      {
        // 2. Sirf active products filter karo
        $match: { isActive: true }
      },
      {
        // 3. Limit lagao (Top 5)
        $limit: 5
      },
      {
        // 4. Sirf zaroori data bhejo (Network payload kam karne ke liye)
        $project: {
          title: 1,
          slug: 1,
          price: 1,
          originalPrice: 1,
          images: 1,
          score: { $meta: "searchScore" } // Jo sabse behtar match hoga wo uper aayega
        }
      }
    ]);

    // Data frontend format ke mutabiq set karein
    const formattedSuggestions = suggestions.map(prod => ({
      _id: prod._id,
      title: prod.title,
      slug: prod.slug,
      price: prod.price,
      originalPrice: prod.originalPrice,
      thumbnail: prod.images?.[0] || "/placeholder.jpg"
    }));

    return NextResponse.json({ 
      success: true, 
      suggestions: formattedSuggestions 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [Search API] Suggestion Error:", error.message);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 200 });
  }
}















// // File Path: src/app/api/search/suggest/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get("q");

//     if (!query || query.length < 2) {
//       return NextResponse.json({ success: true, suggestions: [] }, { status: 200 });
//     }

//     await connectDB();

//     // 🚀 FIXED SEARCH LOGIC (Using Regex for partial & typo matches safely)
//     const searchQuery = {
//       $and: [
//         { isActive: true },
//         {
//           $or: [
//             { title: { $regex: query, $options: "i" } },
//             { tags: { $regex: query, $options: "i" } }
//           ]
//         }
//       ]
//     };

//     const suggestions = await Product.find(searchQuery)
//       .select("title slug price originalPrice images")
//       .limit(5)
//       .lean();

//     const formattedSuggestions = suggestions.map(prod => ({
//       _id: prod._id,
//       title: prod.title,
//       slug: prod.slug,
//       price: prod.price,
//       originalPrice: prod.originalPrice,
//       thumbnail: prod.images?.[0] || "/placeholder.jpg"
//     }));

//     return NextResponse.json({ 
//       success: true, 
//       suggestions: formattedSuggestions 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("❌ [Search API] Suggestion Error:", error.message);
//     return NextResponse.json({ success: false, suggestions: [] }, { status: 200 });
//   }
// }







// // File Path: src/app/api/search/suggest/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";

// // =================================================================
// // 🔍 PUBLIC API: "Lightning Fast Search Suggestions"
// // Navbar Dropdown ke liye (Optimized with Text Search & Regex)
// // =================================================================
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get("q");

//     // Agar user ne khali space ya 1 harf (letter) likha hai toh empty bhejo
//     if (!query || query.length < 2) {
//       return NextResponse.json({ success: true, suggestions: [] }, { status: 200 });
//     }

//     await connectDB();

//     // 🚀 ULTRA-FAST SEARCH LOGIC (Typo-Tolerant)
//     // 1. Koshish karega ke Text Index (Full word match) kare
//     // 2. Agar aadha word (e.g. 'smartw') hai toh Regex check karega title aur tags mein
//     const searchQuery = {
//       $and: [
//         { isActive: true }, // Sirf active products
//         {
//           $or: [
//             { $text: { $search: query } }, // Optimized Index Search
//             { title: { $regex: query, $options: "i" } }, // Partial word match
//             { tags: { $regex: query, $options: "i" } } // Tags match
//           ]
//         }
//       ]
//     };

//     // ⚡ Lightweight Projection (Sirf zaroori data mangwao, poora product nahi)
//     const suggestions = await Product.find(searchQuery)
//       .select("title slug price originalPrice images") // Sirf yeh 5 cheezein!
//       .limit(5) // Ziada se ziada 5 suggestions
//       .lean(); // Faster than normal Mongoose objects

//     // Array map kar rahe hain taake image frontend par aasani se mil jaye
//     const formattedSuggestions = suggestions.map(prod => ({
//       _id: prod._id,
//       title: prod.title,
//       slug: prod.slug,
//       price: prod.price,
//       originalPrice: prod.originalPrice,
//       thumbnail: prod.images?.[0] || "/placeholder.jpg"
//     }));

//     return NextResponse.json({ 
//       success: true, 
//       suggestions: formattedSuggestions 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("❌ [Search API] Suggestion Error:", error.message);
//     // Silent fail for dropdowns (user ko error nahi dikhate dropdown mein)
//     return NextResponse.json({ success: false, suggestions: [] }, { status: 200 });
//   }
// }