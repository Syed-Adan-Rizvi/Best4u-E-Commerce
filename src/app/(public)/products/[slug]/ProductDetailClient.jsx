// File Path: src/app/(public)/products/[slug]/ProductDetailClient.jsx
"use client";

import { useState, useRef } from "react";
import { ExternalLink, Loader2, Play } from "lucide-react"; 
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatPrice } from "@/lib/formatPrice";

export default function ProductDetailClient({ product, type = "gallery" }) {
  const { currency, rates } = useCurrencyStore();
  
  const [mainImage, setMainImage] = useState(product.images?.[0] || "/placeholder.jpg");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // 🟢 Video Player States
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // ==========================================
  // CLICK TRACKING LOGIC
  // ==========================================
  const handleViewDealClick = async () => {
    setIsRedirecting(true); 
    
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });
    } catch (error) {
      console.error("Click track nahi ho saka.");
    }

    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
        setIsRedirecting(false);
    }, 1000);
  };

  // ==========================================
  // VIDEO PLAY/PAUSE LOGIC
  // ==========================================
  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  // ==========================================
  // RENDER: ACTION BUTTON
  // ==========================================
  if (type === "actionButton") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-sage-dark tracking-tight">
            {formatPrice(product.price, currency, rates)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xl text-sage-light font-semibold line-through pb-1">
                {formatPrice(product.originalPrice, currency, rates)}
            </span>
            )}
        </div>

        <button 
          onClick={handleViewDealClick}
          disabled={isRedirecting}
          className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-4 rounded-xl text-lg font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-80"
        >
          {isRedirecting ? (
             <><Loader2 className="animate-spin" size={20}/> Redirecting...</>
          ) : (
             <>View Deal <ExternalLink size={20} /></>
          )}
        </button>
        <p className="text-xs font-medium text-sage-light text-center">
            *This link takes you to {product.source === "AmazonAPI" ? "Amazon" : "the retailer"}.
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER: CUSTOM HTML5 VIDEO PLAYER (Fix for Admin MP4 uploads)
  // ==========================================
  if (type === "video") {
    return (
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-cream-dark aspect-video relative group bg-[#000000]">
            
            <video 
              ref={videoRef}
              src={product.videoUrl} 
              poster={mainImage} // Shuru mein image dikhayega
              className="w-full h-full object-contain cursor-pointer"
              controls={isVideoPlaying} // Jab chale gi tou default controls show honge taake full screen aur volume manage ho sake
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
              onClick={handlePlayVideo}
            />

            {/* Custom Play Overlay (Jab Video ruki ho) */}
            {!isVideoPlaying && (
              <div 
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:bg-black/40"
                onClick={handlePlayVideo}
              >
                {/* The Big Sage Green Play Button */}
                <button className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 bg-sage/90 hover:bg-sage text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(90,115,99,0.5)] transition-transform transform group-hover:scale-110">
                  <Play fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 ml-2" />
                </button>
              </div>
            )}
        </div>
    );
  }

  // ==========================================
  // RENDER: IMAGE GALLERY
  // ==========================================
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square bg-[#F3EFE9] rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-cream-dark">
        <img 
          src={mainImage} 
          alt={product.title} 
          className="max-w-full max-h-full object-contain mix-blend-multiply transition-opacity duration-300"
        />
      </div>

      {product.images && product.images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {product.images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setMainImage(img)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex-shrink-0 bg-white p-2 overflow-hidden transition-all ${mainImage === img ? 'border-sage shadow-md' : 'border-cream-dark opacity-70 hover:opacity-100'}`}
            >
              <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-contain mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
















// // File Path: src/app/(public)/products/[slug]/ProductDetailClient.jsx
// "use client";

// import { useState } from "react";
// import { ExternalLink, Loader2 } from "lucide-react";
// import { useCurrencyStore } from "@/store/useCurrencyStore";
// import { formatPrice } from "@/lib/formatPrice";

// export default function ProductDetailClient({ product, type = "gallery" }) {
//   const { currency, rates } = useCurrencyStore();
  
//   // States for Gallery
//   const [mainImage, setMainImage] = useState(product.images?.[0] || "/placeholder.jpg");
  
//   // States for Action Button (Click Tracking)
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   // 🟢 🎯 CLICK TRACKING LOGIC
//   const handleViewDealClick = async () => {
//     setIsRedirecting(true); // Button pe spinner dikhane ke liye
    
//     try {
//       // 1. API ko hit maro taake click count +1 ho jaye (Background process)
//       await fetch('/api/track-click', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ productId: product._id }),
//       });
//     } catch (error) {
//       console.error("Click track nahi ho saka, par redirect jari rahega.");
//     }

//     // 2. Chupke se naye tab mein Amazon link khol do
//     window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
    
//     // 3. Wapas state theek kar do
//     setTimeout(() => {
//         setIsRedirecting(false);
//     }, 1000);
//   };

//   // ==========================================
//   // RENDER: ACTION BUTTON ONLY (Price + Affiliate logic)
//   // ==========================================
//   if (type === "actionButton") {
//     return (
//       <div className="flex flex-col gap-4">
//         {/* Dynamic Price Display according to Currency Store */}
//         <div className="flex items-end gap-3 mb-2">
//             <span className="text-4xl sm:text-5xl font-extrabold text-sage-dark tracking-tight">
//             {formatPrice(product.price, currency, rates)}
//             </span>
//             {product.originalPrice && product.originalPrice > product.price && (
//             <span className="text-xl text-sage-light font-semibold line-through pb-1">
//                 {formatPrice(product.originalPrice, currency, rates)}
//             </span>
//             )}
//         </div>

//         {/* 🟢 The Magic Button */}
//         <button 
//           onClick={handleViewDealClick}
//           disabled={isRedirecting}
//           className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-4 rounded-xl text-lg font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-80"
//         >
//           {isRedirecting ? (
//              <><Loader2 className="animate-spin" size={20}/> Redirecting...</>
//           ) : (
//              <>View Deal <ExternalLink size={20} /></>
//           )}
//         </button>
//         <p className="text-xs font-medium text-sage-light text-center">
//             *This link takes you to {product.source === "AmazonAPI" ? "Amazon" : "the retailer"}.
//         </p>
//       </div>
//     );
//   }

//   // ==========================================
//   // RENDER: IMAGE GALLERY
//   // ==========================================
//   return (
//     <div className="flex flex-col gap-4">
//       {/* Big Main Image Container */}
//       <div className="w-full aspect-square bg-[#F3EFE9] rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-cream-dark">
//         <img 
//           src={mainImage} 
//           alt={product.title} 
//           className="max-w-full max-h-full object-contain mix-blend-multiply transition-opacity duration-300"
//         />
//       </div>

//       {/* Thumbnails (Only show if multiple images exist) */}
//       {product.images && product.images.length > 1 && (
//         <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
//           {product.images.map((img, idx) => (
//             <button 
//               key={idx}
//               onClick={() => setMainImage(img)}
//               className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex-shrink-0 bg-white p-2 overflow-hidden transition-all ${mainImage === img ? 'border-sage shadow-md' : 'border-cream-dark opacity-70 hover:opacity-100'}`}
//             >
//               <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-contain mix-blend-multiply" />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }