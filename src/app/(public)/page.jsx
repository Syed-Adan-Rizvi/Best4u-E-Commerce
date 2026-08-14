// File Path: src/app/(public)/page.jsx
import HeroSection from "@/components/public/HeroSection";
import TrustBadges from "@/components/public/TrustBadges";
import ShopByCategories from "@/components/public/ShopByCategories";
import TrendingDeals from "@/components/public/TrendingDeals";
import FeaturedProducts from "@/components/public/FeaturedProducts";
import NewArrivals from "@/components/public/NewArrivals";
import NewsletterBanner from "@/components/public/NewsletterBanner"; 

import connectDB from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Product from "@/models/Product";

export const revalidate = 60; 

// 🚀 HOMEPAGE SEO CONFIGURATION (Dynamic Metadata)
export async function generateMetadata() {
  await connectDB();
  const settings = await SiteSettings.findOne({}).lean();
  
  return {
    title: settings?.metaTitle || "Verdant Finds | Discover The Best Products",
    description: settings?.metaDescription || "Handpicked deals on electronics, home essentials, fashion, and more.",
  };
}

export default async function HomePage() {
  await connectDB();

  // 1. Fetch Site Settings (Schema ke mutabiq)
  let settings = await SiteSettings.findOne({}).lean();
  if (!settings) {
    settings = {
      heroTypewriterLines: ["Discover The Best Products"],
      heroDescription: "Handpicked deals on electronics, home essentials, fashion, and more — all from trusted retailers.",
      trustBadges: [
        { value: "500+", label: "Curated Products" },
        { value: "50k+", label: "Happy Shoppers" },
        { value: "4.8", label: "Avg. Rating" }
      ],
      heroImages: [] // Fallback handled below
    };
  } else {
    settings = JSON.parse(JSON.stringify(settings));
  }

  // 2. Fetch Top Featured Product Images (Agar admin ne SiteSettings mein heroImages nahi lagaye)
  let finalHeroImages = settings.heroImages || [];
  
  if (finalHeroImages.length === 0) {
    const featuredProducts = await Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("images")
      .lean();

    finalHeroImages = featuredProducts.length > 0 
      ? featuredProducts.map(p => p.images[0]) 
      : [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
        ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      
      {/* 🌟 Pass correct schema fields to HeroSection */}
      <HeroSection settings={settings} heroImages={finalHeroImages} />
      
      <TrustBadges /> 
      <ShopByCategories />
      <TrendingDeals />
      <FeaturedProducts />
      <NewArrivals />
      <NewsletterBanner />

    </div>
  );
}





// // File Path: src/app/(public)/page.jsx
// import HeroSection from "@/components/public/HeroSection";
// import TrustBadges from "@/components/public/TrustBadges";
// import ShopByCategories from "@/components/public/ShopByCategories";
// import TrendingDeals from "@/components/public/TrendingDeals";
// import FeaturedProducts from "@/components/public/FeaturedProducts";
// import NewArrivals from "@/components/public/NewArrivals";
// import NewsletterBanner from "@/components/public/NewsletterBanner"; // 🌟 Naya Import

// export default function HomePage() {
//   return (
//     <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
//       <HeroSection />
//       <TrustBadges /> 
//       <ShopByCategories />
//       <TrendingDeals />
//       <FeaturedProducts />
//       <NewArrivals />
      
//       {/* 🟢 7. Newsletter Subscription Banner */}
//       <NewsletterBanner />

//     </div>
//   );
// }