// File Path: src/app/api/track-click/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ClickTracker from "@/models/ClickTracker"; // Aapka Schema

export const dynamic = "force-dynamic";


export async function POST(req) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID missing" }, { status: 400 });
    }

    await connectDB();

    // 1. Product dhoondo taake uski category mil sake
    const product = await Product.findById(productId).select('category');
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // 2. Product ki 'totalClicks' field ko +1 kar do (Fastest way)
    await Product.findByIdAndUpdate(productId, { $inc: { totalClicks: 1 } });

    // 3. Analytics ke liye ek Click Record bana do
    // IP address nikalne ki koshish (for future spam prevention)
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    await ClickTracker.create({
      product: productId,
      category: product.category,
      ipAddress: ipAddress
    });

    return NextResponse.json({ success: true, message: "Click tracked successfully" }, { status: 200 });

  } catch (error) {
    console.error("❌ Click tracking error:", error);
    return NextResponse.json({ success: false, error: "Failed to track click" }, { status: 500 });
  }
}