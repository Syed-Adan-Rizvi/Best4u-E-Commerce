// src/api/amazon/fetch/route.js


import { NextResponse } from "next/server";
import connectDB from "@/lib/db";           // Apne DB connection ka correct path verify kar lein
import Product from "@/models/Product"; 

export const dynamic = "force-dynamic";// Apne Product model ka correct path verify kar lein

export async function GET(req) {
  try {
    // 1. URL se queries nikalna (asin, keyword, limit)
    const { searchParams } = new URL(req.url);
    const asin = searchParams.get("asin");
    const keyword = searchParams.get("keyword");
    const limit = searchParams.get("limit") || "20"; // Default 20 products for bulk

    // 2. Environment Variables Check
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;
    const trackingId = process.env.AMAZON_TRACKING_ID || "best4u-20";

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "RapidAPI key missing in .env" }, { status: 500 });
    }

    // 3. Database connection (Zaroori hai kyunke ab hum duplicate check kar rahe hain)
    await connectDB();

    // ==========================================
    // SCENARIO A: SINGLE PRODUCT FETCH (By ASIN)
    // ==========================================
    if (asin) {
      console.log(`🚀 Fetching Single Product for ASIN: ${asin}`);

      const url = `https://${apiHost}/product-details?asin=${asin}&country=US`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost
        }
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (!data || !data.data) {
        return NextResponse.json({ success: false, error: "Product nahi mila ya API block ho gayi" }, { status: 404 });
      }

      const product = data.data;
      const affiliateLink = `https://www.amazon.com/dp/${asin}?tag=${trackingId}`;

      // 🔍 Duplicate Check (Single Product)
      const existingProduct = await Product.findOne({ externalId: asin }).select("_id");

      // Smart Data Mapping
      const mappedData = {
        title: product.product_title || "",
        description: product.product_description || "",
        price: product.product_price ? parseFloat(product.product_price.replace('$', '')) : 0,
        originalPrice: product.product_original_price ? parseFloat(product.product_original_price.replace('$', '')) : null,
        images: product.product_photos || [],
        source: "AmazonAPI",
        externalId: asin, 
        affiliateLink: affiliateLink, 
        rating: product.product_star_rating ? parseFloat(product.product_star_rating) : 0,
        reviewCount: product.product_num_ratings || 0,
        alreadyInDB: !!existingProduct, // 🟢 UPGRADE: Agar DB mein mil gaya toh true, warna false
      };

      return NextResponse.json({ success: true, product: mappedData }, { status: 200 });
    }
    
    // ==========================================
    // SCENARIO B: BULK PRODUCTS FETCH (By Keyword)
    // ==========================================
    else if (keyword) {
      console.log(`🚀 Fetching Bulk Products for Keyword: ${keyword}`);

      const url = `https://${apiHost}/search?query=${keyword}&page=1&country=US`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost
        }
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (!data || !data.data || !data.data.products) {
        return NextResponse.json({ success: false, error: "Is keyword par koi product nahi mila" }, { status: 404 });
      }

      // 1. Initial Mapping
      const productsList = data.data.products.slice(0, parseInt(limit)).map(prod => {
        const productAsin = prod.asin;
        return {
          title: prod.product_title,
          price: prod.product_price ? parseFloat(prod.product_price.replace('$', '')) : 0,
          thumbnail: prod.product_photo,
          externalId: productAsin,
          affiliateLink: `https://www.amazon.com/dp/${productAsin}?tag=${trackingId}`
        };
      });

      // 🔍 2. Duplicate Check (Bulk) - UPGRADED LOGIC
      const asinsList = productsList.map((p) => p.externalId); // Tamam ASINs ki array
      
      const existingProducts = await Product.find({ 
        externalId: { $in: asinsList } 
      }).select("externalId"); 
      
      const existingAsins = existingProducts.map((p) => p.externalId);

      // 3. Final Mapping (Adding alreadyInDB flag)
      const finalProductsList = productsList.map((product) => ({
        ...product,
        alreadyInDB: existingAsins.includes(product.externalId) // 🟢 UPGRADE: Check array
      }));

      return NextResponse.json({ 
        success: true, 
        count: finalProductsList.length, 
        products: finalProductsList 
      }, { status: 200 });
    }
    
    // ==========================================
    // ❌ Error: Agar na ASIN bheja, na Keyword
    // ==========================================
    else {
      return NextResponse.json({ success: false, error: "Bhai, ASIN ya Keyword toh bhejo!" }, { status: 400 });
    }
    
  } catch (error) {
    console.error("❌ Amazon Fetch Error:", error.message);
    return NextResponse.json({ success: false, error: "Server Error during fetch." }, { status: 500 });
  }
}











// import { NextResponse } from "next/server";
// export async function GET(req) {
// try {
// // 1. URL se queries nikalna (asin, keyword, limit)
// const { searchParams } = new URL(req.url);
// const asin = searchParams.get("asin");
//     const keyword = searchParams.get("keyword");
//     const limit = searchParams.get("limit") || "20"; // Default 20 products for bulk
//     // 2. Environment Variables Check
//     const apiKey = process.env.RAPIDAPI_KEY;
//     const apiHost = process.env.RAPIDAPI_HOST;
//     const trackingId = process.env.AMAZON_TRACKING_ID || "best4u-20";
//     if (!apiKey) {
//       return NextResponse.json({ success: false, error: "RapidAPI key missing in .env" }, { status: 500 });
//     }
//     //  SCENARIO A: SINGLE PRODUCT FETCH (By ASIN)
//     if (asin) {
//       console.log(`🚀Fetching Single Product for ASIN: ${asin}`);
      
//       const url = `https://${apiHost}/product-details?asin=${asin}&country=US`;
//       const options = {
//         method: 'GET',
//         headers: {
//           'x-rapidapi-key': apiKey,
//           'x-rapidapi-host': apiHost
//         }
//       };
//       const response = await fetch(url, options);
//       const data = await response.json();
//       if (!data || !data.data) {
//          return NextResponse.json({ success: false, error: "Product nahi mila ya API block ho gayi" }, { status: 404 });
//       }
//       const product = data.data;
//       // THE MAGIC: Affiliate Link Generator
//       const affiliateLink = `https://www.amazon.com/dp/${asin}?tag=${trackingId}`;

//       // Smart Data Mapping (Hamare Best4u Schema ke mutabiq)
//       const mappedData = {
//         title: product.product_title || "",
//         description: product.product_description || "",
//          price: product.product_price ? 
// parseFloat(product.product_price.replace('$', '')) : 0,
//         originalPrice: product.product_original_price ? 
// parseFloat(product.product_original_price.replace('$', '')) : null,
//         images: product.product_photos || [],
//         source: "AmazonAPI",
//         externalId: asin, // Duplicate rokne ke liye
//         affiliateLink: affiliateLink, // Paisa banane wali link!
//         rating: product.product_star_rating ? 
// parseFloat(product.product_star_rating) : 0,
//         reviewCount: product.product_num_ratings || 0,
//       };
//       return NextResponse.json({ success: true, product: mappedData }, { status: 200 });
//     }
//     // SCENARIO B: BULK PRODUCTS FETCH (By Keyword)
//     else if (keyword) {
//       console.log(`🚀Fetching Bulk Products for Keyword: ${keyword}`);
      
//       const url = `https://${apiHost}/search?query=${keyword}&page=1&country=US`;
//       const options = {
//         method: 'GET',
//         headers: {
//           'x-rapidapi-key': apiKey,
//           'x-rapidapi-host': apiHost
//         }
//       };
//       const response = await fetch(url, options);
//       const data = await response.json();
//       if (!data || !data.data || !data.data.products) {
//         return NextResponse.json({ success: false, error: "Is keyword par koi product nahi mila" }, { status: 404 });
//       }
//       // Bulk Data Mapping
//       // API se aane wale products ko loop kar ke limit apply kar rahe hain
//       const productsList = data.data.products.slice(0, 
// parseInt(limit)).map(prod => {
//         const productAsin = prod.asin;
//         return {
//           title: prod.product_title,
//            price: prod.product_price ? 
// parseFloat(prod.product_price.replace('$', '')) : 0,
//           thumbnail: prod.product_photo,
//           externalId: productAsin,
//           affiliateLink: `https://www.amazon.com/dp/${productAsin}?tag=${trackingId}`
//         };
//       });
//       return NextResponse.json({ success: true, count: productsList.length, products: productsList }, { status: 200 });
//     }
//     // ❌Error: Agar na ASIN bheja, na Keyword
//     else {
//       return NextResponse.json({ success: false, error: "Bhai, ASIN ya Keyword toh bhejo!" }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("❌Amazon Fetch Error:", error.message);

//     return NextResponse.json({ success: false, error: "Server Error during fetch." }, { status: 500 });
//   }
// }