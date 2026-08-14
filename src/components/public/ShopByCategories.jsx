// File Path: src/components/public/ShopByCategories.jsx
import Link from "next/link";
import { 
  ArrowRight, 
  Box, 
  MonitorSmartphone, 
  Shirt, 
  Sofa, 
  Dumbbell, 
  Sparkles, 
  ChefHat, 
  CarFront,
  Headphones,
  BookOpen,
  ShoppingCart, // Day to day / Groceries
  Watch,        // Accessories
  Gamepad,      // Toys
  Baby,         // Kids / Babies
  Cpu,          // Gadgets
  Camera,       // Photography
  HeartPulse,   // Health / Medical
  PawPrint,     // Pets
  Glasses       // Eyewear
} from "lucide-react";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

// 🟢 THE ENHANCED MAGIC DICTIONARY: Automatically pick an icon based on category name
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  // 1. Electronics, Gadgets, Devices
  if (name.includes("electronic") || name.includes("mobile") || name.includes("computer") || name.includes("device") || name.includes("laptop")) return <MonitorSmartphone size={32} />;
  if (name.includes("gadget") || name.includes("tech")) return <Cpu size={32} />;
  if (name.includes("camera") || name.includes("photo")) return <Camera size={32} />;

  // 2. Fashion, Clothing, Mens, Womens
  if (name.includes("fashion") || name.includes("cloth") || name.includes("wear") || name.includes("apparel") || name.includes("men") || name.includes("women")) return <Shirt size={32} />;

  // 3. Accessories, Watches, Glasses
  if (name.includes("accessor") || name.includes("watch") || name.includes("jewel")) return <Watch size={32} />;
  if (name.includes("glass") || name.includes("eyewear")) return <Glasses size={32} />;

  // 4. Kids, Toys, Babies
  if (name.includes("toy") || name.includes("game")) return <Gamepad size={32} />;
  if (name.includes("kid") || name.includes("baby") || name.includes("child")) return <Baby size={32} />;

  // 5. Furniture, Home
  if (name.includes("furnitur") || name.includes("home") || name.includes("decor")) return <Sofa size={32} />;

  // 6. Sports, Fitness
  if (name.includes("sport") || name.includes("fit") || name.includes("gym") || name.includes("outdoor")) return <Dumbbell size={32} />;

  // 7. Beauty, Personal Care
  if (name.includes("beaut") || name.includes("person") || name.includes("cosmetic") || name.includes("makeup") || name.includes("skincare")) return <Sparkles size={32} />;

  // 8. Health, Pharmacy
  if (name.includes("health") || name.includes("medical") || name.includes("pharmacy") || name.includes("medicine")) return <HeartPulse size={32} />;

  // 9. Kitchen, Cooking
  if (name.includes("kitchen") || name.includes("cook") || name.includes("appliance")) return <ChefHat size={32} />;

  // 10. Auto, Vehicles
  if (name.includes("auto") || name.includes("car") || name.includes("vehicle") || name.includes("motor")) return <CarFront size={32} />;

  // 11. Audio, Music
  if (name.includes("audio") || name.includes("music") || name.includes("headphone") || name.includes("speaker")) return <Headphones size={32} />;

  // 12. Books, Stationery
  if (name.includes("book") || name.includes("stationery") || name.includes("office") || name.includes("study")) return <BookOpen size={32} />;

  // 13. Day to Day, Groceries, Supermarket, Daily Essentials
  if (name.includes("groc") || name.includes("daily") || name.includes("essential") || name.includes("supermarket") || name.includes("mart") || name.includes("day to day")) return <ShoppingCart size={32} />;

  // 14. Pets
  if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("animal")) return <PawPrint size={32} />;

  // 15. Default fallback icon (Agar koi naam match na kare)
  return <Box size={32} />;
};

export default async function ShopByCategories() {
  await connectDB();
  const categories = await Category.find({}).select("name slug").limit(10).lean();

  return (
    <section className="py-5 bg-transparent">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark mb-2">
              Shop by Categories
            </h2>
            <p className="text-sm text-sage-light">Explore our curated collections</p>
          </div>
          
          <Link 
            href="/shop" 
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group"
          >
            View All Categories 
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            
            {categories.map((cat) => (
              <Link 
                key={cat._id.toString()} 
                href={`/shop?category=${cat.slug}`} 
                className="flex flex-col items-center gap-3 snap-start group min-w-[100px] sm:min-w-[120px]"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-cream-dark shadow-sm flex items-center justify-center text-sage-light group-hover:border-sage group-hover:text-sage group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                  {/* 🟢 DYNAMIC ICON MAPPING APPLIED HERE */}
                  {getCategoryIcon(cat.name)}
                </div>
                
                <span className="text-xs sm:text-sm font-semibold text-sage-dark text-center group-hover:text-sage transition-colors leading-tight max-w-[110px] break-words">
                  {cat.name}
                </span>
              </Link>
            ))}

            <Link 
              href="/shop"
              className="flex flex-col items-center justify-center gap-3 snap-start group min-w-[100px] sm:hidden"
            >
              <div className="w-20 h-20 rounded-full bg-sage/5 border border-sage/20 flex items-center justify-center group-hover:bg-sage transition-colors">
                <ArrowRight size={24} className="text-sage group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-semibold text-sage text-center">
                View All
              </span>
            </Link>

          </div>
          
          <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[#FAF8F5] to-transparent pointer-events-none hidden sm:block"></div>
        </div>

      </div>
    </section>
  );
}