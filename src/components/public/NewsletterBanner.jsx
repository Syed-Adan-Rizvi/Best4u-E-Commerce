// File Path: src/components/public/NewsletterBanner.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// 🛡️ FRONTEND ZOD SCHEMA (Bilkul backend jaisa)
const subscriberSchema = z.object({
  email: z.string().min(1, "Email likhna zaroori hai!").email("Bhai, yeh email theek nahi lag rahi. Sahi email likhein!").toLowerCase().trim()
});

export default function NewsletterBanner() {
  const [status, setStatus] = useState({ type: null, message: "" });

  // 🎣 React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subscriberSchema),
  });

  // 🚀 Form Submission Handler
  const onSubmit = async (data) => {
    setStatus({ type: null, message: "" }); // Reset previous messages
    
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kuch ghalat ho gaya. Dobara try karein.");
      }

      // Success
      setStatus({ type: "success", message: result.message });
      reset(); // Form clear kar do
      
    } catch (error) {
      // Error
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🎨 MAIN BANNER CONTAINER */}
        <div className="relative bg-sage-dark rounded-[24px] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* 🟢 BACKGROUND DECORATION (Concentric Circles from reference image) */}
          <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 opacity-20 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="199" stroke="#EAE5D9" strokeWidth="2"/>
              <circle cx="200" cy="200" r="149" stroke="#EAE5D9" strokeWidth="2"/>
              <circle cx="200" cy="200" r="99" stroke="#EAE5D9" strokeWidth="2"/>
            </svg>
          </div>

          {/* 🟢 LEFT CONTENT */}
          <div className="relative z-10 max-w-xl w-full">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F3F6F4] mb-4 tracking-tight">
              Join The Circle
            </h2>
            <p className="text-sm sm:text-base text-[#D1DDD6] leading-relaxed mb-8">
              Get weekly curation of the best deals and sustainable living tips delivered straight to your inbox. No spam, just pure inspiration.
            </p>

            {/* 🟢 SUBSCRIPTION FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Email Input */}
                <div className="flex-grow relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    disabled={isSubmitting}
                    {...register("email")}
                    className={`w-full bg-[#E5ECE7] text-sage-dark font-medium rounded-[12px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-sage-dark/60 transition-all ${
                      errors.email ? "border-2 border-red-400" : "border-none"
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E5ECE7] hover:bg-white text-sage-dark font-bold rounded-[12px] px-8 py-4 transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin text-sage-dark" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {/* ⚠️ FRONTEND ZOD ERROR MESSAGE */}
              {errors.email && (
                <p className="text-red-300 text-xs sm:text-sm mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} /> {errors.email.message}
                </p>
              )}

              {/* 🔔 BACKEND API RESPONSE MESSAGES (Success / Rate Limit / Duplicate) */}
              {status.message && !errors.email && (
                <p className={`text-xs sm:text-sm mt-3 flex items-center gap-1.5 font-medium ${status.type === "success" ? "text-green-300" : "text-red-300"}`}>
                  {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.message}
                </p>
              )}
            </form>

            {/* Privacy Policy Note */}
            <p className="text-[11px] sm:text-xs text-[#95AFA2] mt-4 font-medium">
              By subscribing you agree to our Privacy Policy.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}