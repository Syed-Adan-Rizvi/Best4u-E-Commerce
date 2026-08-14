// File Path: src/components/public/TrustBadges.jsx
import { ShieldCheck, BadgeCheck, Sparkles, Undo2, Star } from "lucide-react";

export default function TrustBadges() {
  // 🟢 Naye General Affiliate Badges
  const badges = [
    {
      icon: <ShieldCheck size={24} className="text-sage" />,
      title: "Secure Checkout",
      desc: "Protected by Amazon"
    },
    {
      icon: <Sparkles size={24} className="text-sage" />,
      title: "Handpicked Deals",
      desc: "Curated daily for you"
    },
    {
      icon: <BadgeCheck size={24} className="text-sage" />,
      title: "Verified Retailers",
      desc: "100% authentic sources"
    },
    {
      icon: <Undo2 size={24} className="text-sage" />,
      title: "Easy Returns",
      desc: "Backed by Amazon policy"
    },
    {
      icon: <Star size={24} className="text-sage" />,
      title: "Top Rated",
      desc: "Highly reviewed products"
    }
  ];

  // Seamless infinite loop ke liye array ko duplicate kar rahe hain
  const duplicatedBadges = [...badges, ...badges];

  return (
    //  <section className="pb-10 pt-4 bg-[#FAF8F5]">
    <section className="pb-10 pt-4 bg-transparent">
   
      
      {/* ⚙️ Custom CSS for Infinite Marquee */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scroll 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🎨 Contained Rounded Card */}
        <div className="bg-white border border-cream-dark rounded-2xl shadow-sm py-6 relative overflow-hidden group">
          
          {/* Left & Right White Gradients (Fade Effect) */}
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* 🏃‍♂️ The Scrolling Track */}
          <div className="flex w-max animate-marquee gap-12 md:gap-20 px-10 cursor-pointer">
            {duplicatedBadges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 w-[250px]"
              >
                <div className="bg-cream w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-sage-dark mb-0.5">{badge.title}</h3>
                  <p className="text-xs sm:text-sm text-sage-light font-medium">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}