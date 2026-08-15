// yah mongodb atls ka index use ker ky search ker ta hai
// File Path: src/app/api/search/suggest/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const searchQuery = q.toLowerCase();

    // 🚀 THE MAGIC: Using MongoDB Atlas Search (Lightning Fast Lucene Engine)
    // Yeh ek-ek product check nahi karega, direct Index dictionary se result layega
    const products = await Product.aggregate([
      {
        $search: {
          // Agar aapne Atlas par index ka naam kuch aur rakha hai toh yahan badal dein, default "default" hota hai
          index: "default", 
          compound: {
            should: [
              {
                // Title par Autocomplete (Jaise "ca" likhne par "car" samajh jana)
                autocomplete: {
                  query: searchQuery,
                  path: "title",
                  fuzzy: { maxEdits: 1 } // 🟢 Agar user "cet" likhega toh yeh automatically "cat" samajh lega
                }
              },
              {
                // Description aur Tags par normal string search
                text: {
                  query: searchQuery,
                  path: ["description", "tags"],
                  fuzzy: { maxEdits: 1 } 
                }
              }
            ]
          }
        }
      },
      {
        $match: { isActive: true } // Sirf active products dikhaye
      },
      {
        $limit: 15 // Database se sirf top 15 results memory mein laaye
      },
      {
        $project: { tags: 1, _id: 0 } // Sirf Tags uthaye, baqi lamba data chhor de (Bandwidth saving)
      }
    ]);

    // 2️⃣ Tags ko extract aur clean karna
    let allTags = [];
    products.forEach(product => {
      if (product.tags && product.tags.length > 0) {
        product.tags.forEach(tagString => {
          // Comma-separated strings ko break karna
          const splitTags = tagString.split(",");
          splitTags.forEach(t => {
            const cleanTag = t.trim().toLowerCase();
            if (cleanTag) {
              allTags.push(cleanTag);
            }
          });
        });
      }
    });

    // 3️⃣ Smart Filtering
    let relevantTags = allTags.filter(tag => tag.includes(searchQuery));

    if (relevantTags.length === 0) {
      relevantTags = allTags;
    }

    // 4️⃣ Duplicates remove karo aur sirf top 5 tags bhejo
    const uniqueTags = [...new Set(relevantTags)].slice(0, 5);

    // 5️⃣ Frontend ke format mein convert karo
    const suggestions = uniqueTags.map((tag, index) => ({
      _id: index.toString(),
      title: tag, 
    }));

    return NextResponse.json({ success: true, suggestions }, { status: 200 });

  } catch (error) {
    console.error("Suggestion API Error:", error);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}






















// yah new code hai ho tags ki suggestion deta hai 
// File Path: src/app/api/search/suggest/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";

// export async function GET(req) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(req.url);
//     const q = searchParams.get("q");

//     if (!q || q.length < 2) {
//       return NextResponse.json({ success: true, suggestions: [] });
//     }

//     const searchQuery = q.toLowerCase();

//     // 1️⃣ Database mein Title, Description aur Tags teeno jagah search karo
//     const products = await Product.find({
//       isActive: true,
//       $or: [
//         { title: { $regex: searchQuery, $options: "i" } },
//         { description: { $regex: searchQuery, $options: "i" } },
//         { tags: { $regex: searchQuery, $options: "i" } },
//       ]
//     })
//     .limit(10) // Top 10 matching products uthao
//     .select("tags") // Sirf unke tags database se le kar aao (data bachane ke liye)
//     .lean();

//     // 2️⃣ Tags ko extract aur clean karna
//     let allTags = [];
//     products.forEach(product => {
//       if (product.tags && product.tags.length > 0) {
//         product.tags.forEach(tagString => {
//           // 💡 YAHAN HAI MAGIC: Agar tags comma-separated string hain, toh unko split kar do
//           const splitTags = tagString.split(",");
//           splitTags.forEach(t => {
//             const cleanTag = t.trim().toLowerCase();
//             if (cleanTag) {
//               allTags.push(cleanTag);
//             }
//           });
//         });
//       }
//     });

//     // 3️⃣ Smart Filtering: Pehle wo tags nikalo jinme user ka likha hua word mojood ho
//     let relevantTags = allTags.filter(tag => tag.includes(searchQuery));

//     // Agar user ka word tags mein nahi mila (lekin description se match hua tha), toh products ke saare tags le lo
//     if (relevantTags.length === 0) {
//       relevantTags = allTags;
//     }

//     // 4️⃣ Duplicates remove karo aur sirf top 5 tags frontend ko bhejo
//     const uniqueTags = [...new Set(relevantTags)].slice(0, 5);

//     // 5️⃣ Frontend ke format mein convert karo (Kyunke Navbar item.title expect karta hai)
//     const suggestions = uniqueTags.map((tag, index) => ({
//       _id: index.toString(),
//       title: tag, // Tag ko title bana kar bhej rahe hain taake Navbar mein smoothly chal jaye
//     }));

//     return NextResponse.json({ success: true, suggestions }, { status: 200 });

//   } catch (error) {
//     console.error("Suggestion API Error:", error);
//     return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
//   }
// }





















// uggestion api jo abhi tak sahi kam ker rhi hai ager uch hota hai to is ko dubara sy use ker sakta hu 
// // File Path: src/app/api/search/suggest/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get("q");

//     if (!query || query.length < 2) {
//       return NextResponse.json({ success: true, suggestions: [] }, { status: 200 });
//     }

//     await connectDB();

//     // 🚀 ATLAS SEARCH MAGIC (Aggregation Pipeline)
//     const suggestions = await Product.aggregate([
//       {
//         // 1. Sabse pehle Atlas Search chalega
//         $search: {
//           index: "default", // Jo naam humne Atlas par rakha tha
//           autocomplete: {
//             query: query,
//             path: "title",
//             fuzzy: {
//               maxEdits: 1, // Agar user 1 spelling ghalat likhe, tab bhi sahi match nikal laye
//               prefixLength: 1 // Pehla lafz sahi hona chahiye (e.g., 's' in 'smart')
//             }
//           }
//         }
//       },
//       {
//         // 2. Sirf active products filter karo
//         $match: { isActive: true }
//       },
//       {
//         // 3. Limit lagao (Top 5)
//         $limit: 5
//       },
//       {
//         // 4. Sirf zaroori data bhejo (Network payload kam karne ke liye)
//         $project: {
//           title: 1,
//           slug: 1,
//           price: 1,
//           originalPrice: 1,
//           images: 1,
//           score: { $meta: "searchScore" } // Jo sabse behtar match hoga wo uper aayega
//         }
//       }
//     ]);

//     // Data frontend format ke mutabiq set karein
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