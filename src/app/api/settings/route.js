import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { z } from "zod";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// 🛡️ ZOD VALIDATION SCHEMA (Settings Ke Liye)
const settingsZodSchema = z.object({
  siteName: z.string().min(2, "Site ka naam kam az kam 2 characters ka hona chahiye").optional(),
  siteLogo: z.string().url("Logo URL valid nahi hai").optional().or(z.literal("")),
  heroTypewriterLines: z.array(z.string()).optional(),
  heroImages: z.array(z.string().url("Hero image URL valid nahi hai")).optional(),
  heroDescription: z.string().optional(),
  trustBadges: z.array(
    z.object({
      icon: z.string().optional(),
      value: z.string().optional(),
      label: z.string().optional()
    })
  ).optional(),
  socialLinks: z.array(
    z.object({
      platformName: z.string().optional(),
      url: z.string().url("Social link URL valid nahi hai").optional(),
      icon: z.string().optional()
    })
  ).optional(),
  contactEmail: z.string().email("Email valid nahi hai").optional().or(z.literal("")),
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
// 📖 GET STORY: "Website Ki Settings Dikhane Ka Safar"
// =================================================================
export async function GET() {
  try {
    console.log("🚀 [GET /api/settings] Settings fetch karne ki request aayi!");
    await connectDB();
    
    // Kyunke settings ka sirf ek hi document hoga, hum findOne() use karte hain
    const settings = await SiteSettings.findOne({});
    
    if (!settings) {
      console.log("⚠️ Koi settings nahi mili, default bheji ja rahi hain.");
      // Agar first time load ho aur database khali ho, toh khali object bhej do
      return NextResponse.json({ success: true, settings: {} }, { status: 200 });
    }

    console.log("✅ Settings mil gayi.");
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error("❌ [GET /api/settings] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =================================================================
// 📖 POST STORY: "Settings Update Aur Kachra Saaf Karne Ka Safar"
// =================================================================
export async function POST(req) {
  let newlyAddedImages = [];
  let newlyAddedLogo = "";

  try {
    console.log("🚀 [POST /api/settings] Settings update ki request aayi!");

    // 🔒 1. SECURITY
    if (!(await checkAuth(req))) {
      return NextResponse.json({ success: false, error: "Unauthorized Access" }, { status: 401 });
    }

    // 🛡️ 2. VALIDATION
    const body = await req.json();
    const validation = settingsZodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const validatedData = validation.data;

    await connectDB();

    // 🔍 3. PURANA DATA NIKALNA (Comparison aur Garbage Collection ke liye)
    const oldSettings = await SiteSettings.findOne({});
    let imagesToDelete = [];
    let logoToDelete = "";

    // Agar pehle se settings majood hain, tabhi hum comparison karenge
    if (oldSettings) {
      // A) Nayi images/logo jo fail hone par udane hain (Rollback)
      if (validatedData.heroImages) {
        newlyAddedImages = validatedData.heroImages.filter(img => !oldSettings.heroImages.includes(img));
      }
      if (validatedData.siteLogo && validatedData.siteLogo !== oldSettings.siteLogo) {
        newlyAddedLogo = validatedData.siteLogo;
      }

      // B) Purani images/logo jo success hone par udane hain (Garbage Collection)
      if (validatedData.heroImages) {
        imagesToDelete = oldSettings.heroImages.filter(img => !validatedData.heroImages.includes(img));
      }
      if (validatedData.siteLogo !== undefined && validatedData.siteLogo !== oldSettings.siteLogo) {
        logoToDelete = oldSettings.siteLogo; // Logo change ya remove ho gaya
      }
    } else {
      // Agar first time ban rahi hai toh saari images nayi hain
      newlyAddedImages = validatedData.heroImages || [];
      newlyAddedLogo = validatedData.siteLogo || "";
    }

    // 💾 4. DATABASE UPDATE (Upsert: Hai toh update karo, nahi toh create karo)
    // findOneAndUpdate mein `{}` ka matlab hai ke jo pehla document mile usay update karo
    const updatedSettings = await SiteSettings.findOneAndUpdate(
      {}, 
      validatedData, 
      { returnDocument: 'after', upsert: true }
    );

    // 🧹 5. THE GARBAGE COLLECTOR (Success ke baad Cloudinary ki safai)
    if (imagesToDelete.length > 0) {
      console.log(`🧹 Cloudinary se ${imagesToDelete.length} purani hero images udai ja rahi hain...`);
      await Promise.all(imagesToDelete.map(url => deleteMediaFromCloudinary(url)));
    }
    if (logoToDelete) {
      console.log("🧹 Cloudinary se purana logo udaya ja raha hai...");
      await deleteMediaFromCloudinary(logoToDelete);
    }

    console.log("🎉 Settings successfully update ho gayin!");
    return NextResponse.json({ success: true, settings: updatedSettings }, { status: 200 });

  } catch (error) {
    // 🚑 ROLLBACK: Agar database update fail ho gaya, toh NAYI aayi hui images udao
    console.error("❌ [POST /api/settings] Database update fail! Rollback shuru...");
    
    if (newlyAddedImages.length > 0) {
      await Promise.all(newlyAddedImages.map(url => deleteMediaFromCloudinary(url)));
    }
    if (newlyAddedLogo) {
      await deleteMediaFromCloudinary(newlyAddedLogo);
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}