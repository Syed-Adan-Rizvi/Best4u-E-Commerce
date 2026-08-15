// File Path: src/app/api/analytics/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose"; // 🟢 FIX 1: Mongoose import kiya ObjectId ke liye
import connectDB from "@/lib/db";
import ClickTracker from "@/models/ClickTracker";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token && process.env.NEXT_PUBLIC_TESTING_MODE !== 'true') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "all"; 
    const limit = searchParams.get("limit") || "top5"; 
    const categoryFilter = searchParams.get("category") || "all"; 

    // 🕒 1. DATE FILTER LOGIC
    let dateFilter = {};
    if (timeRange !== "all") {
      const now = new Date();
      let pastDate = new Date();
      
      if (timeRange === "today") pastDate.setDate(now.getDate() - 1);
      if (timeRange === "7days") pastDate.setDate(now.getDate() - 7);
      if (timeRange === "1month") pastDate.setMonth(now.getMonth() - 1);
      if (timeRange === "6months") pastDate.setMonth(now.getMonth() - 6);
      if (timeRange === "1year") pastDate.setFullYear(now.getFullYear() - 1);

      dateFilter = { createdAt: { $gte: pastDate } };
    }

    // 🗂️ 2. CATEGORY FILTER LOGIC
    let matchQuery = { ...dateFilter };
    if (categoryFilter !== "all") {
      // 🟢 FIX 2: Aggregation ke liye String ko explicitly ObjectId mein convert karna zaroori hai
      try {
        matchQuery.category = new mongoose.Types.ObjectId(categoryFilter);
      } catch (err) {
        console.error("Invalid Category ID format");
      }
    }

    // 📊 3. THE AGGREGATION PIPELINE
    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$product",
          totalClicks: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products", 
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.title",
          total: "$totalClicks"
        }
      }
    ];

    // 🚦 4. SORTING & LIMIT LOGIC
    if (limit === "lowest") {
      pipeline.push({ $sort: { total: 1 } });
      pipeline.push({ $limit: 10 }); 
    } else {
      const limitNumber = parseInt(limit.replace('top', '')) || 5;
      pipeline.push({ $sort: { total: -1 } }); 
      pipeline.push({ $limit: limitNumber });
    }

    const chartData = await ClickTracker.aggregate(pipeline);

    return NextResponse.json({ success: true, data: chartData }, { status: 200 });

  } catch (error) {
    console.error("❌ Analytics API Error:", error);
    return NextResponse.json({ success: false, error: "Analytics fetch fail" }, { status: 500 });
  }
}

















// // File Path: src/app/api/analytics/route.js
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// import ClickTracker from "@/models/ClickTracker";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//     if (!token && process.env.NEXT_PUBLIC_TESTING_MODE !== 'true') {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
//     }

//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const timeRange = searchParams.get("timeRange") || "all"; 
//     const limit = searchParams.get("limit") || "top5"; 
//     const categoryFilter = searchParams.get("category") || "all"; 

//     // 🕒 1. DATE FILTER LOGIC
//     let dateFilter = {};
//     if (timeRange !== "all") {
//       const now = new Date();
//       let pastDate = new Date();
      
//       if (timeRange === "today") pastDate.setDate(now.getDate() - 1);
//       if (timeRange === "7days") pastDate.setDate(now.getDate() - 7);
//       if (timeRange === "1month") pastDate.setMonth(now.getMonth() - 1);
//       if (timeRange === "6months") pastDate.setMonth(now.getMonth() - 6);
//       if (timeRange === "1year") pastDate.setFullYear(now.getFullYear() - 1);

//       dateFilter = { createdAt: { $gte: pastDate } };
//     }

//     // 🗂️ 2. CATEGORY FILTER LOGIC
//     // Agar frontend se specific category ID aayi hai, toh query mein laga do
//     let matchQuery = { ...dateFilter };
//     if (categoryFilter !== "all") {
//       matchQuery.category = categoryFilter; // Mongoose will auto-cast string to ObjectId in aggregation
//     }

//     // 📊 3. THE AGGREGATION PIPELINE (Heavy Lifting)
//     const pipeline = [
//       { $match: matchQuery },
      
//       // Group by Product ID and count clicks
//       {
//         $group: {
//           _id: "$product",
//           totalClicks: { $sum: 1 }
//         }
//       },
      
//       // Get Product Name from Product collection
//       {
//         $lookup: {
//           from: "products", // Check actual collection name in DB, usually plural
//           localField: "_id",
//           foreignField: "_id",
//           as: "productInfo"
//         }
//       },
//       { $unwind: "$productInfo" },
      
//       // Prepare Final Output Structure
//       {
//         $project: {
//           name: "$productInfo.title",
//           total: "$totalClicks"
//         }
//       }
//     ];

//     // 🚦 4. SORTING & LIMIT LOGIC
//     if (limit === "lowest") {
//       pipeline.push({ $sort: { total: 1 } });
//       pipeline.push({ $limit: 10 }); 
//     } else {
//       // Top 5, 10, 20
//       const limitNumber = parseInt(limit.replace('top', '')) || 5;
//       pipeline.push({ $sort: { total: -1 } }); // Highest first
//       pipeline.push({ $limit: limitNumber });
//     }

//     // Execute the massive query
//     const chartData = await ClickTracker.aggregate(pipeline);

//     return NextResponse.json({ success: true, data: chartData }, { status: 200 });

//   } catch (error) {
//     console.error("❌ Analytics API Error:", error);
//     return NextResponse.json({ success: false, error: "Analytics fetch fail" }, { status: 500 });
//   }
// }