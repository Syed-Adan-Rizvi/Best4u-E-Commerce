// File Path: src/components/public/HeroSection.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import Typewriter from "typewriter-effect";
import CountUp from "react-countup";

export default function HeroSection({ settings, heroImages }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return; 
    
    const timer = setInterval(() => {
      setCurrentImgIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); 

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const parseBadgeValue = (val) => {
    const stringVal = String(val);
    const number = parseFloat(stringVal.replace(/[^\d.-]/g, "")) || 0;
    const suffix = stringVal.replace(/[\d.-]/g, ""); 
    const decimals = stringVal.includes(".") ? 1 : 0; 
    return { number, suffix, decimals };
  };

  const badges = settings?.trustBadges?.length === 3 ? settings.trustBadges : [
    { value: "500+", label: "Curated Products" },
    { value: "50k+", label: "Happy Shoppers" },
    { value: "4.8", label: "Avg. Rating" }
  ];

  const typewriterLines = settings?.heroTypewriterLines?.length > 0 
    ? settings.heroTypewriterLines 
    : ["Find Top Trending Deals", "Shop Smart & Save Big", "Your Daily Dose of Inspiration"];

  return (
    <section className="relative bg-transparent pt-12 pb-20 lg:pt-0 lg:pb-0 overflow-hidden">
      
      {/* 🟢 CUSTOM CSS FOR SMOOTH FLOATING ANIMATION */}
      <style>{`
        @keyframes floatSmooth {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-slow {
          animation: floatSmooth 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: floatSmooth 4.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* ========================================== */}
          {/* 🟢 LEFT SIDE: Text & Stats */}
          {/* ========================================== */}
          <div className="max-w-2xl relative z-20 pt-4 lg:pt-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-sm font-semibold mb-6">
              <Sparkles size={16} className="text-sage" />
              <span>Curated by experts</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-sage-dark leading-[1.15] tracking-tight mb-3">
              Discover The Best <br className="hidden sm:block" />
              <span className="text-sage">Products</span>
            </h1>

            <div className="text-lg sm:text-xl font-medium text-sage mb-6 min-h-[32px] sm:min-h-[36px]">
              <Typewriter
                options={{
                  strings: typewriterLines,
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            </div>

            <p className="text-base sm:text-lg text-sage-dark leading-relaxed mb-8 max-w-lg">
              {settings?.heroDescription || "Handpicked deals on electronics, home essentials, fashion, and more — all from trusted retailers."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link href="/trending" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                Browse Trending Deals <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3.5 rounded-xl font-semibold transition-all">
                Explore Categories
              </Link>
            </div>

            {/* 🟢 ANIMATED NUMBER COUNTERS */}
            <div className="grid grid-cols-3 gap-2 sm:gap-8 pt-8 border-t border-cream-dark pb-8 lg:pb-20">
              {badges.map((badge, index) => {
                const { number, suffix, decimals } = parseBadgeValue(badge.value);
                return (
                  <div key={index}>
                    <p className="text-xl sm:text-3xl font-bold text-sage-dark mb-1 flex items-center gap-1">
                      <CountUp end={number} decimals={decimals} suffix={suffix} duration={2.5} enableScrollSpy scrollSpyOnce />
                      {index === 2 && <Star size={16} className="text-[#FF9900] fill-[#FF9900] sm:w-5 sm:h-5" />}
                    </p>
                    <p className="text-[11px] sm:text-sm text-sage-light font-medium">{badge.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================== */}
          {/* 🟢 RIGHT SIDE: Floating Product Concept */}
          {/* ========================================== */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-[650px] flex items-center justify-center">
            
            {/* 🌟 Glowing Background Aura */}
            <div className="absolute inset-0 m-auto w-[85%] h-[85%] bg-sage/20 rounded-full blur-[80px] sm:blur-[100px] -z-10"></div>
            
            {/* 🌟 Fading Product Images */}
            {heroImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Featured Product ${index + 1}`}
                className={`absolute w-3/4 sm:w-4/5 h-3/4 sm:h-4/5 object-contain transition-all duration-1000 ease-in-out drop-shadow-2xl ${
                  index === currentImgIndex ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 -rotate-3"
                }`}
              />
            ))}
            
            {/* 🌟 Floating Badge 1 (Top Right) - Position adjusted for mobile */}
            <div className="absolute top-4 right-0 sm:top-10 sm:right-4 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-slow z-20 scale-90 sm:scale-100 origin-top-right">
              <div className="bg-sage/20 p-1.5 sm:p-2 rounded-full">
                <ShieldCheck size={18} className="text-sage sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-sage-dark leading-tight">Best Value</p>
                <p className="text-[9px] sm:text-[10px] text-sage-light">Top Rated Deals!</p>
              </div>
            </div>

            {/* 🌟 Floating Badge 2 (Bottom Left) - Position adjusted for mobile */}
            <div className="absolute bottom-10 left-0 sm:bottom-16 sm:left-4 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-delay z-20 scale-90 sm:scale-100 origin-bottom-left">
              <div className="bg-[#FF9900]/10 p-1.5 sm:p-2 rounded-full">
                <CheckCircle2 size={18} className="text-[#FF9900] sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-sage-dark leading-tight">100% Authentic</p>
                <p className="text-[9px] sm:text-[10px] text-sage-light">Verified Quality</p>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sage/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-cream-dark/50 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
}









// // File Path: src/components/public/HeroSection.jsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowRight, Star, Sparkles, ShieldCheck } from "lucide-react";
// import Typewriter from "typewriter-effect";
// import CountUp from "react-countup";

// export default function HeroSection({ settings, heroImages }) {
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);

//   useEffect(() => {
//     if (heroImages.length <= 1) return; 
    
//     const timer = setInterval(() => {
//       setCurrentImgIndex((prevIndex) => 
//         prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 4000); 

//     return () => clearInterval(timer);
//   }, [heroImages.length]);

//   const parseBadgeValue = (val) => {
//     const stringVal = String(val);
//     const number = parseFloat(stringVal.replace(/[^\d.-]/g, "")) || 0;
//     const suffix = stringVal.replace(/[\d.-]/g, ""); 
//     const decimals = stringVal.includes(".") ? 1 : 0; 
//     return { number, suffix, decimals };
//   };

//   const badges = settings?.trustBadges?.length === 3 ? settings.trustBadges : [
//     { value: "500+", label: "Curated Products" },
//     { value: "50k+", label: "Happy Shoppers" },
//     { value: "4.8", label: "Avg. Rating" }
//   ];

//   const typewriterLines = settings?.heroTypewriterLines?.length > 0 
//     ? settings.heroTypewriterLines 
//     : ["Find Top Trending Deals", "Shop Smart & Save Big", "Your Daily Dose of Inspiration"];

//   return (
//     <section className="relative bg-transparent pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
//           {/* ========================================== */}
//           {/* 🟢 LEFT SIDE: Text & Stats */}
//           {/* ========================================== */}
//           <div className="max-w-2xl">
//             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-sm font-semibold mb-6">
//               <Sparkles size={16} className="text-sage" />
//               <span>Curated by experts</span>
//             </div>

//             {/* 🟢 FIXED MAIN HEADING (Badi) */}
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-sage-dark leading-[1.15] tracking-tight mb-3">
//               Discover The Best <br className="hidden sm:block" />
//               <span className="text-sage">Products</span>
//             </h1>

//             {/* 🟢 DYNAMIC TYPEWRITER SUBHEADING (Choti) */}
//             <div className="text-lg sm:text-xl font-medium text-sage-light mb-6 min-h-[32px] sm:min-h-[36px]">
//               <Typewriter
//                 options={{
//                   strings: typewriterLines,
//                   autoStart: true,
//                   loop: true,
//                   delay: 50,
//                   deleteSpeed: 30,
//                 }}
//               />
//             </div>

//             <p className="text-base sm:text-lg text-sage-light/80 leading-relaxed mb-8 max-w-lg">
//               {settings?.heroDescription || "Handpicked deals on electronics, home essentials, fashion, and more — all from trusted retailers."}
//             </p>

//             <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
//               <Link href="/deals" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
//                 Browse Trending Deals <ArrowRight size={18} />
//               </Link>
//               <Link href="/categories" className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3.5 rounded-xl font-semibold transition-all">
//                 Explore Categories
//               </Link>
//             </div>

//             {/* 🟢 ANIMATED NUMBER COUNTERS */}
//             <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-cream-dark">
//               {badges.map((badge, index) => {
//                 const { number, suffix, decimals } = parseBadgeValue(badge.value);
//                 return (
//                   <div key={index}>
//                     <p className="text-2xl sm:text-3xl font-bold text-sage-dark mb-1 flex items-center gap-1">
//                       <CountUp 
//                         end={number} 
//                         decimals={decimals} 
//                         suffix={suffix} 
//                         duration={2.5} 
//                         enableScrollSpy 
//                         scrollSpyOnce 
//                       />
//                       {index === 2 && <Star size={20} className="text-[#FF9900] fill-[#FF9900]" />}
//                     </p>
//                     <p className="text-xs sm:text-sm text-sage-light font-medium">{badge.label}</p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ========================================== */}
//           {/* 🟢 RIGHT SIDE: Image Fader */}
//           {/* ========================================== */}
//           <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-cream-dark">
//             {heroImages.map((src, index) => (
//               <img
//                 key={index}
//                 src={src}
//                 alt={`Featured Product ${index + 1}`}
//                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
//                   index === currentImgIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
//                 }`}
//               />
//             ))}
//             <div className="absolute inset-0 bg-gradient-to-tr from-sage-dark/20 to-transparent"></div>
//             <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
//               <div className="bg-sage/20 p-2 rounded-full">
//                 <ShieldCheck size={20} className="text-sage" />
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-sage-dark">Best Value</p>
//                 <p className="text-[10px] text-sage-light">Top Rated Deals!</p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
      
//       <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sage/5 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-cream-dark/50 rounded-full blur-3xl"></div>
//     </section>
//   );
// }








// // File Path: src/components/public/HeroSection.jsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowRight, Star, Sparkles, ShieldCheck } from "lucide-react";

// export default function HeroSection() {
//   // 🖼️ Dummy Images for Fader (Baad mein yeh DB se aayengi)
//   const heroImages = [
//     "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop", // Headphones
//     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop", // Smartwatch
//     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop", // Shoes
//   ];

//   // 🔄 Image Fader Logic (Har 4 second baad image change hogi)
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentImgIndex((prevIndex) => 
//         prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 4000); // 4000ms = 4 seconds

//     return () => clearInterval(timer);
//   }, [heroImages.length]);

//   return (
//     // <section className="relative bg-[#FDFBF7] pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
//     <section className="relative bg-transparent pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
//           {/* ========================================== */}
//           {/* 🟢 LEFT SIDE: Text, Buttons & Stats */}
//           {/* ========================================== */}
//           <div className="max-w-2xl">
//             {/* Top Badge */}
//             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-sm font-semibold mb-6">
//               <Sparkles size={16} className="text-sage" />
//               <span>Curated by experts</span>
//             </div>

//             {/* Main Heading */}
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-sage-dark leading-[1.15] tracking-tight mb-6">
//               Discover The Best <br className="hidden sm:block" />
//               <span className="text-sage">Products</span>
//             </h1>

//             {/* Description */}
//             <p className="text-base sm:text-lg text-sage-light leading-relaxed mb-8 max-w-lg">
//               Handpicked deals on electronics, home essentials, fashion, and more — all from trusted retailers. No clutter, just quality.
//             </p>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
//               <Link 
//                 href="/deals" 
//                 className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
//               >
//                 Browse Trending Deals <ArrowRight size={18} />
//               </Link>
//               <Link 
//                 href="/categories" 
//                 className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3.5 rounded-xl font-semibold transition-all"
//               >
//                 Explore Categories
//               </Link>
//             </div>

//             {/* Stats Section */}
//             <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-cream-dark">
//               <div>
//                 <p className="text-2xl sm:text-3xl font-bold text-sage-dark mb-1">500+</p>
//                 <p className="text-xs sm:text-sm text-sage-light font-medium">Curated Products</p>
//               </div>
//               <div>
//                 <p className="text-2xl sm:text-3xl font-bold text-sage-dark mb-1">50k+</p>
//                 <p className="text-xs sm:text-sm text-sage-light font-medium">Happy Shoppers</p>
//               </div>
//               <div>
//                 <p className="text-2xl sm:text-3xl font-bold text-sage-dark mb-1 flex items-center gap-1">
//                   4.8 <Star size={20} className="text-[#FF9900] fill-[#FF9900]" />
//                 </p>
//                 <p className="text-xs sm:text-sm text-sage-light font-medium">Avg. Rating</p>
//               </div>
//             </div>
//           </div>

//           {/* ========================================== */}
//           {/* 🟢 RIGHT SIDE: Image Fader & Badges */}
//           {/* ========================================== */}
//           <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-cream-dark">
            
//             {/* The Images (Cross-Fade Effect) */}
//             {heroImages.map((src, index) => (
//               <img
//                 key={index}
//                 src={src}
//                 alt="Curated Product"
//                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
//                   index === currentImgIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
//                 }`}
//               />
//             ))}
            
//             {/* Overlay Gradient (For better contrast) */}
//             <div className="absolute inset-0 bg-gradient-to-tr from-sage-dark/20 to-transparent"></div>

//             {/* Floating Badge 1 (Best Value) */}
//             <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
//               <div className="bg-sage/20 p-2 rounded-full">
//                 <ShieldCheck size={20} className="text-sage" />
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-sage-dark">Best Value</p>
//                 <p className="text-[10px] text-sage-light">Up to 40% off!</p>
//               </div>
//             </div>
            
//           </div>

//         </div>
//       </div>
      
//       {/* Background Decor (Subtle Circles) */}
//       <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sage/5 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-cream-dark/50 rounded-full blur-3xl"></div>
//     </section>
//   );
// }