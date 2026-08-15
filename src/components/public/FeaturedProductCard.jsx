// File Path: src/components/public/FeaturedProductCard.jsx
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatPrice } from "@/lib/formatPrice";

export default function FeaturedProductCard({ product }) {
  const { currency, rates } = useCurrencyStore();

  // 🌟 Dynamic Star Rating Logic (Smaller size for compact card)
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-[#FF9900]" size={12}  />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-[#FF9900]" size={12} />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-sage-light opacity-40" size={12} />);
    }

    return stars;
  };

  return (
    <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-row h-[160px] sm:h-[180px] group">
      
      {/* 🟢 LEFT: Image Container (40% Width) */}
      <div className="relative w-[40%] bg-cream/30 flex items-center justify-center p-3 border-r border-cream-dark/50">
        <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img 
            src={product.images?.[0] || "/placeholder.jpg"} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.08] transition-transform duration-500"
          />
        </Link>
      </div>

      {/* 🟢 RIGHT: Content Container (60% Width) */}
      <div className="w-[60%] p-4 flex flex-col justify-between bg-white relative">
        
        <div className="space-y-1">
          {/* Category */}
          <p className="text-[10px] sm:text-xs font-bold text-sage uppercase tracking-wider line-clamp-1">
            {product.category?.name || "Category"}
          </p>
          
          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2 mt-1">
            <div className="flex items-center">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-[11px] font-bold text-sage-dark mt-0.5">
              {product.rating?.toFixed(1) || "0.0"}
            </span>
          </div>

          {/* Pricing & Small Action Button */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] font-semibold text-sage-light line-through leading-none mb-0.5">
                  {formatPrice(product.originalPrice, currency, rates)}
                </span>
              )}
              <span className="text-[18px] sm:text-[20px] font-extrabold text-sage-dark tracking-tight leading-none">
                {formatPrice(product.price, currency, rates)}
              </span>
            </div>

            {/* Circular View Button (Compact look) */}
            <Link 
              href={`/products/${product.slug}`} 
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-sage/10 hover:bg-sage text-sage hover:text-white rounded-full transition-colors"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}