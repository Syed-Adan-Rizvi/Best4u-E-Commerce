// File Path: src/app/(public)/shop/page.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Loader2,
  SearchX,
  RotateCcw
} from "lucide-react"; 
import ProductCard from "@/components/public/ProductCard";
import Link from "next/link";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🟢 1. LOCAL STATES: UI Instant update ke liye
  const [currentSearch, setCurrentSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "None");

  const isSearchActive = currentSearch.length > 0;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Click-outside logic for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 2. URL SYNC: Browser refresh ya back button ke liye
  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    setCurrentSearch(newSearch);
    
    if (newSearch) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(searchParams.get("category") || "");
    }
    setSortBy(searchParams.get("sort") || "None"); 
  }, [searchParams]);

  // Fetch Categories Sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?limit=-1");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (error) {
        console.error("Categories fetch error");
      }
    };
    fetchCategories();
  }, []);

  // 🟢 3. CLEAN FETCH LOGIC
  const fetchProducts = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pageNum,
          limit: 12,
          search: currentSearch,
          category: currentSearch ? "" : selectedCategory,
          sort: sortBy, 
        });

        const res = await fetch(`/api/shop?${queryParams.toString()}`, { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          if (isLoadMore) {
            setProducts((prev) => [...prev, ...data.products]);
          } else {
            setProducts(data.products);
          }
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Products fetch fail ho gaye", error);
      } finally {
        setLoading(false);
      }
    },
    [currentSearch, selectedCategory, sortBy] // Dependency update kar di
  );

  // Auto trigger fetch when state changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // 🟢 CATEGORY CHANGE FIX
  const handleCategoryChange = (slug) => {
    setCurrentSearch(""); 
    setSelectedCategory(slug);
    setPage(1);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.set("sort", sortBy);
    
    const newPath = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.replace(newPath, { scroll: false });
  };

  const handleMobileApplyFilters = () => {
     handleCategoryChange(selectedCategory);
     setIsMobileFilterOpen(false);
  };

  // 🟢 CLEAR CATEGORY FILTERS FIX
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSortBy("None");
    setPage(1);
    setIsMobileFilterOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("sort");
    
    const newPath = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.replace(newPath, { scroll: false });
  };

  // 🟢 4. THE ULTIMATE CLEAR SEARCH FIX
  const handleClearSearchResult = () => {
    // 1. Manually update state taake UI instant 0s mein clear ho
    setCurrentSearch("");
    setSelectedCategory("");
    setSortBy("None");
    setPage(1);
    setIsMobileFilterOpen(false);
    
    // 2. Explicitly zabardasti URL params delete karo Next.js se
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("category");
    params.delete("sort");
    
    // 3. router.push ki jagah router.replace use kiya (Fixes Refresh/Back Bug)
    const newPath = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.replace(newPath, { scroll: false }); 
  };

  const filterSidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden mb-2">
        <h2 className="text-xl font-serif font-bold text-sage-dark">Filters</h2>
        <button
          onClick={() => setIsMobileFilterOpen(false)}
          className="p-2 text-sage-light hover:text-sage-dark bg-cream rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {isSearchActive ? (
        <div className="bg-sage/5 border border-sage/20 rounded-2xl p-5 text-center">
            <SearchX size={28} className="text-sage mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-bold text-sage-dark mb-1">Search Results</h3>
            <p className="text-xs text-sage-dark/70 mb-5 break-words">Showing items for "{currentSearch}"</p>
            <button
                onClick={handleClearSearchResult}
                className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
                Clear Search
            </button>
        </div>
      ) : (
        <>
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 bg-sage/5 hover:bg-sage hover:text-white border border-sage/20 text-sage-dark py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
          >
            <RotateCcw size={15} className="text-sage group-hover:text-white transition-colors" /> Reset Categories
          </button>

          <div className="pt-2">
            <h3 className="text-xs font-bold text-sage-light uppercase tracking-wider mb-4 border-b border-cream-dark pb-2">
              Browse Categories
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => handleCategoryChange("")}
                  className="absolute opacity-0 w-0 h-0"
                />
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === "" ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
                  <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === "" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
                </div>
                <span className={`text-sm font-medium transition-colors ${selectedCategory === "" ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
                  All Products
                </span>
              </label>

              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => handleCategoryChange(cat.slug)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === cat.slug ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
                    <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === cat.slug ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-20">
      
      <style>{`
        input[type="radio"]:checked + div > div { opacity: 1; transform: scale(1); }
        input[type="radio"]:checked + div { border-color: #5A7363; }
        
        @keyframes fadeUpIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* Starts hidden before animation kicks in */
        }
      `}</style>

      {/* 🟢 HEADER WITH DYNAMIC BREADCRUMBS */}
      <div className="bg-transparent py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-5">
            <Link href="/" className="hover:text-sage transition-colors">Home</Link>
            <span>›</span>
            <Link href="/shop" className={`hover:text-sage transition-colors ${!selectedCategory && !currentSearch ? 'text-sage-dark font-bold pointer-events-none' : ''}`}>Shop</Link>
            
            {(selectedCategory || currentSearch) && <span>›</span>}
            
            {currentSearch ? (
              <span className="text-sage-dark font-bold truncate max-w-[200px] sm:max-w-xs">Search: "{currentSearch}"</span>
            ) : selectedCategory ? (
              <span className="text-sage-dark font-bold capitalize truncate max-w-[200px] sm:max-w-xs">{selectedCategory.replace(/-/g, " ")}</span>
            ) : null}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-2">
            {currentSearch ? `Curated results for "${currentSearch}"` : 
             sortBy !== "None" ? `${sortBy}` :
             selectedCategory ? `Category: ${selectedCategory.replace(/-/g, " ")}` : 
             "Mindful Product Catalog"}
          </h1>
          <p className="text-sage-light text-sm sm:text-base capitalize">
            Discover our handpicked collection of mindful recommendations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 bg-white p-6 rounded-3xl border border-cream-dark shadow-sm">
            {filterSidebarContent}
          </aside>

          <main className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-cream-dark shadow-sm">
              <div className="flex items-center pl-2 flex-wrap gap-2">
                <p className="text-sm font-medium text-sage-light mr-1">
                  {loading && page === 1 ? "Discovering..." : <><strong className="text-sage-dark">{products.length}</strong> creations found</>}
                </p>
                
                {isSearchActive && (
                  <button 
                    onClick={handleClearSearchResult} 
                    className="flex items-center gap-1.5 bg-white border border-sage text-sage px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-sage hover:text-white transition-colors group"
                  >
                    <SearchX size={14} className="group-hover:animate-pulse" /> Clear Search
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-sage/10 text-sage-dark px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sage hover:text-white transition-colors">
                  <SlidersHorizontal size={16} /> Filters
                </button>

                <div className="relative flex-1 sm:flex-none z-20" ref={sortRef}>
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-cream border border-cream-dark rounded-xl text-sm font-medium text-sage-dark hover:border-sage transition-colors min-w-[180px]"
                  >
                    Sort: <span className="font-bold truncate">{sortBy}</span> 
                    <ChevronDown size={14} className={`text-sage-light transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      {[
                        "None",
                        "Newest",
                        "Price: Low to High",
                        "Price: High to Low",
                        "Featured"
                      ].map((sortOption) => (
                        <button
                          key={sortOption}
                          onClick={() => {
                            setSortBy(sortOption);
                            setIsSortOpen(false);
                            setPage(1);
                            
                            const params = new URLSearchParams(searchParams.toString());
                            if (sortOption === "None") {
                              params.delete("sort");
                            } else {
                              params.set("sort", sortOption);
                            }
                            
                            const newPath = params.toString() ? `/shop?${params.toString()}` : "/shop";
                            router.replace(newPath, { scroll: false });
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === sortOption ? "bg-sage text-white font-semibold" : "text-sage-dark hover:bg-cream"}`}
                        >
                          {sortOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading && page === 1 ? (
              <div className="flex flex-col items-center justify-center py-20 text-sage">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p>Curating mindful creations...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <div 
                      key={product._id} 
                      className="animate-fade-up"
                      style={{ animationDelay: `${(index % 12) * 75}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {page < totalPages && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => {
                        setPage((p) => p + 1);
                        fetchProducts(page + 1, true);
                      }}
                      className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cream-dark border-dashed mt-4">
                <p className="text-sage-light text-lg font-medium px-4 text-center">
                  No mindful recommendations found {isSearchActive ? `for "${currentSearch}"` : `matching your criteria`}.
                </p>
                {isSearchActive ? (
                  <button onClick={handleClearSearchResult} className="mt-4 flex items-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 px-6 rounded-xl font-bold transition-colors shadow-sm">
                    Clear search result
                  </button>
                ) : (
                  <button onClick={handleClearFilters} className="mt-4 text-sage hover:text-sage-dark hover:underline font-bold">
                    Reset Categories
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-sage-dark/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute inset-x-0 bottom-0 top-20 bg-[#FAF8F5] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
               {filterSidebarContent}
            </div>
            
            <div className="p-4 bg-white border-t border-cream-dark flex gap-3 z-20">
              {isSearchActive ? (
                 <button onClick={handleClearSearchResult} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
                   Clear Search
                 </button>
              ) : (
                 <>
                    <button onClick={handleClearFilters} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
                      Reset All
                    </button>
                    <button onClick={handleMobileApplyFilters} className="flex-1 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm">
                      Apply & Show
                    </button>
                 </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












// // File Path: src/app/(public)/shop/page.jsx
// "use client";

// import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   SlidersHorizontal,
//   ChevronDown,
//   X,
//   Loader2,
//   SearchX,
//   RotateCcw
// } from "lucide-react"; 
// import ProductCard from "@/components/public/ProductCard";
// import Link from "next/link";

// export default function ShopPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // 🟢 URL PARAMS
//   const urlSearch = searchParams.get("search") || "";
//   const urlCategory = searchParams.get("category") || "";
//   const urlSort = searchParams.get("sort") || "None";
//   const isSearchActive = useMemo(() => !!urlSearch, [urlSearch]);

//   // 🟢 STATES
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filter States
//   const [selectedCategory, setSelectedCategory] = useState(urlCategory);
//   const [sortBy, setSortBy] = useState(urlSort);

//   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Click-Based Sort Dropdown States
//   const [isSortOpen, setIsSortOpen] = useState(false);
//   const sortRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sortRef.current && !sortRef.current.contains(event.target)) {
//         setIsSortOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (isSearchActive) {
//       setSelectedCategory("");
//     } else {
//       setSelectedCategory(searchParams.get("category") || "");
//     }
//     setSortBy(searchParams.get("sort") || "None"); 
//   }, [searchParams, isSearchActive]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("/api/categories?limit=-1");
//         const data = await res.json();
//         if (data.success) setCategories(data.categories);
//       } catch (error) {
//         console.error("Categories fetch error");
//       }
//     };
//     fetchCategories();
//   }, []);

//   const fetchProducts = useCallback(
//     async (pageNum = 1, isLoadMore = false, explicitCat = null, explicitSort = null) => {
//       setLoading(true);
//       try {
//         const catToFetch = explicitCat !== null ? explicitCat : selectedCategory;
//         const sortToFetch = explicitSort !== null ? explicitSort : sortBy;

//         const queryParams = new URLSearchParams({
//           page: pageNum,
//           limit: 12, // 12 products per page
//           search: urlSearch,
//           category: isSearchActive ? "" : catToFetch,
//           sort: sortToFetch, 
//         });

//         const res = await fetch(`/api/shop?${queryParams.toString()}`);
//         const data = await res.json();

//         if (data.success) {
//           if (isLoadMore) {
//             setProducts((prev) => [...prev, ...data.products]);
//           } else {
//             setProducts(data.products);
//           }
//           setTotalPages(data.pagination.totalPages);
//         }
//       } catch (error) {
//         console.error("Products fetch fail ho gaye", error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [urlSearch, isSearchActive, selectedCategory, sortBy]
//   );

//   useEffect(() => {
//     setPage(1);
//     fetchProducts(1, false);
//   }, [fetchProducts]);

//   const handleCategoryChange = (slug) => {
//     setSelectedCategory(slug);
//     const params = new URLSearchParams(searchParams.toString());
    
//     if (slug) params.set("category", slug);
//     else params.delete("category");
    
//     params.set("sort", sortBy);
//     router.push(`/shop?${params.toString()}`, { scroll: false });

//     setPage(1);
//     fetchProducts(1, false, slug, sortBy);
//   };

//   const handleMobileApplyFilters = () => {
//      handleCategoryChange(selectedCategory);
//      setIsMobileFilterOpen(false);
//   };

//   const handleClearFilters = () => {
//     setSelectedCategory("");
//     setSortBy("None");
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("category");
//     params.delete("sort");
//     router.push(`/shop?${params.toString()}`, { scroll: false });
//     setIsMobileFilterOpen(false);

//     setPage(1);
//     fetchProducts(1, false, "", "None");
//   };

//   const handleClearSearchResult = () => {
//     router.push("/shop", { scroll: false });
//     setIsMobileFilterOpen(false);
//   };

//   const filterSidebarContent = (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between lg:hidden mb-2">
//         <h2 className="text-xl font-serif font-bold text-sage-dark">Filters</h2>
//         <button
//           onClick={() => setIsMobileFilterOpen(false)}
//           className="p-2 text-sage-light hover:text-sage-dark bg-cream rounded-lg transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {isSearchActive ? (
//         <div className="bg-sage/5 border border-sage/20 rounded-2xl p-5 text-center">
//             <SearchX size={28} className="text-sage mx-auto mb-3 opacity-80" />
//             <h3 className="text-sm font-bold text-sage-dark mb-1">Search Results</h3>
//             <p className="text-xs text-sage-dark/70 mb-5 break-words">Showing items for "{urlSearch}"</p>
//             <button
//                 onClick={handleClearSearchResult}
//                 className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
//             >
//                 Clear Search
//             </button>
//         </div>
//       ) : (
//         <>
//           <button
//             onClick={handleClearFilters}
//             className="w-full flex items-center justify-center gap-2 bg-sage/5 hover:bg-sage hover:text-white border border-sage/20 text-sage-dark py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
//           >
//             <RotateCcw size={15} className="text-sage group-hover:text-white transition-colors" /> Reset Categories
//           </button>

//           <div className="pt-2">
//             <h3 className="text-xs font-bold text-sage-light uppercase tracking-wider mb-4 border-b border-cream-dark pb-2">
//               Browse Categories
//             </h3>
            
//             <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
//               <label className="flex items-center gap-3 cursor-pointer group">
//                 <input
//                   type="radio"
//                   name="category"
//                   checked={selectedCategory === ""}
//                   onChange={() => handleCategoryChange("")}
//                   className="absolute opacity-0 w-0 h-0"
//                 />
//                 <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === "" ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                   <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === "" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                 </div>
//                 <span className={`text-sm font-medium transition-colors ${selectedCategory === "" ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                   All Products
//                 </span>
//               </label>

//               {categories.map((cat) => (
//                 <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="radio"
//                     name="category"
//                     checked={selectedCategory === cat.slug}
//                     onChange={() => handleCategoryChange(cat.slug)}
//                     className="absolute opacity-0 w-0 h-0"
//                   />
//                   <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === cat.slug ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                     <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === cat.slug ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                   </div>
//                   <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                     {cat.name}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-transparent pb-20">
      
//       {/* 🟢 NEW: Add Animation Keyframes here */}
//       <style>{`
//         input[type="radio"]:checked + div > div { opacity: 1; transform: scale(1); }
//         input[type="radio"]:checked + div { border-color: #5A7363; }
        
//         @keyframes fadeUpIn {
//           0% { opacity: 0; transform: translateY(40px); }
//           100% { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-up {
//           animation: fadeUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//           opacity: 0; /* Starts hidden before animation kicks in */
//         }
//       `}</style>

//       {/* 🟢 HEADER WITH DYNAMIC BREADCRUMBS */}
//       <div className="bg-transparent py-8 sm:py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
//           {/* 🟢 DYNAMIC BREADCRUMB ADDED HERE */}
//           <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-5">
//             <Link href="/" className="hover:text-sage transition-colors">Home</Link>
//             <span>›</span>
//             <Link href="/shop" className={`hover:text-sage transition-colors ${!urlCategory && !urlSearch ? 'text-sage-dark font-bold pointer-events-none' : ''}`}>Shop</Link>
            
//             {(urlCategory || urlSearch) && <span>›</span>}
            
//             {urlSearch ? (
//               <span className="text-sage-dark font-bold truncate max-w-[200px] sm:max-w-xs">Search: "{urlSearch}"</span>
//             ) : urlCategory ? (
//               <span className="text-sage-dark font-bold capitalize truncate max-w-[200px] sm:max-w-xs">{urlCategory.replace(/-/g, " ")}</span>
//             ) : null}
//           </div>

//           <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-2">
//             {urlSearch ? `Curated results for "${urlSearch}"` : 
//              urlSort !== "None" ? `${urlSort}` :
//              urlCategory ? `Category: ${urlCategory.replace(/-/g, " ")}` : 
//              "Mindful Product Catalog"}
//           </h1>
//           <p className="text-sage-light text-sm sm:text-base capitalize">
//             Discover our handpicked collection of mindful recommendations.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 bg-white p-6 rounded-3xl border border-cream-dark shadow-sm">
//             {filterSidebarContent}
//           </aside>

//           <main className="flex-1 w-full">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-cream-dark shadow-sm">
//               <div className="flex items-center pl-2 flex-wrap gap-2">
//                 <p className="text-sm font-medium text-sage-light mr-1">
//                   {loading && page === 1 ? "Discovering..." : <><strong className="text-sage-dark">{products.length}</strong> creations found</>}
//                 </p>
                
//                 {isSearchActive && (
//                   <button 
//                     onClick={handleClearSearchResult} 
//                     className="flex items-center gap-1.5 bg-white border border-sage text-sage px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-sage hover:text-white transition-colors group"
//                   >
//                     <SearchX size={14} className="group-hover:animate-pulse" /> Clear Search
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-3">
//                 <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-sage/10 text-sage-dark px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sage hover:text-white transition-colors">
//                   <SlidersHorizontal size={16} /> Filters
//                 </button>

//                 <div className="relative flex-1 sm:flex-none z-20" ref={sortRef}>
//                   <button 
//                     onClick={() => setIsSortOpen(!isSortOpen)}
//                     className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-cream border border-cream-dark rounded-xl text-sm font-medium text-sage-dark hover:border-sage transition-colors min-w-[180px]"
//                   >
//                     Sort: <span className="font-bold truncate">{sortBy}</span> 
//                     <ChevronDown size={14} className={`text-sage-light transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
//                   </button>
                  
//                   {isSortOpen && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
//                       {[
//                         "None",
//                         "Newest",
//                         "Price: Low to High",
//                         "Price: High to Low",
//                         "Featured"
//                       ].map((sortOption) => (
//                         <button
//                           key={sortOption}
//                           onClick={() => {
//                             setSortBy(sortOption);
//                             setIsSortOpen(false);
//                             setPage(1);
//                             const params = new URLSearchParams(searchParams.toString());
//                             if (sortOption === "None") {
//                               params.delete("sort");
//                             } else {
//                               params.set("sort", sortOption);
//                             }
//                             router.push(`/shop?${params.toString()}`, { scroll: false });
                            
//                             fetchProducts(1, false, selectedCategory, sortOption);
//                           }}
//                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === sortOption ? "bg-sage text-white font-semibold" : "text-sage-dark hover:bg-cream"}`}
//                         >
//                           {sortOption}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {loading && page === 1 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-sage">
//                 <Loader2 size={40} className="animate-spin mb-4" />
//                 <p>Curating mindful creations...</p>
//               </div>
//             ) : products.length > 0 ? (
//               <>
//                 {/* 🟢 NEW: Wrap ProductCard with animation div */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                   {products.map((product, index) => (
//                     <div 
//                       key={product._id} 
//                       className="animate-fade-up"
//                       // index % 12 ensures that 1st to 12th items get delayed sequentially (0ms, 75ms, 150ms...)
//                       // The 13th item (which is index 0 of the next page) will start from 0ms again.
//                       style={{ animationDelay: `${(index % 12) * 75}ms` }}
//                     >
//                       <ProductCard product={product} />
//                     </div>
//                   ))}
//                 </div>

//                 {page < totalPages && (
//                   <div className="mt-12 flex justify-center">
//                     <button
//                       onClick={() => {
//                         setPage((p) => p + 1);
//                         fetchProducts(page + 1, true);
//                       }}
//                       className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
//                     >
//                       {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More"}
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cream-dark border-dashed mt-4">
//                 <p className="text-sage-light text-lg font-medium px-4 text-center">
//                   No mindful recommendations found {isSearchActive ? `for "${urlSearch}"` : `matching your criteria`}.
//                 </p>
//                 {isSearchActive ? (
//                   <button onClick={handleClearSearchResult} className="mt-4 flex items-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 px-6 rounded-xl font-bold transition-colors shadow-sm">
//                     Clear search result
//                   </button>
//                 ) : (
//                   <button onClick={handleClearFilters} className="mt-4 text-sage hover:text-sage-dark hover:underline font-bold">
//                     Reset Categories
//                   </button>
//                 )}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//       {/* MOBILE DRAWER */}
//       {isMobileFilterOpen && (
//         <div className="lg:hidden fixed inset-0 z-[100]">
//           <div className="absolute inset-0 bg-sage-dark/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
//           <div className="absolute inset-x-0 bottom-0 top-20 bg-[#FAF8F5] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col">
//             <div className="flex-1 overflow-y-auto p-6">
//                {filterSidebarContent}
//             </div>
            
//             <div className="p-4 bg-white border-t border-cream-dark flex gap-3 z-20">
//               {isSearchActive ? (
//                  <button onClick={handleClearSearchResult} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                     Clear Search
//                  </button>
//               ) : (
//                  <>
//                     <button onClick={handleClearFilters} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                       Reset All
//                     </button>
//                     <button onClick={handleMobileApplyFilters} className="flex-1 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm">
//                       Apply & Show
//                     </button>
//                  </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




















// // File Path: src/app/(public)/shop/page.jsx
// "use client";

// import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   SlidersHorizontal,
//   ChevronDown,
//   X,
//   Loader2,
//   SearchX,
//   RotateCcw
// } from "lucide-react"; 
// import ProductCard from "@/components/public/ProductCard";

// export default function ShopPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // 🟢 URL PARAMS
//   const urlSearch = searchParams.get("search") || "";
//   const urlCategory = searchParams.get("category") || "";
//   const urlSort = searchParams.get("sort") || "None";
//   const isSearchActive = useMemo(() => !!urlSearch, [urlSearch]);

//   // 🟢 STATES
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filter States
//   const [selectedCategory, setSelectedCategory] = useState(urlCategory);
//   const [sortBy, setSortBy] = useState(urlSort);

//   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // 🟢 FIX 2: Click-Based Sort Dropdown States
//   const [isSortOpen, setIsSortOpen] = useState(false);
//   const sortRef = useRef(null);

//   // Close dropdown when clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sortRef.current && !sortRef.current.contains(event.target)) {
//         setIsSortOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (isSearchActive) {
//       setSelectedCategory("");
//     } else {
//       setSelectedCategory(searchParams.get("category") || "");
//     }
//     setSortBy(searchParams.get("sort") || "None"); 
//   }, [searchParams, isSearchActive]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("/api/categories?limit=-1");
//         const data = await res.json();
//         if (data.success) setCategories(data.categories);
//       } catch (error) {
//         console.error("Categories fetch error");
//       }
//     };
//     fetchCategories();
//   }, []);

//   // 🟢 FIX 1: Explicit Parameters added to avoid Race Conditions & Falsy Bugs
//   const fetchProducts = useCallback(
//     async (pageNum = 1, isLoadMore = false, explicitCat = null, explicitSort = null) => {
//       setLoading(true);
//       try {
//         const catToFetch = explicitCat !== null ? explicitCat : selectedCategory;
//         const sortToFetch = explicitSort !== null ? explicitSort : sortBy;

//         const queryParams = new URLSearchParams({
//           page: pageNum,
//           limit: 12,
//           search: urlSearch,
//           category: isSearchActive ? "" : catToFetch,
//           sort: sortToFetch, 
//         });

//         const res = await fetch(`/api/shop?${queryParams.toString()}`);
//         const data = await res.json();

//         if (data.success) {
//           if (isLoadMore) {
//             setProducts((prev) => [...prev, ...data.products]);
//           } else {
//             setProducts(data.products);
//           }
//           setTotalPages(data.pagination.totalPages);
//         }
//       } catch (error) {
//         console.error("Products fetch fail ho gaye", error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [urlSearch, isSearchActive, selectedCategory, sortBy]
//   );

//   useEffect(() => {
//     setPage(1);
//     fetchProducts(1, false);
//   }, [fetchProducts]);

//   const handleCategoryChange = (slug) => {
//     setSelectedCategory(slug);
//     const params = new URLSearchParams(searchParams.toString());
    
//     if (slug) params.set("category", slug);
//     else params.delete("category");
    
//     params.set("sort", sortBy);
//     router.push(`/shop?${params.toString()}`, { scroll: false });

//     // 🟢 Instant fetch explicitly with slug to avoid state delay flicker
//     setPage(1);
//     fetchProducts(1, false, slug, sortBy);
//   };

//   const handleMobileApplyFilters = () => {
//      handleCategoryChange(selectedCategory);
//      setIsMobileFilterOpen(false);
//   };

//   const handleClearFilters = () => {
//     setSelectedCategory("");
//     setSortBy("None");
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("category");
//     params.delete("sort");
//     router.push(`/shop?${params.toString()}`, { scroll: false });
//     setIsMobileFilterOpen(false);

//     // Instant explicit fetch
//     setPage(1);
//     fetchProducts(1, false, "", "None");
//   };

//   const handleClearSearchResult = () => {
//     router.push("/shop", { scroll: false });
//     setIsMobileFilterOpen(false);
//   };

//   // ==========================================
//   // 🟢 ENHANCED SIDEBAR CONTENT
//   // ==========================================
//   const filterSidebarContent = (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between lg:hidden mb-2">
//         <h2 className="text-xl font-serif font-bold text-sage-dark">Filters</h2>
//         <button
//           onClick={() => setIsMobileFilterOpen(false)}
//           className="p-2 text-sage-light hover:text-sage-dark bg-cream rounded-lg transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {isSearchActive ? (
//         <div className="bg-sage/5 border border-sage/20 rounded-2xl p-5 text-center">
//             <SearchX size={28} className="text-sage mx-auto mb-3 opacity-80" />
//             <h3 className="text-sm font-bold text-sage-dark mb-1">Search Results</h3>
//             <p className="text-xs text-sage-dark/70 mb-5 break-words">Showing items for "{urlSearch}"</p>
//             <button
//                 onClick={handleClearSearchResult}
//                 className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
//             >
//                 Clear Search
//             </button>
//         </div>
//       ) : (
//         <>
//           <button
//             onClick={handleClearFilters}
//             className="w-full flex items-center justify-center gap-2 bg-sage/5 hover:bg-sage hover:text-white border border-sage/20 text-sage-dark py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
//           >
//             <RotateCcw size={15} className="text-sage group-hover:text-white transition-colors" /> Reset Categories
//           </button>

//           <div className="pt-2">
//             <h3 className="text-xs font-bold text-sage-light uppercase tracking-wider mb-4 border-b border-cream-dark pb-2">
//               Browse Categories
//             </h3>
            
//             <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
//               <label className="flex items-center gap-3 cursor-pointer group">
//                 <input
//                   type="radio"
//                   name="category"
//                   checked={selectedCategory === ""}
//                   onChange={() => handleCategoryChange("")}
//                   className="absolute opacity-0 w-0 h-0"
//                 />
//                 <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === "" ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                   <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === "" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                 </div>
//                 <span className={`text-sm font-medium transition-colors ${selectedCategory === "" ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                   All Products
//                 </span>
//               </label>

//               {categories.map((cat) => (
//                 <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="radio"
//                     name="category"
//                     checked={selectedCategory === cat.slug}
//                     onChange={() => handleCategoryChange(cat.slug)}
//                     className="absolute opacity-0 w-0 h-0"
//                   />
//                   <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === cat.slug ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                     <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === cat.slug ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                   </div>
//                   <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                     {cat.name}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-transparent pb-20">
      
//       <style>{`
//         input[type="radio"]:checked + div > div { opacity: 1; transform: scale(1); }
//         input[type="radio"]:checked + div { border-color: #5A7363; }
//       `}</style>

//       <div className="bg-transparent py-8 sm:py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-2">
//             {urlSearch ? `Curated results for "${urlSearch}"` : 
//              urlSort !== "None" ? `${urlSort}` :
//              urlCategory ? `Category: ${urlCategory.replace("-", " ")}` : 
//              "Mindful Product Catalog"}
//           </h1>
//           <p className="text-sage-light text-sm sm:text-base capitalize">
//             Discover our handpicked collection of mindful recommendations.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 bg-white p-6 rounded-3xl border border-cream-dark shadow-sm">
//             {filterSidebarContent}
//           </aside>

//           <main className="flex-1 w-full">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-cream-dark shadow-sm">
//               <div className="flex items-center pl-2 flex-wrap gap-2">
//                 <p className="text-sm font-medium text-sage-light mr-1">
//                   {loading ? "Discovering..." : <><strong className="text-sage-dark">{products.length}</strong> creations found</>}
//                 </p>
                
//                 {isSearchActive && (
//                   <button 
//                     onClick={handleClearSearchResult} 
//                     className="flex items-center gap-1.5 bg-white border border-sage text-sage px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-sage hover:text-white transition-colors group"
//                   >
//                     <SearchX size={14} className="group-hover:animate-pulse" /> Clear Search
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-3">
//                 <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-sage/10 text-sage-dark px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sage hover:text-white transition-colors">
//                   <SlidersHorizontal size={16} /> Filters
//                 </button>

//                 {/* 🟢 FIX 2: CLICK-BASED DROPDOWN (Mobile & Tablet Friendly) */}
//                 <div className="relative flex-1 sm:flex-none z-20" ref={sortRef}>
//                   <button 
//                     onClick={() => setIsSortOpen(!isSortOpen)}
//                     className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-cream border border-cream-dark rounded-xl text-sm font-medium text-sage-dark hover:border-sage transition-colors min-w-[180px]"
//                   >
//                     Sort: <span className="font-bold truncate">{sortBy}</span> 
//                     <ChevronDown size={14} className={`text-sage-light transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
//                   </button>
                  
//                   {isSortOpen && (
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
//                       {[
//                         "None",
//                         "Newest",
//                         "Price: Low to High",
//                         "Price: High to Low",
//                         "Featured"
//                       ].map((sortOption) => (
//                         <button
//                           key={sortOption}
//                           onClick={() => {
//                             setSortBy(sortOption);
//                             setIsSortOpen(false);
//                             setPage(1);
//                             const params = new URLSearchParams(searchParams.toString());
//                             if (sortOption === "None") {
//                               params.delete("sort");
//                             } else {
//                               params.set("sort", sortOption);
//                             }
//                             router.push(`/shop?${params.toString()}`, { scroll: false });
                            
//                             // Explicit fetch on Sort click
//                             fetchProducts(1, false, selectedCategory, sortOption);
//                           }}
//                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === sortOption ? "bg-sage text-white font-semibold" : "text-sage-dark hover:bg-cream"}`}
//                         >
//                           {sortOption}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {loading && page === 1 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-sage">
//                 <Loader2 size={40} className="animate-spin mb-4" />
//                 <p>Curating mindful creations...</p>
//               </div>
//             ) : products.length > 0 ? (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                   {products.map((product) => (
//                     <ProductCard key={product._id} product={product} />
//                   ))}
//                 </div>

//                 {page < totalPages && (
//                   <div className="mt-12 flex justify-center">
//                     <button
//                       onClick={() => {
//                         setPage((p) => p + 1);
//                         fetchProducts(page + 1, true); // explicitly load more
//                       }}
//                       className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
//                     >
//                       {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More"}
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cream-dark border-dashed mt-4">
//                 <p className="text-sage-light text-lg font-medium px-4 text-center">
//                   No mindful recommendations found {isSearchActive ? `for "${urlSearch}"` : `matching your criteria`}.
//                 </p>
//                 {isSearchActive ? (
//                   <button onClick={handleClearSearchResult} className="mt-4 flex items-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 px-6 rounded-xl font-bold transition-colors shadow-sm">
//                     Clear search result
//                   </button>
//                 ) : (
//                   <button onClick={handleClearFilters} className="mt-4 text-sage hover:text-sage-dark hover:underline font-bold">
//                     Reset Categories
//                   </button>
//                 )}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//       {/* MOBILE DRAWER */}
//       {isMobileFilterOpen && (
//         <div className="lg:hidden fixed inset-0 z-[100]">
//           <div className="absolute inset-0 bg-sage-dark/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
//           <div className="absolute inset-x-0 bottom-0 top-20 bg-[#FAF8F5] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col">
//             <div className="flex-1 overflow-y-auto p-6">
//                {filterSidebarContent}
//             </div>
            
//             <div className="p-4 bg-white border-t border-cream-dark flex gap-3 z-20">
//               {isSearchActive ? (
//                  <button onClick={handleClearSearchResult} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                     Clear Search
//                  </button>
//               ) : (
//                  <>
//                     <button onClick={handleClearFilters} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                       Reset All
//                     </button>
//                     <button onClick={handleMobileApplyFilters} className="flex-1 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm">
//                       Apply & Show
//                     </button>
//                  </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





















// // File Path: src/app/(public)/shop/page.jsx
// "use client";

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   SlidersHorizontal,
//   ChevronDown,
//   X,
//   Loader2,
//   SearchX,
//   RotateCcw
// } from "lucide-react"; 
// import ProductCard from "@/components/public/ProductCard";

// export default function ShopPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // 🟢 URL PARAMS
//   const urlSearch = searchParams.get("search") || "";
//   const urlCategory = searchParams.get("category") || "";
//   const urlSort = searchParams.get("sort") || "None";
//   const isSearchActive = useMemo(() => !!urlSearch, [urlSearch]);

//   // 🟢 STATES
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filter States
//   const [selectedCategory, setSelectedCategory] = useState(urlCategory);
//   const [sortBy, setSortBy] = useState(urlSort);

//   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     if (isSearchActive) {
//       setSelectedCategory("");
//     } else {
//       setSelectedCategory(searchParams.get("category") || "");
//     }
//     setSortBy(searchParams.get("sort") || "None"); 
//   }, [searchParams, isSearchActive]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("/api/categories?limit=-1");
//         const data = await res.json();
//         if (data.success) setCategories(data.categories);
//       } catch (error) {
//         console.error("Categories fetch error");
//       }
//     };
//     fetchCategories();
//   }, []);

//   const fetchProducts = useCallback(
//     async (pageNum = 1, isLoadMore = false) => {
//       setLoading(true);
//       try {
//         const currentSort = searchParams.get("sort") || "None";
//         const currentCat = searchParams.get("category") || "";

//         const queryParams = new URLSearchParams({
//           page: pageNum,
//           limit: 12,
//           search: urlSearch,
//           category: isSearchActive ? "" : (selectedCategory || currentCat),
//           sort: sortBy !== "None" ? sortBy : currentSort, 
//         });

//         const res = await fetch(`/api/shop?${queryParams.toString()}`);
//         const data = await res.json();

//         if (data.success) {
//           if (isLoadMore) {
//             setProducts((prev) => [...prev, ...data.products]);
//           } else {
//             setProducts(data.products);
//           }
//           setTotalPages(data.pagination.totalPages);
//         }
//       } catch (error) {
//         console.error("Products fetch fail ho gaye", error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [urlSearch, isSearchActive, selectedCategory, sortBy, searchParams]
//   );

//   useEffect(() => {
//     setPage(1);
//     fetchProducts(1, false);
//   }, [fetchProducts]);

//   const handleCategoryChange = (slug) => {
//     setSelectedCategory(slug);
//     const params = new URLSearchParams(searchParams.toString());
    
//     if (slug) params.set("category", slug);
//     else params.delete("category");
    
//     params.set("sort", sortBy);
//     router.push(`/shop?${params.toString()}`, { scroll: false });
//   };

//   const handleMobileApplyFilters = () => {
//      handleCategoryChange(selectedCategory);
//      setIsMobileFilterOpen(false);
//   };

//   const handleClearFilters = () => {
//     setSelectedCategory("");
//     setSortBy("None");
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("category");
//     params.delete("sort");
//     router.push(`/shop?${params.toString()}`, { scroll: false });
//     setIsMobileFilterOpen(false);
//   };

//   const handleClearSearchResult = () => {
//     router.push("/shop", { scroll: false });
//     setIsMobileFilterOpen(false);
//   };

//   // ==========================================
//   // 🟢 ENHANCED SIDEBAR CONTENT (Conditional Rendering based on Search)
//   // ==========================================
//   const filterSidebarContent = (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between lg:hidden mb-2">
//         <h2 className="text-xl font-serif font-bold text-sage-dark">Filters</h2>
//         <button
//           onClick={() => setIsMobileFilterOpen(false)}
//           className="p-2 text-sage-light hover:text-sage-dark bg-cream rounded-lg transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {isSearchActive ? (
//         // 🟢 SHOWING CLEAR SEARCH IF SEARCH IS ACTIVE
//         <div className="bg-sage/5 border border-sage/20 rounded-2xl p-5 text-center">
//             <SearchX size={28} className="text-sage mx-auto mb-3 opacity-80" />
//             <h3 className="text-sm font-bold text-sage-dark mb-1">Search Results</h3>
//             <p className="text-xs text-sage-dark/70 mb-5 break-words">Showing items for "{urlSearch}"</p>
//             <button
//                 onClick={handleClearSearchResult}
//                 className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
//             >
//                 Clear Search
//             </button>
//         </div>
//       ) : (
//         // 🟢 SHOWING NORMAL CATEGORIES IF NO SEARCH
//         <>
//           <button
//             onClick={handleClearFilters}
//             className="w-full flex items-center justify-center gap-2 bg-sage/5 hover:bg-sage hover:text-white border border-sage/20 text-sage-dark py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
//           >
//             <RotateCcw size={15} className="text-sage group-hover:text-white transition-colors" /> Reset Categories
//           </button>

//           <div className="pt-2">
//             <h3 className="text-xs font-bold text-sage-light uppercase tracking-wider mb-4 border-b border-cream-dark pb-2">
//               Browse Categories
//             </h3>
            
//             <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
//               <label className="flex items-center gap-3 cursor-pointer group">
//                 <input
//                   type="radio"
//                   name="category"
//                   checked={selectedCategory === ""}
//                   onChange={() => handleCategoryChange("")}
//                   className="absolute opacity-0 w-0 h-0"
//                 />
//                 <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === "" ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                   <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === "" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                 </div>
//                 <span className={`text-sm font-medium transition-colors ${selectedCategory === "" ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                   All Products
//                 </span>
//               </label>

//               {categories.map((cat) => (
//                 <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="radio"
//                     name="category"
//                     checked={selectedCategory === cat.slug}
//                     onChange={() => handleCategoryChange(cat.slug)}
//                     className="absolute opacity-0 w-0 h-0"
//                   />
//                   <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedCategory === cat.slug ? "border-sage" : "border-cream-dark group-hover:border-sage-light"}`}>
//                     <div className={`w-2 h-2 bg-sage rounded-full transition-all ${selectedCategory === cat.slug ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}></div>
//                   </div>
//                   <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "text-sage-dark font-bold" : "text-sage-dark/80 group-hover:text-sage"}`}>
//                     {cat.name}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-transparent pb-20">
      
//       <style>{`
//         input[type="radio"]:checked + div > div { opacity: 1; transform: scale(1); }
//         input[type="radio"]:checked + div { border-color: #5A7363; }
//       `}</style>

//       <div className="bg-transparent py-8 sm:py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-2">
//             {urlSearch ? `Curated results for "${urlSearch}"` : 
//              urlSort !== "None" ? `${urlSort}` :
//              urlCategory ? `Category: ${urlCategory.replace("-", " ")}` : 
//              "Mindful Product Catalog"}
//           </h1>
//           <p className="text-sage-light text-sm sm:text-base capitalize">
//             Discover our handpicked collection of mindful recommendations.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 bg-white p-6 rounded-3xl border border-cream-dark shadow-sm">
//             {filterSidebarContent}
//           </aside>

//           <main className="flex-1 w-full">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-cream-dark shadow-sm">
//               <div className="flex items-center pl-2 flex-wrap gap-2">
//                 <p className="text-sm font-medium text-sage-light mr-1">
//                   {loading ? "Discovering..." : <><strong className="text-sage-dark">{products.length}</strong> creations found</>}
//                 </p>
                
//                 {isSearchActive && (
//                   <button 
//                     onClick={handleClearSearchResult} 
//                     className="flex items-center gap-1.5 bg-white border border-sage text-sage px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-sage hover:text-white transition-colors group"
//                   >
//                     <SearchX size={14} className="group-hover:animate-pulse" /> Clear Search
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-3">
//                 <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-sage/10 text-sage-dark px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sage hover:text-white transition-colors">
//                   <SlidersHorizontal size={16} /> Filters
//                 </button>

//                 <div className="relative group flex-1 sm:flex-none z-10">
//                   <button className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-cream border border-cream-dark rounded-xl text-sm font-medium text-sage-dark hover:border-sage transition-colors min-w-[180px]">
//                     Sort: <span className="font-bold truncate">{sortBy}</span> <ChevronDown size={14} className="text-sage-light" />
//                   </button>
//                   <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cream-dark rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 overflow-hidden">
//                     {[
//                       "None",
//                       "Newest",
//                       "Price: Low to High",
//                       "Price: High to Low",
//                       "Featured"
//                     ].map((sortOption) => (
//                       <button
//                         key={sortOption}
//                         onClick={() => {
//                           setSortBy(sortOption);
//                           setPage(1);
//                           const params = new URLSearchParams(searchParams.toString());
//                           if (sortOption === "None") {
//                             params.delete("sort");
//                           } else {
//                             params.set("sort", sortOption);
//                           }
//                           router.push(`/shop?${params.toString()}`, { scroll: false });
//                         }}
//                         className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === sortOption ? "bg-sage text-white font-semibold" : "text-sage-dark hover:bg-cream"}`}
//                       >
//                         {sortOption}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {loading && page === 1 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-sage">
//                 <Loader2 size={40} className="animate-spin mb-4" />
//                 <p>Curating mindful creations...</p>
//               </div>
//             ) : products.length > 0 ? (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                   {products.map((product) => (
//                     <ProductCard key={product._id} product={product} />
//                   ))}
//                 </div>

//                 {page < totalPages && (
//                   <div className="mt-12 flex justify-center">
//                     <button
//                       onClick={() => {
//                         setPage((p) => p + 1);
//                         fetchProducts(page + 1, true);
//                       }}
//                       className="bg-white border-2 border-cream-dark hover:border-sage text-sage-dark px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
//                     >
//                       {loading ? <Loader2 size={16} className="animate-spin" /> : "Load More"}
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cream-dark border-dashed mt-4">
//                 <p className="text-sage-light text-lg font-medium px-4 text-center">
//                   No mindful recommendations found {isSearchActive ? `for "${urlSearch}"` : `matching your criteria`}.
//                 </p>
//                 {isSearchActive ? (
//                   <button onClick={handleClearSearchResult} className="mt-4 flex items-center gap-2 bg-sage hover:bg-sage-dark text-white py-2.5 px-6 rounded-xl font-bold transition-colors shadow-sm">
//                     Clear search result
//                   </button>
//                 ) : (
//                   <button onClick={handleClearFilters} className="mt-4 text-sage hover:text-sage-dark hover:underline font-bold">
//                     Reset Categories
//                   </button>
//                 )}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//       {/* MOBILE DRAWER */}
//       {isMobileFilterOpen && (
//         <div className="lg:hidden fixed inset-0 z-[100]">
//           <div className="absolute inset-0 bg-sage-dark/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
//           <div className="absolute inset-x-0 bottom-0 top-20 bg-[#FAF8F5] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col">
//             <div className="flex-1 overflow-y-auto p-6">
//                {filterSidebarContent}
//             </div>
            
//             <div className="p-4 bg-white border-t border-cream-dark flex gap-3 z-20">
//               {isSearchActive ? (
//                  <button onClick={handleClearSearchResult} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                     Clear Search
//                  </button>
//               ) : (
//                  <>
//                     <button onClick={handleClearFilters} className="flex-1 bg-cream hover:bg-cream-dark text-sage-dark py-3.5 rounded-xl font-bold transition-colors text-sm">
//                       Reset All
//                     </button>
//                     <button onClick={handleMobileApplyFilters} className="flex-1 bg-sage hover:bg-sage-dark text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm">
//                       Apply & Show
//                     </button>
//                  </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }