// File Path: src/components/public/FlashDealCard.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, ArrowRight } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatPrice } from "@/lib/formatPrice";

export default function FlashDealCard({ product }) {
  const { currency, rates } = useCurrencyStore();
  
  // 1️⃣ Timer State
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); 
      const diff = midnight - now;

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");

      setTimeLeft({ h, m, s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2️⃣ Discount Calculator
  let discountPercent = null;
  if (product.originalPrice && product.originalPrice > product.price) {
    discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  // 🌟 Dynamic Star Rating Logic (Compact Size)
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-[#FF9900]" size={11}  />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-[#FF9900]" size={11} />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-sage-light opacity-40" size={11} />);
    }
    return stars;
  };

  return (
    // 🟢 FULL WHITE CARD: Clean layout matching standard theme
    <div className="bg-white border border-cream-dark rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-row h-[170px] sm:h-[180px] group relative">
      
      {/* ⏰ TOP RIGHT: Orange Timer (Color changed to #FF9900) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 text-[#FF9900] font-extrabold text-[10px] sm:text-[11px] bg-[#FF9900]/10 border border-[#FF9900]/20 px-2 py-1 rounded-md z-10 shadow-sm">
        <Timer size={12} className="animate-pulse" />
        {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
      </div>

      {/* 🟢 LEFT: Image Container (Transparent/Cream background) */}
      <div className="relative w-[40%] bg-transparent flex items-center justify-center p-3 border-r border-cream-dark/40">
        
        {/* 🏷️ TOP LEFT: Sale Badge (Color changed to #FF9900) */}
        {discountPercent ? (
          <div className="absolute top-2 left-2 bg-[#FF9900] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10">
            SAVE {discountPercent}%
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-[#FF9900] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10">
            HOT DEAL
          </div>
        )}

        <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img 
            src={product.images?.[0] || "/placeholder.jpg"} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.08] transition-transform duration-500"
          />
        </Link>
      </div>

      {/* 🟢 RIGHT: Content Container (White Background) */}
      <div className="w-[60%] px-3 py-4 sm:p-4 flex flex-col justify-between bg-white relative">
        
        {/* Text Section (Added mt-6 so timer doesn't overlap text) */}
        <div className="mt-5 sm:mt-6">
          <p className="text-[9px] sm:text-[10px] font-bold text-sage-light uppercase tracking-wider line-clamp-1 mb-0.5">
            {product.category?.name || "Category"}
          </p>
          
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-[13px] sm:text-[14px] font-bold text-sage-dark leading-snug line-clamp-2 hover:text-sage transition-colors">
              {product.title}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-sage-dark mt-0.5">
              {product.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>

        {/* Pricing & Button Row */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-sage-light line-through leading-none mb-0.5">
                {formatPrice(product.originalPrice, currency, rates)}
              </span>
            )}
            <span className="text-[17px] sm:text-[19px] font-extrabold text-sage-dark tracking-tight leading-none">
              {formatPrice(product.price, currency, rates)}
            </span>
          </div>

          {/* Circular Button */}
          <Link 
            href={`/products/${product.slug}`} 
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-sage hover:bg-sage-dark text-white rounded-full transition-colors shadow-sm shrink-0 group/btn"
          >
            <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}