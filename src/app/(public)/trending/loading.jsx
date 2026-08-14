// File Path: src/app/(public)/loading.jsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    // min-h-[70vh] rakha hai taake footer ziada ooper na aaye aur page balanced lagay
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent">
      
      {/* 🟢 Modern Pulse Animation CSS */}
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-subtle-pulse {
          animation: subtlePulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center text-center p-8">
        
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-6 animate-subtle-pulse">
          {/* Subtle glowing background */}
          <div className="absolute inset-0 bg-sage/10 rounded-full blur-xl"></div>
          
          {/* Main Icon Box */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-transparent rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
             <Loader2 size={32} className="text-sage animate-spin" strokeWidth={2.5} />
          </div>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-sage-dark mb-2 tracking-wide">
          Curating Mindful Creations...
        </h2>
        
        <p className="text-sm text-sage-light max-w-xs px-4">
          Please wait a moment while we prepare the best collection for you.
        </p>

      </div>
    </div>
  );
}









// // File Path: src/app/loading.jsx
// import { Loader2 } from "lucide-react";

// export default function Loading() {
//   return (
//     <div className="min-h-screen bg-[#FAF8F5] pb-20 pt-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* 🟢 TOP HEADER SKELETON */}
//         <div className="mb-12 animate-pulse">
//           <div className="h-10 sm:h-12 bg-cream-dark/50 rounded-xl w-3/4 sm:w-1/3 mb-4"></div>
//           <div className="h-5 bg-cream-dark/30 rounded-lg w-full sm:w-1/2"></div>
//         </div>

//         {/* 🟢 CONTENT LAYOUT SKELETON */}
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           {/* Sidebar Skeleton (Hidden on mobile) */}
//           <aside className="hidden lg:block w-64 flex-shrink-0 bg-white p-6 rounded-3xl border border-cream-dark shadow-sm animate-pulse">
//             <div className="h-6 bg-cream-dark/40 rounded-md w-1/2 mb-8"></div>
//             <div className="space-y-4">
//                {[1, 2, 3, 4, 5, 6].map((i) => (
//                  <div key={i} className="flex items-center gap-3">
//                    <div className="w-5 h-5 rounded-full bg-cream-dark/30"></div>
//                    <div className="h-4 bg-cream-dark/30 rounded-md w-2/3"></div>
//                  </div>
//                ))}
//             </div>
//           </aside>

//           {/* Main Content Skeleton */}
//           <main className="flex-1 w-full">
//             {/* Toolbar Skeleton */}
//             <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-cream-dark shadow-sm mb-6 animate-pulse">
//               <div className="h-5 bg-cream-dark/40 rounded-md w-1/3"></div>
//               <div className="h-8 bg-cream-dark/40 rounded-lg w-32"></div>
//             </div>

//             {/* Product Cards Grid Skeleton */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//               {[1, 2, 3, 4, 5, 6].map((i) => (
//                 <div key={i} className="bg-white border border-cream-dark rounded-[20px] p-4 flex flex-col h-[380px] animate-pulse">
//                   {/* Image Placeholder */}
//                   <div className="w-full h-[180px] bg-cream rounded-xl mb-4 flex items-center justify-center">
//                      <Loader2 className="text-sage-light/50 animate-spin" size={32} />
//                   </div>
//                   {/* Text Placeholders */}
//                   <div className="h-3 bg-cream-dark/40 rounded w-1/3 mb-3"></div>
//                   <div className="h-5 bg-cream-dark/50 rounded w-full mb-2"></div>
//                   <div className="h-5 bg-cream-dark/50 rounded w-4/5 mb-4"></div>
//                   <div className="mt-auto flex justify-between items-end">
//                      <div className="h-6 bg-sage/20 rounded w-1/4"></div>
//                      <div className="h-10 bg-sage/10 rounded-xl w-1/2"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </main>

//         </div>
//       </div>
//     </div>
//   );
// }