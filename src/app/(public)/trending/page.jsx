// File Path: src/app/(public)/trending/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, TrendingUp, ArrowRight } from "lucide-react";
import ProductCard from "@/components/public/ProductCard";
import Link from "next/link";

export default function TrendingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🟢 FETCH TRENDING PRODUCTS
  const fetchTrending = useCallback(async (pageNum = 1, isLoadMore = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 12,
        sort: "Trending Deals" 
      });

      const res = await fetch(`/api/shop?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (isLoadMore) {
          setProducts((prev) => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Trending fetch fail ho gaye", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending(1, false);
  }, [fetchTrending]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      
      {/* 🟢 STAGGERED FADE-UP ANIMATION STYLES */}
      <style>{`
        @keyframes fadeUpIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* Starts hidden before animation kicks in */
        }
      `}</style>

      {/* 🟢 CLEAN MINIMALIST HEADER (Like Shop Page) */}
      <div className="bg-transparent py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark">
              Trending Deals
            </h1>
            <TrendingUp size={28} className="text-[#FF9900]" />
          </div>
          <p className="text-sage-light text-sm sm:text-base capitalize">
            Discover the most clicked and sought-after mindful products chosen by our community today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* 🟢 TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 sm:px-6 rounded-2xl border border-cream-dark shadow-sm">
          <p className="text-sm font-medium text-sage-light">
            {loading && page === 1 ? "Analyzing clicks..." : <><strong className="text-sage-dark">{products.length}</strong> trending creations right now</>}
          </p>
          <Link href="/shop" className="text-sm font-bold text-sage hover:text-sage-dark flex items-center gap-1 transition-colors">
            Browse Entire Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {/* 🟢 TRENDING GRID */}
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20 text-sage">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium">Fetching what's popular...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* 🟢 ANIMATED GRID WRAPPER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product._id} 
                  className="animate-fade-up"
                  // Har 12 items ka naya set aane par sequentially delay chalega (0, 75, 150...)
                  style={{ animationDelay: `${(index % 12) * 75}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* 🟢 PAGINATION */}
            {page < totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => { setPage((p) => p + 1); fetchTrending(page + 1, true); }}
                  className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More Trending"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-cream-dark border-dashed mt-4 shadow-sm">
            <div className="w-16 h-16 bg-cream flex items-center justify-center rounded-full mb-4">
              <TrendingUp size={32} className="text-sage-light" />
            </div>
            <p className="text-sage-dark text-xl font-bold mb-2">No Data Yet</p>
            <p className="text-sage-light text-center max-w-md px-4">
              Our community is just getting started. Start browsing and clicking to see products trend here!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}












// // File Path: src/app/(public)/trending/page.jsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Loader2, TrendingUp, ArrowRight } from "lucide-react";
// import ProductCard from "@/components/public/ProductCard";
// import Link from "next/link";

// export default function TrendingPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // 🟢 FETCH TRENDING PRODUCTS
//   const fetchTrending = useCallback(async (pageNum = 1, isLoadMore = false) => {
//     setLoading(true);
//     try {
//       const queryParams = new URLSearchParams({
//         page: pageNum,
//         limit: 12,
//         sort: "Trending Deals" 
//       });

//       const res = await fetch(`/api/shop?${queryParams.toString()}`);
//       const data = await res.json();

//       if (data.success) {
//         if (isLoadMore) {
//           setProducts((prev) => [...prev, ...data.products]);
//         } else {
//           setProducts(data.products);
//         }
//         setTotalPages(data.pagination.totalPages);
//       }
//     } catch (error) {
//       console.error("Trending fetch fail ho gaye", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTrending(1, false);
//   }, [fetchTrending]);

//   return (
//     <div className="min-h-screen bg-[#FAF8F5] pb-20">
      
//       {/* 🟢 CLEAN MINIMALIST HEADER (Like Shop Page) */}
//       <div className="bg-transparent py-8 sm:py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center gap-3 mb-2">
//             <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark">
//               Trending Deals
//             </h1>
//             <TrendingUp size={28} className="text-[#FF9900]" />
//           </div>
//           <p className="text-sage-light text-sm sm:text-base capitalize">
//             Discover the most clicked and sought-after mindful products chosen by our community today.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
//         {/* 🟢 TOOLBAR */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 sm:px-6 rounded-2xl border border-cream-dark shadow-sm">
//           <p className="text-sm font-medium text-sage-light">
//             {loading && page === 1 ? "Analyzing clicks..." : <><strong className="text-sage-dark">{products.length}</strong> trending creations right now</>}
//           </p>
//           <Link href="/shop" className="text-sm font-bold text-sage hover:text-sage-dark flex items-center gap-1 transition-colors">
//             Browse Entire Catalog <ArrowRight size={16} />
//           </Link>
//         </div>

//         {/* 🟢 TRENDING GRID */}
//         {loading && page === 1 ? (
//           <div className="flex flex-col items-center justify-center py-20 text-sage">
//             <Loader2 size={40} className="animate-spin mb-4" />
//             <p className="font-medium">Fetching what's popular...</p>
//           </div>
//         ) : products.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {products.map((product) => (
//                 <ProductCard key={product._id} product={product} />
//               ))}
//             </div>

//             {/* 🟢 PAGINATION */}
//             {page < totalPages && (
//               <div className="mt-12 flex justify-center">
//                 <button
//                   onClick={() => { setPage((p) => p + 1); fetchTrending(page + 1, true); }}
//                   className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
//                 >
//                   {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More Trending"}
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-cream-dark border-dashed mt-4 shadow-sm">
//             <div className="w-16 h-16 bg-cream flex items-center justify-center rounded-full mb-4">
//               <TrendingUp size={32} className="text-sage-light" />
//             </div>
//             <p className="text-sage-dark text-xl font-bold mb-2">No Data Yet</p>
//             <p className="text-sage-light text-center max-w-md px-4">
//               Our community is just getting started. Start browsing and clicking to see products trend here!
//             </p>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
