// File Path: src/app/(public)/layout.jsx
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import connectDB from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export const revalidate = 60; 


export default async function PublicLayout({ children }) {
  await connectDB();

  // 1. Fetch Site Settings for Navbar and Footer
  let settings = await SiteSettings.findOne({}).lean();
  
  // Agar DB khali hai toh default fallback do
  if (!settings) {
    settings = {
      siteName: "Best4u",
      socialLinks: [],
      contactEmail: "hello@best4u.com"
    };
  } else {
    settings = JSON.parse(JSON.stringify(settings));
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      
      {/* 🟢 TOP: Global Navigation Bar (Data passed) */}
      <Navbar settings={settings} />
      
      {/* 🟢 MIDDLE: Dynamic Page Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* 🟢 BOTTOM: Global Footer (Data passed) */}
      <Footer settings={settings} />
      
    </div>
  );
}