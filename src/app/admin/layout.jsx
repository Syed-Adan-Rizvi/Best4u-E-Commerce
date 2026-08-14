"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";
import { Toaster } from 'sonner';

// =================================================================
// 🏗️ UI STORY: "Responsive Admin Panel Framework"
// Customized Sage & Cream Palette integrated with full dynamic layout controls.
// Handle karta hai mobile sidebar state aur desktop margins ko.
// =================================================================
export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🐛 DEBUGGING CONSOLE
  useEffect(() => {
    console.log("🏢 [UI Render] Admin Layout Loaded");
  }, []);

  return (
    <div className="min-h-screen bg-cream text-sage-dark font-sans flex flex-col">
      
      {/* 👈/👉 SIDEBAR DRAWER (Desktop Left, Mobile/Tablet Right Drawer) */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* MAIN CONTAINER AREA */}
      {/* 📱 Responsive Margin: Desktop par ml-64 (Left sidebar space), Mobile/Tablet par ml-0 */}
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* 🟢 TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-cream-dark sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-sage-dark tracking-tight">
              Admin Workspace
            </h2>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Admin Avatar Icon */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cream-dark border border-cream-dark flex items-center justify-center text-sage-dark font-bold text-xs sm:text-sm shadow-xs">
                A
              </div>
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-sage-dark">
                Admin
              </span>
            </div>

            {/* 📱 HAMBURGER MENU BUTTON (Sirf Mobile & Tablet par Right Corner par Dikhayega) */}
            <button
              onClick={() => {
                console.log("🍔 [UI Action] Hamburger Icon Clicked -> Opening Right Side Menu");
                setIsMobileMenuOpen(true);
              }}
              className="lg:hidden p-2 rounded-xl bg-cream border border-cream-dark text-sage-dark hover:bg-sage hover:text-white transition-all duration-200"
              aria-label="Toggle Mobile Menu"
            >
              <Menu size={22} />
            </button>

          </div>
        </header>

        {/* 🟢 MAIN DYNAMIC CONTENT CONTAINER */}
        {/* Responsive Padding: Mobile (p-4), Tablet (p-6), Laptop/Desktop (p-8) */}
        <Toaster position="top-right" richColors/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}