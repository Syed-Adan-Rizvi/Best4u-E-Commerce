// File Path: src/app/not-found.jsx
"use client"; // useRouter ke liye zaroori hai

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF8F5] px-4 py-16">
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center max-w-md mx-auto">
        {/* Animated Icon Container */}
        <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
          <div className="absolute inset-0 bg-sage/20 rounded-full blur-xl"></div>
          <div className="relative w-full h-full bg-white border-2 border-sage/30 rounded-full flex items-center justify-center shadow-lg">
            <FileQuestion size={48} className="text-sage" />
          </div>
        </div>

        <h1 className="text-5xl font-serif font-extrabold text-sage-dark mb-4">404</h1>
        <h2 className="text-2xl font-bold text-sage-dark mb-3">Page Not Found</h2>
        
        <p className="text-sage-light mb-10 text-base leading-relaxed">
          Oops! The mindful creation you are looking for seems to have wandered off. Let's get you back on track.
        </p>

        {/* Buttons */}
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
        </div>

      </div>
    </div>
  );
}