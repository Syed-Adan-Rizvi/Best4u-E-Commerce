// File Path: src/app/error.jsx
"use client"; // Error boundaries hamesha client components hote hain

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  // Console mein error log karega debugging ke liye
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF8F5] px-4 py-16">
      
      <style>{`
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-gentle-pulse {
          animation: gentlePulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center max-w-lg mx-auto">
        
        {/* Animated Icon Container */}
        <div className="relative w-32 h-32 mx-auto mb-8 animate-gentle-pulse">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-xl"></div>
          <div className="relative w-full h-full bg-white border-2 border-red-200 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-4xl font-serif font-extrabold text-sage-dark mb-4">Oops! Something went wrong.</h1>
        
        <p className="text-sage-light mb-10 text-base leading-relaxed px-2">
          We encountered an unexpected glitch while fetching this page. Don't worry, our system has logged it and we're looking into it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-cream-dark hover:border-sage text-sage-dark rounded-xl font-bold transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="text-sage-light group-hover:text-sage transition-colors group-hover:-translate-x-1" />
            Go Back
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-bold transition-all shadow-md group"
          >
            <Home size={18} className="group-hover:scale-110 transition-transform" />
            Home Page
          </Link>

          {/* Optional: 'Try Again' button using reset() function provided by Next.js */}
          <button 
            onClick={() => reset()} 
            className="w-full sm:w-auto mt-4 sm:mt-0 text-sage-dark font-bold text-sm hover:underline"
          >
            Try Again
          </button>
        </div>

      </div>
    </div>
  );
}