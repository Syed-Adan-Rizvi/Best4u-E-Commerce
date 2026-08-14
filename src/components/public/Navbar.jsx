// File Path: src/components/public/Navbar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Menu, X, ShoppingBag, TrendingUp, Layers, ShieldCheck, ChevronDown, Loader2 } from "lucide-react"; // Flame hata kar TrendingUp import kar liya
import { useCurrencyStore, ALL_CURRENCIES } from "@/store/useCurrencyStore";
import { formatPrice } from "@/lib/formatPrice";

export default function Navbar({ settings }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); 

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false); 
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
  const currencyRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { currency, setCurrency, rates, initCurrencyAndRates } = useCurrencyStore();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    initCurrencyAndRates();
    fetchCategories();
  }, [initCurrencyAndRates]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?limit=5");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search/suggest?q=${searchQuery}`);
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Suggestion fetch failed");
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`); 
    }
  };

  // 🟢 FIXED: Active State Logic
  const topNavLinks = [
    { name: "Home", href: "/", isActive: pathname === "/" },
    // Agar pathname '/shop' hai aur category waghera ho bhi toh wo '/shop' ke andar hi ginna jayega
    { name: "All Products", href: "/shop", isActive: pathname.startsWith("/shop") },
    // 🟢 PATHNAME === "/trending" se ye properly underline ho jayega jab koi is page par jayega
    { name: "Trending", href: "/trending", isActive: pathname === "/trending", icon: <TrendingUp size={16} className="text-[#FF9900]" /> },
  ];
  
  const bottomNavLinks = [
    { name: "Privacy Policy", href: "/privacy-policy", isActive: pathname === "/privacy-policy", icon: <ShieldCheck size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-cream border-b border-cream-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            {settings?.siteLogo ? (
              <img src={settings.siteLogo} alt={settings?.siteName || "Logo"} className="w-8 h-8 lg:w-10 lg:h-10 object-contain rounded-xl" />
            ) : (
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-sage rounded-xl flex items-center justify-center text-white">
                <ShoppingBag size={20} />
              </div>
            )}
            {!settings?.siteLogo && (
              <span className="text-xl lg:text-2xl font-serif font-bold text-sage-dark tracking-tight">
                {settings?.siteName || "Best4u"}<span className="text-sage">.</span>
              </span>
            )}
            {settings?.siteLogo && (
               <span className="text-xl lg:text-2xl font-serif font-bold text-sage-dark tracking-tight hidden sm:block">
                 {settings?.siteName || "Best4u"}<span className="text-sage">.</span>
               </span>
            )}
          </Link>

          <div className="hidden lg:flex flex-1 w-full max-w-4xl mx-4 xl:mx-10 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input 
                type="text" 
                placeholder="Search products, fashion, electronics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-5 pr-12 py-3 rounded-full border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm text-sage-dark shadow-inner transition-all"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-sage text-white rounded-full hover:bg-sage-dark transition-colors shadow-sm">
                <Search size={15} />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-cream-dark rounded-2xl shadow-xl overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 flex justify-center text-sage"><Loader2 size={20} className="animate-spin" /></div>
                ) : (
                  <ul className="py-2">
                    {suggestions.map((item) => (
                      <li key={item._id}>
                        <Link href={`/products/${item.slug}`} className="flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors" onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}>
                          <img src={item.thumbnail} alt={item.title} className="w-10 h-10 object-contain rounded-md bg-white border border-cream-dark p-1" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-sage-dark truncate">{item.title}</p>
                            <p className="text-xs font-bold text-sage">{formatPrice(item.price, currency, rates)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-cream-dark mt-1">
                      <Link href={`/shop?search=${encodeURIComponent(searchQuery)}`} className="block w-full text-center py-3 text-xs font-semibold text-sage hover:bg-sage hover:text-white transition-colors" onClick={() => setShowSuggestions(false)}>
                        View all results for "{searchQuery}"
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            
            <div className="relative z-50 flex items-center gap-1 sm:gap-2" ref={currencyRef}>
              <span className="text-[10px] lg:text-[11px] font-bold text-sage-light uppercase tracking-wider hidden sm:block">Currency:</span>
              <div onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white border border-cream-dark rounded-lg cursor-pointer hover:border-sage transition-colors shadow-sm">
                <span className="text-xs lg:text-sm font-bold text-sage-dark">{currency}</span>
                <ChevronDown size={14} className="text-sage-light" />
              </div>
              
              {isCurrencyOpen && (
                <div className="absolute top-full right-0 mt-1 w-24 max-h-60 overflow-y-auto bg-white border border-cream-dark rounded-xl shadow-lg transition-all custom-scrollbar z-50">
                  {ALL_CURRENCIES.map((c) => (
                    <button 
                      key={c}
                      onClick={() => { setCurrency(c); setIsCurrencyOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${currency === c ? 'bg-sage text-white font-semibold' : 'text-sage-dark hover:bg-cream'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              {topNavLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`relative text-sm font-medium flex items-center gap-1.5 py-2 transition-colors ${link.isActive ? "text-sage-dark font-bold" : "text-sage-light hover:text-sage-dark"} after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-sage after:transition-all after:duration-300 ${link.isActive ? "after:w-full" : ""}`}>
                  {link.icon} {link.name}
                </Link>
              ))}

              <div className="relative group py-2">
                <button className={`relative text-sm font-medium flex items-center gap-1.5 transition-colors ${pathname.startsWith('/categories') ? "text-sage-dark font-bold" : "text-sage-light hover:text-sage-dark"} after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-sage after:transition-all after:duration-300 ${pathname.startsWith('/categories') ? "after:w-full" : ""}`}>
                  <Layers size={16} /> Categories <ChevronDown size={14} />
                </button>
                <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-cream-dark rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top scale-95 group-hover:scale-100 overflow-hidden">
                  <div className="py-2">
                    {categories.map((cat) => (
                      <Link key={cat._id} href={`/shop?category=${cat.slug}`} className="block px-5 py-2.5 text-sm text-sage-dark hover:bg-cream hover:text-sage font-medium transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                    <Link href="/shop" className="block px-5 py-2.5 text-xs text-center text-sage font-bold bg-sage/5 hover:bg-sage hover:text-white transition-colors border-t border-cream-dark mt-1">
                      View All Categories
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-sage-dark bg-white border border-cream-dark shadow-sm hover:bg-cream rounded-xl transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sm text-sage-dark shadow-sm"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-light" />
          </form>

           {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-4 right-4 mt-1 bg-white border border-cream-dark rounded-xl shadow-xl overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-3 flex justify-center text-sage"><Loader2 size={16} className="animate-spin" /></div>
                ) : (
                  <ul className="py-1">
                    {suggestions.map((item) => (
                      <li key={item._id}>
                        <Link href={`/products/${item.slug}`} className="flex items-center gap-3 px-3 py-2 hover:bg-cream" onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}>
                          <img src={item.thumbnail} alt={item.title} className="w-8 h-8 object-contain rounded border border-cream-dark" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium text-sage-dark truncate">{item.title}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-sage-dark/40 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`lg:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-cream-dark bg-cream/30">
          <span className="text-xl font-serif font-bold text-sage-dark">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-lg text-sage-dark border border-cream-dark hover:bg-cream transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-1 h-full overflow-y-auto pb-20 custom-scrollbar">
          {topNavLinks.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${link.isActive ? "bg-sage/10 text-sage-dark font-bold" : "text-sage-dark hover:bg-cream hover:text-sage"}`}>
              {link.icon} {link.name}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-cream-dark">
            <button onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sage-dark hover:bg-cream font-bold transition-colors">
               <span className="flex items-center gap-2"><Layers size={14}/> Categories</span>
               <ChevronDown size={16} className={`transition-transform duration-300 ${isMobileCategoriesOpen ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${isMobileCategoriesOpen ? "max-h-60 mt-2" : "max-h-0"}`}>
               <div className="px-4 py-2 bg-cream/50 rounded-xl space-y-1 overflow-y-auto max-h-56 custom-scrollbar">
                {categories.map((cat) => (
                  <Link key={cat._id} href={`/shop?category=${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-sage-dark hover:bg-white hover:text-sage font-medium transition-colors">
                    {cat.name}
                  </Link>
                ))}
                <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-sage font-bold text-center border-t border-cream-dark mt-2 hover:bg-white transition-colors">
                  View All Categories
                </Link>
               </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-cream-dark">
             {bottomNavLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sage-dark hover:bg-cream hover:text-sage font-medium transition-colors">
                {link.icon} {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}