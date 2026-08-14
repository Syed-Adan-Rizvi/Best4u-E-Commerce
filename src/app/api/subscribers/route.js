// File Path: src/app/api/subscribers/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { z } from "zod";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { resend } from "@/lib/resend"; 

export const dynamic = "force-dynamic";

// 🛡️ INITIALIZE UPSTASH REDIS
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
});

// 🛡️ ZOD VALIDATION
const subscriberZodSchema = z.object({
  email: z.string().email("Bhai, yeh email theek nahi lag rahi. Sahi email likhein!").toLowerCase().trim()
});

async function checkAuth(req) {
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  if (isTestingMode) return true;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

// =================================================================
// 📧 HELPER FUNCTION: Welcome Email Bhejne Ke Liye
// =================================================================
async function sendWelcomeEmail(userEmail, isReturningUser) {
  try {
    const subject = isReturningUser ? "Welcome back to Best4u! 🎉" : "Welcome to Best4u! 🚀";
    const title = isReturningUser ? "So glad you're back!" : "You're in! Welcome to the family.";
    
    const message = isReturningUser 
      ? "Thank you for re-subscribing! We are thrilled to have you back. Get ready to receive the most exclusive and hand-picked Amazon deals straight to your inbox once again."
      : "You've made a great decision by subscribing to Best4u. From now on, you will receive the internet's absolute best deals, discounts, and offers delivered right to your inbox.";

    // 🎨 EMAIL DESIGN (Updated to Sage & Cream Theme)
    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EAE5D9; border-radius: 12px; overflow: hidden; background-color: #FAF8F5;">
        <div style="background-color: #7A9D8C; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">Best4u Deals</h1>
        </div>
        <div style="padding: 35px; background-color: #ffffff; text-align: center;">
          <h2 style="color: #2C3E35; font-size: 22px; margin-top: 0;">${title}</h2>
          <p style="color: #4A6056; font-size: 16px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 35px;">
            <a href="https://best4u.me" style="background-color: #7A9D8C; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">Explore Best Deals</a>
          </div>
        </div>
        <div style="background-color: #FAF8F5; padding: 20px; text-align: center; border-top: 1px solid #EAE5D9;">
          <p style="color: #8AA69A; font-size: 12px; margin: 0;">You received this email because you subscribed to the Best4u newsletter.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Best4u <onboarding@resend.dev>', 
      to: [userEmail],
      subject: subject,
      html: htmlTemplate,
    });
    console.log(`✉️ Welcome email sent to: ${userEmail}`);
  } catch (error) {
    console.error("❌ Email bhejne mein masla aaya:", error.message);
  }
}

// =================================================================
// 📖 POST STORY: Naya Subscriber
// =================================================================
export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const { success } = await ratelimit.limit(`ratelimit_subscriber_${ip}`);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Aapne bohot zyada requests bhej di hain. Bara-e-meharbani 1 ghante baad dobara koshish karein." }, 
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = subscriberZodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    
    const { email } = validation.data;
    await connectDB();

    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({ success: false, error: "Aap pehle hi hamari newsletter ka hissa hain. Shukriya!" }, { status: 400 });
      } else {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        
        sendWelcomeEmail(email, true); 
        return NextResponse.json({ success: true, message: "Welcome back! Aapki subscription dobara active ho gayi hai." }, { status: 200 });
      }
    }

    const newSubscriber = await Subscriber.create({ email });
    sendWelcomeEmail(email, false);

    return NextResponse.json({ success: true, message: "Zabardast! Aap successfully subscribe ho gaye hain." }, { status: 201 });

  } catch (error) {
    console.error("❌ [POST /api/subscribers] Error:", error.message);
    return NextResponse.json({ success: false, error: "Server mein koi masla aagaya hai, thodi der baad try karein." }, { status: 500 });
  }
}

// =================================================================
// 📖 GET STORY: "Pagination Ke Sath Subscribers Dikhane Ka Safar"
// =================================================================
export async function GET(req) {
  try {
    console.log("🚀 [GET /api/subscribers] Admin panel se subscribers ki list mangi gayi!");

    if (!(await checkAuth(req))) {
      return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1; 
    const limit = parseInt(searchParams.get("limit")) || 10; 

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, 
    };

    const result = await Subscriber.paginate({}, options);
    const activeCount = await Subscriber.countDocuments({ isActive: true });

    console.log(`✅ Page ${page} par ${result.docs.length} subscribers fetch ho gaye.`);

    return NextResponse.json({ 
      success: true, 
      data: {
        totalSubscribers: result.totalDocs,
        activeSubscribers: activeCount,
        subscribers: result.docs
      },
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
    console.error("❌ [GET /api/subscribers] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}















// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// // import connectDB from "@/lib/mongodb";
// import { Subscriber } from "@/models/Subscriber";
// import { z } from "zod";
// import { Redis } from "@upstash/redis";
// import { Ratelimit } from "@upstash/ratelimit";
// // 🌟 NEW: Resend engine ko import kiya
// import { resend } from "@/lib/resend"; 

// // 🛡️ INITIALIZE UPSTASH REDIS
// const redis = Redis.fromEnv();
// const ratelimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.slidingWindow(3, "1 h"),
//   analytics: true,
// });

// // 🛡️ ZOD VALIDATION
// const subscriberZodSchema = z.object({
//   email: z.string().email("Bhai, yeh email theek nahi lag rahi. Sahi email likhein!").toLowerCase().trim()
// });

// async function checkAuth(req) {
//   const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
//   if (isTestingMode) return true;
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   return !!token;
// }

// // =================================================================
// // 📧 HELPER FUNCTION: Welcome Email Bhejne Ke Liye
// // =================================================================
// async function sendWelcomeEmail(userEmail, isReturningUser) {
//   try {
//     // 🌟 SARA EMAIL CONTENT AB PROFESSIONAL ENGLISH MEIN HAI
//     const subject = isReturningUser ? "Welcome back to Best4u! 🎉" : "Welcome to Best4u! 🚀";
//     const title = isReturningUser ? "So glad you're back!" : "You're in! Welcome to the family.";
    
//     const message = isReturningUser 
//       ? "Thank you for re-subscribing! We are thrilled to have you back. Get ready to receive the most exclusive and hand-picked Amazon deals straight to your inbox once again."
//       : "You've made a great decision by subscribing to Best4u. From now on, you will receive the internet's absolute best deals, discounts, and offers delivered right to your inbox.";

//     // Khoobsurat HTML Template
//     const htmlTemplate = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: #059669; padding: 20px; text-align: center;">
//           <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Best4u Deals</h1>
//         </div>
//         <div style="padding: 30px; background-color: #ffffff; text-align: center;">
//           <h2 style="color: #1f2937; font-size: 22px; margin-top: 0;">${title}</h2>
//           <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${message}</p>
//           <div style="margin-top: 30px;">
//             <a href="https://best4u.com" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Best Deals</a>
//           </div>
//         </div>
//         <div style="background-color: #f3f4f6; padding: 15px; text-align: center;">
//           <p style="color: #9ca3af; font-size: 12px; margin: 0;">You received this email because you subscribed to the Best4u newsletter.</p>
//         </div>
//       </div>
//     `;

//     // Resend ko email bhejne ka order dena
//     await resend.emails.send({
//       from: 'Best4u <onboarding@resend.dev>', // Live hone par change kar lenge
//       to: [userEmail],
//       subject: subject,
//       html: htmlTemplate,
//     });
//     console.log(`✉️ Welcome email sent to: ${userEmail}`);
//   } catch (error) {
//     // Agar email fail bhi ho jaye, toh hum main API ko rokenge nahi
//     console.error("❌ Email bhejne mein masla aaya:", error.message);
//   }
// }

// // =================================================================
// // 📖 POST STORY: Naya Subscriber
// // =================================================================
// export async function POST(req) {
//   try {
//     const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
//     const { success } = await ratelimit.limit(`ratelimit_subscriber_${ip}`);

//     if (!success) {
//       return NextResponse.json(
//         { success: false, error: "Aapne bohot zyada requests bhej di hain. Bara-e-meharbani 1 ghante baad dobara koshish karein." }, 
//         { status: 429 }
//       );
//     }

//     const body = await req.json();
//     const validation = subscriberZodSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
//     }
    
//     const { email } = validation.data;
//     await connectDB();

//     const existingSubscriber = await Subscriber.findOne({ email });

//     if (existingSubscriber) {
//       if (existingSubscriber.isActive) {
//         return NextResponse.json({ success: false, error: "Aap pehle hi hamari newsletter ka hissa hain. Shukriya!" }, { status: 400 });
//       } else {
//         // ♻️ Returning User Logic
//         existingSubscriber.isActive = true;
//         await existingSubscriber.save();
        
//         // 📧 SEND WELCOME BACK EMAIL (async, wait nahi karenge)
//         sendWelcomeEmail(email, true); 

//         return NextResponse.json({ success: true, message: "Welcome back! Aapki subscription dobara active ho gayi hai." }, { status: 200 });
//       }
//     }

//     // 🎉 New User Logic
//     const newSubscriber = await Subscriber.create({ email });
    
//     // 📧 SEND NEW WELCOME EMAIL (async)
//     sendWelcomeEmail(email, false);

//     return NextResponse.json({ success: true, message: "Zabardast! Aap successfully subscribe ho gaye hain." }, { status: 201 });

//   } catch (error) {
//     console.error("❌ [POST /api/subscribers] Error:", error.message);
//     return NextResponse.json({ success: false, error: "Server mein koi masla aagaya hai, thodi der baad try karein." }, { status: 500 });
//   }
// }

// // =================================================================
// // 📖 GET STORY: "Admin Ko Saare Subscribers Dikhane Ka Safar" (Protected Route)
// // =================================================================
// export async function GET(req) {
//   try {
//     console.log("🚀 [GET /api/subscribers] Admin panel se subscribers ki list mangi gayi!");

//     // 🔒 1. SECURITY (Koi aam banda yeh data na dekh sake)
//     if (!(await checkAuth(req))) {
//       return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
//     }

//     await connectDB();

//     // 🔍 2. DATABASE QUERY
//     // .sort({ createdAt: -1 }) ka matlab hai jo naya user aaya hai, wo list mein sab se upar ho
//     const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });

//     // 📊 Extra Detail (Admin ko count bhi bhej dete hain taake UI mein dikhane mein asani ho)
//     const totalCount = subscribers.length;
//     const activeCount = subscribers.filter(s => s.isActive).length;

//     console.log(`✅ ${totalCount} subscribers fetch ho gaye.`);

//     return NextResponse.json({ 
//       success: true, 
//       data: {
//         totalSubscribers: totalCount,
//         activeSubscribers: activeCount,
//         subscribers: subscribers
//       }
//     }, { status: 200 });

//   } catch (error) {
//     console.error("❌ [GET /api/subscribers] Error:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }