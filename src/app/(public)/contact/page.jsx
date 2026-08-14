// File Path: src/app/(public)/contact/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, Loader2, CheckCircle2, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(e.target);
    
    // 🟢 Apna Web3Forms Access Key yahan dalein (Web3Forms.com se free milti hai)
    // Aap apni email par sign up karke free key generate kar sakte hain.
    formData.append("access_key", "567394cc-f35d-4a17-9eae-acf43c907ad6");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        e.target.reset();
      } else {
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-6">
          <Link href="/" className="hover:text-sage transition-colors">Home</Link>
          <span>›</span>
          <span className="text-sage-dark">Contact Us</span>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-3">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-sage-light">
            Have a question about our curated recommendations, partnerships, or need assistance? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Info Box */}
          <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 lg:col-span-1">
            <h3 className="text-lg font-serif font-bold text-sage-dark">Contact Information</h3>
            <p className="text-xs sm:text-sm text-sage-light leading-relaxed">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-4 pt-4 border-t border-cream-dark">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-sage-light uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-semibold text-sage-dark mt-0.5">adanrizvihfd@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-sage-light uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-sage-dark mt-0.5">Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-10 shadow-sm lg:col-span-2">
            
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-sage/10 text-sage rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-sage-dark">Message Sent Successfully!</h3>
                <p className="text-sm text-sage-light max-w-sm mx-auto">
                  Thank you for reaching out. We have received your message and will get back to you shortly via email.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-sage text-white text-xs font-bold rounded-xl hover:bg-sage-dark transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-sage-dark uppercase tracking-wider mb-2">Your Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream/50 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm text-sage-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sage-dark uppercase tracking-wider mb-2">Your Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="e.g. john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream/50 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm text-sage-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sage-dark uppercase tracking-wider mb-2">Subject *</label>
                  <input 
                    type="text" 
                    name="subject" 
                    required 
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream/50 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm text-sage-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sage-dark uppercase tracking-wider mb-2">Message *</label>
                  <textarea 
                    name="message" 
                    required 
                    rows={5}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream/50 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm text-sage-dark resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-bold transition-all shadow-sm disabled:opacity-70 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}