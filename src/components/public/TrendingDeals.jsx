// File Path: src/components/public/TrendingDeals.jsx
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "./ProductCard";

export default async function TrendingDeals() {
  await connectDB();

  const trendingProducts = await Product.find({ isActive: true })
    .sort({ totalClicks: -1, createdAt: -1 }) 
    .limit(10) 
    .populate("category", "name")
    .lean();

  if (!trendingProducts || trendingProducts.length === 0) {
    return null; 
  }

  // 🌟 Deep Serialization Fix (Features array ki IDs ko bhi string banaya)
  const plainProducts = trendingProducts.map((product) => ({
    ...product,
    _id: product._id.toString(),
    category: product.category ? {
      ...product.category,
      _id: product.category._id.toString()
    } : null,
    // Agar features array hai, toh uski har id ko string karo
    features: product.features?.map(feat => ({
      ...feat,
      _id: feat._id ? feat._id.toString() : undefined
    })) || [],
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  }));

  return (
    <section className="py-5 bg-transparent overflow-hidden">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-[#FF9900]" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">
                Trending Deals
              </h2>
            </div>
            <p className="text-sm text-sage-light">Most clicked and highly rated products this week.</p>
          </div>
          
          <Link href="/trending" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group">
            View All Deals <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 🟢 HORIZONTAL SCROLLABLE PRODUCTS */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-2">
            
            {plainProducts.map((product) => (
              // 🌟 FIXED WIDTH ISSUE: Har card strictly 280px ka hoga
              <div 
                key={product._id} 
                className="snap-start flex-shrink-0 w-[260px] sm:w-[280px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
            
            <div className="snap-start flex-shrink-0 w-[150px] sm:w-[200px] flex items-center justify-center pl-4 pr-8">
              <Link href="/deals" className="flex flex-col items-center justify-center gap-4 group h-full">
                <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center group-hover:bg-sage transition-colors shadow-sm">
                  <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-bold text-sage-dark group-hover:text-sage transition-colors text-center">
                  View All <br className="hidden sm:block" /> Deals
                </span>
              </Link>
            </div>

          </div>
          
          <div className="absolute top-0 right-0 w-12 sm:w-20 h-full bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none hidden sm:block z-10"></div>
        </div>
      </div>
    </section>
  );
}











// // File Path: src/components/public/TrendingDeals.jsx
// import Link from "next/link";
// import { ArrowRight, Flame } from "lucide-react";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import ProductCard from "./ProductCard";

// export default async function TrendingDeals() {
//   await connectDB();

//   // 🚀 SERVER FETCH: Limit barha kar 10 kar di hai for better scrolling
//   const trendingProducts = await Product.find({ isActive: true })
//     .sort({ totalClicks: -1, createdAt: -1 }) 
//     .limit(10) 
//     .populate("category", "name")
//     .lean();

//   if (!trendingProducts || trendingProducts.length === 0) {
//     return null; 
//   }

//   // 🌟 Serialization (Fixing the MongoDB object error)
//   const plainProducts = trendingProducts.map((product) => ({
//     ...product,
//     _id: product._id.toString(),
//     category: product.category ? {
//       ...product.category,
//       _id: product.category._id.toString()
//     } : null,
//     createdAt: product.createdAt?.toISOString(),
//     updatedAt: product.updatedAt?.toISOString(),
//   }));

//   return (
//     <section className="py-5 bg-transparent overflow-hidden">
      
//       {/* ⚙️ Custom CSS to Hide Scrollbar but keep functionality */}
//       <style>{`
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
//         {/* 🟢 TOP HEADER */}
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <Flame size={20} className="text-[#FF9900]" />
//               <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">
//                 Trending Deals
//               </h2>
//             </div>
//             <p className="text-sm text-sage-light">Most clicked and highly rated products this week.</p>
//           </div>
          
//           <Link 
//             href="/deals" 
//             className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group"
//           >
//             View All Deals 
//             <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* 🟢 HORIZONTAL SCROLLABLE PRODUCTS */}
//         <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
//           <div className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-2">
            
//             {plainProducts.map((product) => (
//               <div 
//                 key={product._id} 
//                 className="snap-start min-w-[260px] sm:min-w-[280px] md:min-w-[300px]"
//               >
//                 <ProductCard product={product} />
//               </div>
//             ))}
            
//             {/* View All Card at the end of the scroll */}
//             <div className="snap-start min-w-[150px] sm:min-w-[200px] flex items-center justify-center pl-4 pr-8">
//               <Link 
//                 href="/deals"
//                 className="flex flex-col items-center justify-center gap-4 group h-full"
//               >
//                 <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center group-hover:bg-sage transition-colors shadow-sm">
//                   <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
//                 </div>
//                 <span className="text-sm font-bold text-sage-dark group-hover:text-sage transition-colors text-center">
//                   View All <br className="hidden sm:block" /> Deals
//                 </span>
//               </Link>
//             </div>

//           </div>
          
//           {/* Subtle Fade on the right edge to indicate more scrolling */}
//           <div className="absolute top-0 right-0 w-12 sm:w-20 h-full bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none hidden sm:block z-10"></div>
//         </div>

//       </div>
//     </section>
//   );
// }











// // File Path: src/components/public/TrendingDeals.jsx
// import Link from "next/link";
// import { ArrowRight, Flame } from "lucide-react";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import ProductCard from "./ProductCard";

// export default async function TrendingDeals() {
//   await connectDB();

//   // 🚀 SERVER FETCH
//   const trendingProducts = await Product.find({ isActive: true })
//     .sort({ totalClicks: -1, createdAt: -1 }) 
//     .limit(8) 
//     .populate("category", "name")
//     .lean();

//   if (!trendingProducts || trendingProducts.length === 0) {
//     return null; 
//   }

//   // 🌟 THE FIX: Serialization (MongoDB objects ko Plain JS objects mein convert karna)
//   const plainProducts = trendingProducts.map((product) => ({
//     ...product,
//     _id: product._id.toString(), // ID ko string banaya
//     category: product.category ? {
//       ...product.category,
//       _id: product.category._id.toString() // Category ki ID ko bhi string banaya
//     } : null,
//     createdAt: product.createdAt?.toISOString(), // Dates ko string banaya
//     updatedAt: product.updatedAt?.toISOString(),
//   }));

//   return (
//     <section className="py-16 bg-[#FDFBF7]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* 🟢 TOP HEADER */}
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <Flame size={20} className="text-[#FF9900]" />
//               <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">
//                 Trending Deals
//               </h2>
//             </div>
//             <p className="text-sm text-sage-light">Most clicked and highly rated products this week.</p>
//           </div>
          
//           <Link 
//             href="/deals" 
//             className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group"
//           >
//             View All Deals 
//             <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* 🟢 PRODUCTS GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {plainProducts.map((product) => (
//             <ProductCard key={product._id} product={product} /> // Yahan ab clean data ja raha hai
//           ))}
//         </div>

//         {/* Mobile View All Button */}
//         <div className="mt-8 flex justify-center sm:hidden">
//           <Link 
//             href="/deals" 
//             className="w-full flex items-center justify-center gap-2 bg-white border border-cream-dark text-sage-dark hover:border-sage py-3 rounded-xl text-sm font-bold transition-colors"
//           >
//             View All Deals <ArrowRight size={16} />
//           </Link>
//         </div>

//       </div>
//     </section>
//   );
// }