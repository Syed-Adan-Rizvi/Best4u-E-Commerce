// File Path: src/components/public/FlashDeals.jsx
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import FlashDealCard from "./FlashDealCard";

export const revalidate = 60;

export default async function FlashDeals() {
  await connectDB();

  const rawProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(15)
    .populate("category", "name")
    .lean();

  let flashProducts = rawProducts.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 5);

  if (flashProducts.length === 0) {
    flashProducts = rawProducts.slice(0, 5);
  }

  if (!flashProducts || flashProducts.length === 0) {
    return null; 
  }

  const plainProducts = flashProducts.map((product) => ({
    ...product,
    _id: product._id.toString(),
    category: product.category ? {
      ...product.category,
      _id: product.category._id.toString()
    } : null,
    features: product.features?.map(feat => ({
      ...feat,
      _id: feat._id ? feat._id.toString() : undefined
    })) || [],
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  }));

  return (
    // 🟢 THEME FIXED: No more red. Back to clean Sage & transparent layout.
    <section className="py-8 sm:py-10 bg-transparent overflow-hidden mt-4">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={22} className="text-sage" />
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-sage-dark tracking-tight">
                Flash Deals
              </h2>
            </div>
            <p className="text-sm font-medium text-sage-light">Hurry up! These limited-time offers end tonight.</p>
          </div>
          
          <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group px-4 py-2">
            See All Deals <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 🟢 HORIZONTAL SCROLLABLE PRODUCTS */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-2">
            
            {plainProducts.map((product) => (
              // 🟢 WIDE CARD FIX: Iski width w-[320px] / w-[380px] kardi hai taake horizontal layout clear lagay
              <div 
                key={product._id} 
                className="snap-start flex-shrink-0 w-[320px] sm:w-[380px]"
              >
                <FlashDealCard product={product} />
              </div>
            ))}
            
            <div className="snap-start flex-shrink-0 w-[150px] sm:w-[200px] flex items-center justify-center pl-4 pr-8">
              <Link href="/shop" className="flex flex-col items-center justify-center gap-4 group h-full">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center group-hover:bg-sage transition-colors shadow-sm">
                  <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-bold text-sage-dark group-hover:text-sage transition-colors text-center">
                  Explore More <br className="hidden sm:block" /> Deals
                </span>
              </Link>
            </div>

          </div>
          
          <div className="absolute top-0 right-0 w-12 sm:w-20 h-full bg-gradient-to-l from-[#FAF8F5] to-transparent pointer-events-none hidden sm:block z-10"></div>
        </div>

      </div>
    </section>
  );
}