// File Path: src/components/public/FeaturedProducts.jsx
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
// 🟢 Naya component import kiya
import FeaturedProductCard from "./FeaturedProductCard";

export const revalidate = 60;

export default async function FeaturedProducts() {
  await connectDB();

  const featuredProducts = await Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 }) 
    .limit(10) 
    .populate("category", "name")
    .lean();

  if (!featuredProducts || featuredProducts.length === 0) {
    return null; 
  }

  // 🌟 Deep Serialization Fix
  const plainProducts = featuredProducts.map((product) => ({
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
    <section className="py-5 bg-transparent overflow-hidden ">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-sage" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">
                Featured Finds
              </h2>
            </div>
            <p className="text-sm text-sage-light">Top recommendations handpicked by our experts.</p>
          </div>
          
          <Link href="/shop?sort=Featured" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group">
            Explore Featured <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 🟢 HORIZONTAL SCROLLABLE PRODUCTS */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-2">
            
            {plainProducts.map((product) => (
              // 🌟 WIDTH INCREASED: Kyunke card horizontal (rectangular) hai, isliye w-[320px] aur w-[380px] kiya
              <div 
                key={product._id} 
                className="snap-start flex-shrink-0 w-[320px] sm:w-[380px]"
              >
                <FeaturedProductCard product={product} />
              </div>
            ))}
            
            <div className="snap-start flex-shrink-0 w-[150px] sm:w-[200px] flex items-center justify-center pl-4 pr-8">
              <Link href="/shop?sort=Featured" className="flex flex-col items-center justify-center gap-4 group h-full">
                <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center group-hover:bg-sage transition-colors shadow-sm">
                  <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-bold text-sage-dark group-hover:text-sage transition-colors text-center">
                  Explore <br className="hidden sm:block" /> Featured
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










// previous card designe
// // File Path: src/components/public/FeaturedProducts.jsx
// import Link from "next/link";
// import { ArrowRight, Sparkles } from "lucide-react";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import ProductCard from "./ProductCard";

// export const revalidate = 60;


// export default async function FeaturedProducts() {
//   await connectDB();

//   const featuredProducts = await Product.find({ isActive: true, isFeatured: true })
//     .sort({ createdAt: -1 }) 
//     .limit(10) 
//     .populate("category", "name")
//     .lean();

//   if (!featuredProducts || featuredProducts.length === 0) {
//     return null; 
//   }

//   // 🌟 Deep Serialization Fix (Same as Trending Deals)
//   const plainProducts = featuredProducts.map((product) => ({
//     ...product,
//     _id: product._id.toString(),
//     category: product.category ? {
//       ...product.category,
//       _id: product.category._id.toString()
//     } : null,
//     features: product.features?.map(feat => ({
//       ...feat,
//       _id: feat._id ? feat._id.toString() : undefined
//     })) || [],
//     createdAt: product.createdAt?.toISOString(),
//     updatedAt: product.updatedAt?.toISOString(),
//   }));

//   return (
//     <section className="py-5 bg-transparent overflow-hidden ">
      
//       <style>{`
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <Sparkles size={20} className="text-sage" />
//               <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">
//                 Featured Finds
//               </h2>
//             </div>
//             <p className="text-sm text-sage-light">Top recommendations handpicked by our experts.</p>
//           </div>
          
//           <Link href="/shop?sort=Featured" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group">
//             Explore Featured <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* 🟢 HORIZONTAL SCROLLABLE PRODUCTS */}
//         <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
//           <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-2">
            
//             {plainProducts.map((product) => (
//               // 🌟 FIXED WIDTH ISSUE: Card wrapper strict width
//               <div 
//                 key={product._id} 
//                 className="snap-start flex-shrink-0 w-[260px] sm:w-[280px]"
//               >
//                 <ProductCard product={product} />
//               </div>
//             ))}
            
//             <div className="snap-start flex-shrink-0 w-[150px] sm:w-[200px] flex items-center justify-center pl-4 pr-8">
//               <Link href="/shop?sort=Featured" className="flex flex-col items-center justify-center gap-4 group h-full">
//                 <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center group-hover:bg-sage transition-colors shadow-sm">
//                   <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
//                 </div>
//                 <span className="text-sm font-bold text-sage-dark group-hover:text-sage transition-colors text-center">
//                   Explore <br className="hidden sm:block" /> Featured
//                 </span>
//               </Link>
//             </div>

//           </div>
          
//           <div className="absolute top-0 right-0 w-12 sm:w-20 h-full bg-gradient-to-l from-[#FAF8F5] to-transparent pointer-events-none hidden sm:block z-10"></div>
//         </div>

//       </div>
//     </section>
//   );
// }