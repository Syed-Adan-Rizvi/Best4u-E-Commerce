// File Path: src/components/admin/Sidebar.jsx (Ya jo bhi aapka exact path hai)
"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Users,
  Settings,
  LogOut,
  X,
  ExternalLink // 🌟 Naya icon live site ke liye
} from "lucide-react";
import { useEffect } from "react";

// =================================================================
// 🎨 UI STORY: "Admin Panel Dynamic Sidebar Drawer"
// Desktop par left border par fix rahega.
// Mobile/Tablet par Right Side se smooth slide-in animations ke sath aayega.
// Custom Colors: sage, sage-dark, sage-light, cream, cream-dark
// =================================================================
export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // 🐛 DEBUGGING CONSOLE: Sidebar open/close state track karne ke liye
  useEffect(() => {
    console.log(`📱 [UI Debug] Sidebar Drawer Open State: ${isOpen}`);
  }, [isOpen]);

  // Navigation Links
  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: ShoppingBag, path: "/admin/products" },
    { name: "Categories", icon: Tags, path: "/admin/categories" },
    { name: "Subscribers", icon: Users, path: "/admin/subscribers" },
  ];

  // Helper component to render menu content
  const MenuContent = () => {
    // 🌟 Settings ke liye active check manually bana liya
    const isSettingsActive = pathname.startsWith("/admin/settings");

    return (
      <div className="flex flex-col h-full bg-white">
        {/* 🟢 TOP LOGO & CLOSE BUTTON SECTION */}
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-cream-dark">
          <h1 className="text-xl md:text-2xl font-serif text-sage-dark font-bold tracking-tight">
            Best4u<span className="text-sage">.</span>
          </h1>

          {/* Mobile Close Button (Sirf Right Side Drawer Par Dikhayi Dega) */}
          <button
            onClick={() => {
              console.log("❌ [UI Action] Mobile Sidebar Closed via X button");
              onClose();
            }}
            className="lg:hidden p-1.5 rounded-lg text-sage-dark hover:bg-cream-dark transition-colors"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* 🟢 MAIN NAVIGATION LINKS SECTION */}
        <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  console.log(`🔗 [Navigated] Moved to ${item.name}`);
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl transition-all duration-200 
                text-xs sm:text-sm md:text-base font-medium
                ${
                  isActive
                    ? "bg-sage text-white shadow-sm font-semibold"
                    : "text-sage-dark hover:bg-cream-dark hover:text-sage-dark" // 🌟 Hover thoda dark kar diya hai
                }
              `}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-sage-light"}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 🟢 FOOTER SETTINGS & LOGOUT SECTION */}
        <div className="p-3 md:p-4 border-t border-cream-dark space-y-1 md:space-y-2">
          
          {/* Settings Tab (Ab is par active state chalegi) */}
          <Link
            href="/admin/settings"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base font-medium
              ${
                isSettingsActive
                  ? "bg-sage text-white shadow-sm font-semibold"
                  : "text-sage-dark hover:bg-cream-dark hover:text-sage-dark"
              }
            `}
          >
            <Settings size={20} className={isSettingsActive ? "text-white" : "text-sage-light"} />
            Settings
          </Link>

          {/* 🌟 NAYA TAB: Visit Live Site */}
          <Link
            href="/"
            target="_blank" // Naye tab mein kholne ke liye
            onClick={() => onClose && onClose()}
            className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-sage-dark hover:bg-cream-dark hover:text-sage-dark transition-all text-xs sm:text-sm md:text-base font-medium group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink size={20} className="text-sage-light group-hover:text-sage transition-colors" />
              Visit Live Site
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              console.log("🚪 [Action] Logout Button Clicked");
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs sm:text-sm md:text-base font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 💻 DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-cream-dark bg-white z-30">
        <MenuContent />
      </aside>

      {/* 📱 MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => {
            console.log("🌑 [UI Action] Backdrop Overlay Clicked -> Closing Sidebar");
            onClose();
          }}
          className="lg:hidden fixed inset-0 bg-sage-dark/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* 📱 MOBILE SIDEBAR */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-screen w-64 sm:w-72 bg-white z-50 border-l border-cream-dark shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <MenuContent />
      </aside>
    </>
  );
}



















// "use client";

// import Link from "next/link";
// import { signOut } from "next-auth/react";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   ShoppingBag,
//   Tags,
//   Users,
//   Settings,
//   LogOut,
//   X,
// } from "lucide-react";
// import { useEffect } from "react";

// // =================================================================
// // 🎨 UI STORY: "Admin Panel Dynamic Sidebar Drawer"
// // Desktop par left border par fix rahega.
// // Mobile/Tablet par Right Side se smooth slide-in animations ke sath aayega.
// // Custom Colors: sage, sage-dark, sage-light, cream, cream-dark
// // =================================================================
// export default function Sidebar({ isOpen, onClose }) {
//   const pathname = usePathname();

//   // 🐛 DEBUGGING CONSOLE: Sidebar open/close state track karne ke liye
//   useEffect(() => {
//     console.log(`📱 [UI Debug] Sidebar Drawer Open State: ${isOpen}`);
//   }, [isOpen]);

//   // Navigation Links
//   const menuItems = [
//     { name: "Overview", icon: LayoutDashboard, path: "/admin" },
//     { name: "Products", icon: ShoppingBag, path: "/admin/products" },
//     { name: "Categories", icon: Tags, path: "/admin/categories" },
//     { name: "Subscribers", icon: Users, path: "/admin/subscribers" },
//   ];

//   // Helper component to render menu content (Duplicate code se bachne ke liye)
//   const MenuContent = () => (
//     <div className="flex flex-col h-full bg-white">
//       {/* 🟢 TOP LOGO & CLOSE BUTTON SECTION */}
//       <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-cream-dark">
//         <h1 className="text-xl md:text-2xl font-serif text-sage-dark font-bold tracking-tight">
//           Best4u<span className="text-sage">.</span>
//         </h1>

//         {/* Mobile Close Button (Sirf Right Side Drawer Par Dikhayi Dega) */}
//         <button
//           onClick={() => {
//             console.log("❌ [UI Action] Mobile Sidebar Closed via X button");
//             onClose();
//           }}
//           className="lg:hidden p-1.5 rounded-lg text-sage-dark hover:bg-cream-dark transition-colors"
//           aria-label="Close sidebar"
//         >
//           <X size={22} />
//         </button>
//       </div>

//       {/* 🟢 NAVIGATION LINKS SECTION */}
//       <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2">
//         {menuItems.map((item) => {
//           // 🌟 THE FIX: Agar path "/admin" (Overview) hai, toh exact match check karo. 
//           // Warna checks normal 'startsWith' se handle ho jayenge.
//           const isActive = 
//             item.path === "/admin" 
//               ? pathname === "/admin" 
//               : pathname.startsWith(item.path);

//           const Icon = item.icon;

//           return (
//             <Link
//               key={item.path}
//               href={item.path}
//               onClick={() => {
//                 console.log(`🔗 [Navigated] Moved to ${item.name}`);
//                 if (onClose) onClose(); // Navigation ke baad mobile menu close kar do
//               }}
//               className={`flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl transition-all duration-200 
//                 text-xs sm:text-sm md:text-base font-medium
//                 ${
//                   isActive
//                     ? "bg-sage text-white shadow-sm font-semibold" // Active State using Sage
//                     : "text-sage-dark hover:bg-cream hover:text-sage" // Normal Hover State
//                 }
//               `}
//             >
//               <Icon
//                 size={20}
//                 className={isActive ? "text-white" : "text-sage-light"}
//               />
//               {item.name}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* 🟢 FOOTER SETTINGS & LOGOUT SECTION */}
//       <div className="p-3 md:p-4 border-t border-cream-dark space-y-1 md:space-y-2">
//         <Link
//           href="/admin/settings"
//           onClick={() => onClose && onClose()}
//           className="flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-sage-dark hover:bg-cream transition-all text-xs sm:text-sm md:text-base font-medium"
//         >
//           <Settings size={20} className="text-sage-light" />
//           Settings
//         </Link>

//         {/* Logout Button */}
//         <button
//           onClick={() => {
//             console.log("🚪 [Action] Logout Button Clicked");
//             signOut({ callbackUrl: "/login" }); // Logout ke baad seedha login page par le jayega
//           }}
//           className="w-full flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs sm:text-sm md:text-base font-medium"
//         >
//           <LogOut size={20} />
//           Logout
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* 💻 DESKTOP SIDEBAR (Fixed on Left Side) */}
//       <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-cream-dark bg-white z-30">
//         <MenuContent />
//       </aside>

//       {/* 📱 MOBILE / TABLET OVERLAY BACKDROP */}
//       {isOpen && (
//         <div
//           onClick={() => {
//             console.log(
//               "🌑 [UI Action] Backdrop Overlay Clicked -> Closing Sidebar",
//             );
//             onClose();
//           }}
//           className="lg:hidden fixed inset-0 bg-sage-dark/40 backdrop-blur-sm z-40 transition-opacity duration-300"
//         />
//       )}

//       {/* 📱 MOBILE / TABLET SIDEBAR DRAWER (Slides from Right Side) */}
//       <aside
//         className={`lg:hidden fixed top-0 right-0 h-screen w-64 sm:w-72 bg-white z-50 border-l border-cream-dark shadow-2xl transition-transform duration-300 ease-in-out transform ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <MenuContent />
//       </aside>
//     </>
//   );
// }