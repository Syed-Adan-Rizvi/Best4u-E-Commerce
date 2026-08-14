// // File Path: src/components/public/ProductCard.jsx
// "use client";

// import Link from "next/link";
// import { ExternalLink } from "lucide-react";
// import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductCard({ product }) {
//   const { currency, rates } = useCurrencyStore();

//   // 🌟 Dynamic Star Rating Logic
//   const renderStars = (rating = 0) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FaStar key={`full-${i}`} className="text-sage" size={13} />);
//     }
//     if (hasHalfStar) {
//       stars.push(<FaStarHalfAlt key="half" className="text-sage" size={13} />);
//     }
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<FaRegStar key={`empty-${i}`} className="text-sage opacity-40" size={13} />);
//     }

//     return stars;
//   };

//   return (
//     <div className="bg-white border border-cream-dark rounded-[16px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
//       {/* 🟢 TOP: Edge-to-Edge Image Container (Height Reduced for Compact Look) */}
//       <div className="relative w-full h-[180px] sm:h-[190px] overflow-hidden bg-white">
//         <Link href={`/products/${product.slug}`} className="block w-full h-full">
//           <img 
//             src={product.images?.[0] || "/placeholder.jpg"} 
//             alt={product.title} 
//             className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
//           />
//         </Link>
//       </div>

//       {/* 🟢 BOTTOM: Content Container (Paddings and Margins Reduced) */}
//       <div className="p-4 flex flex-col flex-grow bg-white">
        
//         {/* Category Name */}
//         <p className="text-[11px] font-semibold text-sage-light mb-1 line-clamp-1">
//           {product.category?.name || "Category"}
//         </p>
        
//         {/* Title */}
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="text-[14px] sm:text-[15px] font-bold text-sage-dark leading-tight line-clamp-2 hover:text-sage transition-colors mb-2">
//             {product.title}
//           </h3>
//         </Link>

//         {/* Dynamic Sage Green Stars & Rating */}
//         <div className="flex items-center gap-1.5 mb-3">
//           <div className="flex items-center gap-1">
//             {renderStars(product.rating || 0)}
//           </div>
//           <div className="flex items-center gap-1 mt-0.5">
//             <span className="text-[12px] font-bold text-sage-dark">
//               {product.rating?.toFixed(1) || "0.0"}
//             </span>
//             <span className="text-[11px] text-sage-light font-medium">
//               ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"})
//             </span>
//           </div>
//         </div>

//         {/* Pricing */}
//         <div className="flex items-baseline gap-2 mb-4 mt-auto">
//           <span className="text-lg sm:text-xl font-extrabold text-sage-dark tracking-tight">
//             {formatPrice(product.price, currency, rates)}
//           </span>
//           {product.originalPrice && product.originalPrice > product.price && (
//             <span className="text-[12px] font-semibold text-sage-light line-through">
//               {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//           )}
//         </div>

//         {/* Solid View Deal Button (Slimmer Padding) */}
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-[10px] text-[13px] font-bold transition-all shadow-sm"
//         >
//           View Deal <ExternalLink size={15} />
//         </Link>
        
//       </div>
//     </div>
//   );
// }





// full image view cream bg short card
// File Path: src/components/public/ProductCard.jsx
"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatPrice } from "@/lib/formatPrice";

export default function ProductCard({ product }) {
  const { currency, rates } = useCurrencyStore();

  // 🌟 Dynamic Star Rating Logic (Full, Half, Empty)
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-sage" size={14}  />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-sage" size={14} />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-sage opacity-40" size={14} />);
    }

    return stars;
  };

  return (
    <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
      {/* 🟢 TOP: Image Container (Height reduced to 180px for a compact look) */}
      <div className="relative w-full h-[180px] bg-transparent flex items-center justify-center p-4">
        <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img 
            src={product.images?.[0] || "/placeholder.jpg"} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.05] transition-transform duration-500 rounded-lg"
          />
        </Link>
      </div>

      {/* 🟢 BOTTOM: Content Container (Paddings and margins tightened) */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
        
        {/* Category Name */}
        <p className="text-xs font-semibold text-sage-light mb-1.5 line-clamp-1">
          {product.category?.name || "Category"}
        </p>
        
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[15px] sm:text-[16px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Dynamic Sage Green Stars & Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(product.rating || 0)}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[13px] font-bold text-sage-dark">
              {product.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-[12px] text-sage-light font-medium">
              ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"})
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-xl sm:text-[22px] font-extrabold text-sage-dark tracking-tight">
            {formatPrice(product.price, currency, rates)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[13px] font-semibold text-sage-light line-through">
              {formatPrice(product.originalPrice, currency, rates)}
            </span>
          )}
        </div>

        {/* Solid View Deal Button (Slightly slimmer) */}
        <Link 
          href={`/products/${product.slug}`} 
          className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-[12px] text-sm font-bold transition-all shadow-sm"
        >
          View Deal <ExternalLink size={16} />
        </Link>
        
      </div>
    </div>
  );
}








// // edge to edge but long

// // File Path: src/components/public/ProductCard.jsx
// "use client";

// import Link from "next/link";
// import { ExternalLink } from "lucide-react";
// import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductCard({ product }) {
//   const { currency, rates } = useCurrencyStore();

//   // 🌟 Dynamic Star Rating Logic
//   const renderStars = (rating = 0) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FaStar key={`full-${i}`} className="text-sage" size={14} />);
//     }
//     if (hasHalfStar) {
//       stars.push(<FaStarHalfAlt key="half" className="text-sage" size={14} />);
//     }
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<FaRegStar key={`empty-${i}`} className="text-sage opacity-40" size={14} />);
//     }

//     return stars;
//   };

//   return (
//     <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
//       {/* 🟢 TOP: Edge-to-Edge Image Container (No padding, full cover) */}
//       <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-white">
//         <Link href={`/products/${product.slug}`} className="block w-full h-full">
//           <img 
//             src={product.images?.[0] || "/placeholder.jpg"} 
//             alt={product.title} 
//             className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
//           />
//         </Link>
//       </div>

//       {/* 🟢 BOTTOM: Content Container */}
//       <div className="p-5 sm:p-6 flex flex-col flex-grow bg-white">
        
//         {/* Category Name */}
//         <p className="text-xs font-semibold text-sage-light mb-1.5 line-clamp-1">
//           {product.category?.name || "Category"}
//         </p>
        
//         {/* Title */}
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="text-[15px] sm:text-[16px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors mb-2.5">
//             {product.title}
//           </h3>
//         </Link>

//         {/* Dynamic Sage Green Stars & Rating */}
//         <div className="flex items-center gap-2 mb-4">
//           <div className="flex items-center gap-1">
//             {renderStars(product.rating || 0)}
//           </div>
//           <div className="flex items-center gap-1 mt-0.5">
//             <span className="text-[13px] font-bold text-sage-dark">
//               {product.rating?.toFixed(1) || "0.0"}
//             </span>
//             <span className="text-[12px] text-sage-light font-medium">
//               ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"})
//             </span>
//           </div>
//         </div>

//         {/* Pricing */}
//         <div className="flex items-baseline gap-2 mb-6 mt-auto">
//           <span className="text-xl sm:text-[22px] font-extrabold text-sage-dark tracking-tight">
//             {formatPrice(product.price, currency, rates)}
//           </span>
//           {product.originalPrice && product.originalPrice > product.price && (
//             <span className="text-[13px] font-semibold text-sage-light line-through">
//               {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//           )}
//         </div>

//         {/* Solid View Deal Button */}
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-[12px] text-sm font-bold transition-all shadow-sm"
//         >
//           View Deal <ExternalLink size={16} />
//         </Link>
        
//       </div>
//     </div>
//   );
// }






// //  full image view bith creem bg but long card

// // File Path: src/components/public/ProductCard.jsx
// "use client";

// import Link from "next/link";
// import { ExternalLink } from "lucide-react";
// import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductCard({ product }) {
//   const { currency, rates } = useCurrencyStore();

//   // 🌟 Dynamic Star Rating Logic (Full, Half, Empty)
//   const renderStars = (rating = 0) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FaStar key={`full-${i}`} className="text-sage" size={14} />);
//     }
//     if (hasHalfStar) {
//       stars.push(<FaStarHalfAlt key="half" className="text-sage" size={14} />);
//     }
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<FaRegStar key={`empty-${i}`} className="text-sage opacity-40" size={14} />);
//     }

//     return stars;
//   };

//   return (
//     <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
//       {/* 🟢 TOP: Image Container (Grey background hat gaya, Image takes full space) */}
//       <div className="relative w-full h-[240px] bg-transparent flex items-center justify-center p-4">
//         <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
//           <img 
//             src={product.images?.[0] || "/placeholder.jpg"} 
//             alt={product.title} 
//             className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.05] transition-transform duration-500 rounded-lg"
//           />
//         </Link>
//       </div>

//       {/* 🟢 BOTTOM: Content Container */}
//       <div className="p-5 sm:p-6 flex flex-col flex-grow bg-white">
        
//         {/* Category Name */}
//         <p className="text-xs font-semibold text-sage-light mb-1.5 line-clamp-1">
//           {product.category?.name || "Category"}
//         </p>
        
//         {/* Title */}
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="text-[15px] sm:text-[16px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors mb-2.5">
//             {product.title}
//           </h3>
//         </Link>

//         {/* Dynamic Sage Green Stars & Rating */}
//         <div className="flex items-center gap-2 mb-4">
//           <div className="flex items-center gap-1">
//             {renderStars(product.rating || 0)}
//           </div>
//           <div className="flex items-center gap-1 mt-0.5">
//             <span className="text-[13px] font-bold text-sage-dark">
//               {product.rating?.toFixed(1) || "0.0"}
//             </span>
//             <span className="text-[12px] text-sage-light font-medium">
//               ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"})
//             </span>
//           </div>
//         </div>

//         {/* Pricing */}
//         <div className="flex items-baseline gap-2 mb-6 mt-auto">
//           <span className="text-xl sm:text-[22px] font-extrabold text-sage-dark tracking-tight">
//             {formatPrice(product.price, currency, rates)}
//           </span>
//           {product.originalPrice && product.originalPrice > product.price && (
//             <span className="text-[13px] font-semibold text-sage-light line-through">
//               {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//           )}
//         </div>

//         {/* Solid View Deal Button */}
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-[12px] text-sm font-bold transition-all shadow-sm"
//         >
//           View Deal <ExternalLink size={16} />
//         </Link>
        
//       </div>
//     </div>
//   );
// }












// // File Path: src/components/public/ProductCard.jsx
// "use client";

// import Link from "next/link";
// import { ExternalLink } from "lucide-react";
// import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // 🌟 Accurate Full/Half/Empty Stars
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductCard({ product }) {
//   const { currency, rates } = useCurrencyStore();

//   // 🌟 Dynamic Star Rating Logic (Full, Half, Empty)
//   const renderStars = (rating = 0) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//     // 1. Full Stars
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FaStar key={`full-${i}`} className="text-sage" size={14} />);
//     }
//     // 2. Half Star
//     if (hasHalfStar) {
//       stars.push(<FaStarHalfAlt key="half" className="text-sage" size={14} />);
//     }
//     // 3. Empty Stars
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<FaRegStar key={`empty-${i}`} className="text-sage opacity-40" size={14} />);
//     }

//     return stars;
//   };

//   return (
//     <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
//       {/* 🟢 TOP: Minimal Image Container (No Badges, No Heart) */}
//       <div className="relative w-full h-[240px] bg-[#F2F2F2] flex items-center justify-center p-6 border-b border-cream-dark/50">
//         <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
//           <img 
//             src={product.images?.[0] || "/placeholder.jpg"} 
//             alt={product.title} 
//             className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-500"
//           />
//         </Link>
//       </div>

//       {/* 🟢 BOTTOM: Content Container (Matched with Reference Image) */}
//       <div className="p-5 sm:p-6 flex flex-col flex-grow bg-white">
        
//         {/* Category Name */}
//         <p className="text-xs font-semibold text-sage-light mb-1.5 line-clamp-1">
//           {product.category?.name || "Category"}
//         </p>
        
//         {/* Title */}
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="text-[15px] sm:text-[16px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors mb-2.5">
//             {product.title}
//           </h3>
//         </Link>

//         {/* Dynamic Sage Green Stars & Rating */}
//         <div className="flex items-center gap-2 mb-4">
//           <div className="flex items-center gap-1">
//             {renderStars(product.rating || 0)}
//           </div>
//           <div className="flex items-center gap-1 mt-0.5">
//             <span className="text-[13px] font-bold text-sage-dark">
//               {product.rating?.toFixed(1) || "0.0"}
//             </span>
//             <span className="text-[12px] text-sage-light font-medium">
//               ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"})
//             </span>
//           </div>
//         </div>

//         {/* Pricing (Bold Current Price + Strikethrough) */}
//         <div className="flex items-baseline gap-2 mb-6 mt-auto">
//           <span className="text-xl sm:text-[22px] font-extrabold text-sage-dark tracking-tight">
//             {formatPrice(product.price, currency, rates)}
//           </span>
//           {product.originalPrice && product.originalPrice > product.price && (
//             <span className="text-[13px] font-semibold text-sage-light line-through">
//               {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//           )}
//         </div>

//         {/* Solid View Deal Button */}
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-[12px] text-sm font-bold transition-all shadow-sm"
//         >
//           View Deal <ExternalLink size={16} />
//         </Link>
        
//       </div>
//     </div>
//   );
// }











// // File Path: src/components/public/ProductCard.jsx
// "use client";

// import Link from "next/link";
// import { Star, ExternalLink, Heart } from "lucide-react";
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductCard({ product }) {
//   const { currency, rates } = useCurrencyStore();

//   // 🧮 Discount Percentage Calculator
//   let discountPercentage = 0;
//   if (product.originalPrice && product.originalPrice > product.price) {
//     discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
//   }

//   return (
//     <div className="bg-white border border-cream-dark rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-sage/50 transition-all duration-300 group flex flex-col h-full relative">
      
//       {/* 🟢 Image Box */}
//       <div className="relative w-full aspect-square bg-cream rounded-xl overflow-hidden mb-4">
//         <Link href={`/products/${product.slug}`}>
//           <img 
//             src={product.images?.[0] || "/placeholder.jpg"} 
//             alt={product.title} 
//             className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
//           />
//         </Link>
        
//         {/* Discount Badge */}
//         {discountPercentage > 0 && (
//           <div className="absolute top-3 left-3 bg-sage-dark text-white text-[11px] font-bold px-2 py-1 rounded-lg">
//             -{discountPercentage}%
//           </div>
//         )}

//         {/* Wishlist Button (Optional UI) */}
//         <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sage-light hover:text-red-500 hover:bg-white transition-colors shadow-sm">
//           <Heart size={16} />
//         </button>
//       </div>

//       {/* 🟢 Product Details */}
//       <div className="flex flex-col flex-grow">
//         {/* Category Name */}
//         <p className="text-[11px] font-bold text-sage-light uppercase tracking-wider mb-1">
//           {product.category?.name || "Gadget"}
//         </p>
        
//         {/* Title */}
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="text-sm font-semibold text-sage-dark line-clamp-2 hover:text-sage transition-colors mb-2">
//             {product.title}
//           </h3>
//         </Link>

//         {/* Rating & Reviews */}
//         <div className="flex items-center gap-1.5 mb-3 mt-auto">
//           <div className="flex items-center text-[#FF9900]">
//             <Star size={14} className="fill-[#FF9900]" />
//           </div>
//           <span className="text-xs font-bold text-sage-dark">{product.rating?.toFixed(1) || "0.0"}</span>
//           <span className="text-xs text-sage-light">({product.reviewCount || 0})</span>
//         </div>

//         {/* Pricing */}
//         <div className="flex items-end gap-2 mb-4">
//           <span className="text-lg font-bold text-sage-dark">
//             {formatPrice(product.price, currency, rates)}
//           </span>
//           {product.originalPrice && (
//             <span className="text-xs text-sage-light line-through font-medium mb-1">
//               {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//           )}
//         </div>

//         {/* View Deal Button */}
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full flex items-center justify-center gap-2 bg-sage/10 text-sage-dark hover:bg-sage hover:text-white py-2.5 rounded-xl text-sm font-bold transition-colors mt-auto border border-sage/20 hover:border-sage"
//         >
//           View Deal <ExternalLink size={16} />
//         </Link>
//       </div>
//     </div>
//   );
// }