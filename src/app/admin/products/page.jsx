// File Path: src/app/admin/products/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image"; // Next.js optimized images
import { 
  Plus, Search, Edit2, Trash2, ChevronLeft, 
  ChevronRight, X, Layers, ShoppingBag, 
  DownloadCloud, Link as LinkIcon 
} from "lucide-react";

// =================================================================
// 🎨 UI STORY: "Products List & Management Hub"
// Yahan admin apne saare products dekh sakta hai, search kar sakta hai, 
// aur naye products add karne ke 3 mukhtalif raste (Manual, Bulk, ASIN) choose kar sakta hai.
// Responsive: Mobile par scrollable table aur stacked buttons, Desktop par clean row.
// =================================================================
export default function ProductsPage() {
  // 🗄️ Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📄 Pagination & Limits States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0); 

  // 🔍 Search & Suggestions States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // ⏳ Debounce (300ms delay taake API par load na pare)
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);

  // 🖱️ Click outside suggestion box close logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 📡 API Data Fetcher (Server-Side Search ke sath)
  const fetchProducts = async (currentPage, currentLimit, searchTerm = "") => {
    setLoading(true);
    console.log(`🚀 [Frontend] Fetching products... Page: ${currentPage}, Limit: ${currentLimit}, Search: "${searchTerm}"`);
    try {
      const res = await fetch(`/api/products?page=${currentPage}&limit=${currentLimit}&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
        setTotalDocs(data.pagination.totalDocs);
        console.log("✅ [Frontend] Products loaded successfully:", data.products.length, "items.");
      } else {
        toast.error(data.error || "Products load fail ho gaye");
      }
    } catch (error) {
      console.error("❌ [Frontend] Fetch Error:", error);
      toast.error("Network error. Products load nahi ho sake!");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 JAB BHI PAGE, LIMIT YA SEARCH CHANGE HO, NAYA DATA LAO
  useEffect(() => {
    fetchProducts(page, limit, debouncedSearch);
  }, [page, limit, debouncedSearch]);

  // 🗑️ Delete Handler (Garbage Collection Backend API handle karegi)
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure? "${title}" hamesha ke liye delete ho jayega aur iski images bhi Cloudinary se remove ho jayengi!`)) return;
    
    const toastId = toast.loading("Deleting product...");
    console.log(`🧨 [Frontend] Delete request bheji ja rahi hai ID: ${id} ke liye.`);
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully!", { id: toastId });
        fetchProducts(page, limit, debouncedSearch); // Refresh List
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error("Delete fail ho gaya", { id: toastId });
    }
  };

  // 🛠️ Dynamic Pagination Number Generator (1, 2, 3 ... 10)
  const renderPagination = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages - 1, totalPages];
      } else if (page >= totalPages - 3) {
        pages = [1, 2, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }

    return pages.map((p, index) => {
      if (p === '...') {
        return (
          <button 
            key={index} 
            onClick={() => {
              const jumpTo = prompt(`Enter page number (1 to ${totalPages}):`);
              if (jumpTo && !isNaN(jumpTo) && jumpTo > 0 && jumpTo <= totalPages) setPage(Number(jumpTo));
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sage-light hover:bg-cream hover:text-sage-dark transition-colors font-medium text-sm"
          >
            ...
          </button>
        );
      }
      return (
        <button
          key={index}
          onClick={() => setPage(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-all ${
            page === p ? 'bg-sage text-white shadow-sm' : 'text-sage-dark hover:bg-cream border border-transparent hover:border-cream-dark'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const startItem = totalDocs === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalDocs);

  return (
    <div className="space-y-6">
      
      {/* 🟢 TOP HEADER & 3 MAGICAL BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-dark">Products Hub</h1>
          <p className="text-sm text-sage-light">Manage your store inventory, import from Amazon, or add manually.</p>
        </div>
        
        {/* Buttons Section (Responsive Wrap) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Button 1: Add Manually */}
          <Link 
            href="/admin/products/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-sage text-sage hover:bg-sage hover:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} /> Add Manual
          </Link>

          {/* Button 2: Amazon Bulk Import */}
          <Link 
            href="/admin/products/import"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FF9900] text-white hover:bg-[#E68A00] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <DownloadCloud size={16} /> Bulk Import
          </Link>

          {/* Button 3: Amazon ASIN Import */}
          <Link 
            href="/admin/products/import?type=asin"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-sage-dark text-white hover:bg-sage px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <LinkIcon size={16} /> ASIN Import
          </Link>
        </div>
      </div>

      {/* 🟢 CONTROLS BAR: Search & Rows Limit */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-cream-dark shadow-sm">
        
        {/* Search Bar with Autocomplete Suggestions */}
        <div className="relative w-full sm:max-w-md" ref={searchRef}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-cream/50 border border-cream-dark rounded-xl focus-within:ring-2 focus-within:ring-sage transition-all">
            <Search size={18} className="text-sage-light" />
            <input 
              type="text"
              placeholder="Search by Title or ASIN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); 
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent border-none focus:outline-none text-sage-dark placeholder-sage-light text-sm"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setPage(1); }} className="text-sage-light hover:text-red-500">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Real-time Suggestions Dropdown */}
          {showSuggestions && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-cream-dark rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-sage-light text-center">Searching database...</div>
              ) : products.length > 0 ? (
                products.map(res => (
                  <Link 
                    href={`/admin/products/edit/${res._id}`}
                    key={res._id} 
                    className="px-4 py-3 hover:bg-cream cursor-pointer border-b border-cream-dark/50 last:border-0 flex items-center gap-3 group"
                  >
                    {/* Small Thumbnail inside search suggestion */}
                    <div className="w-8 h-8 rounded-md bg-cream overflow-hidden flex-shrink-0 relative">
                       <img src={res.images[0] || "/placeholder.jpg"} alt={res.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-sage-dark group-hover:text-sage truncate">{res.title}</p>
                      <p className="text-[10px] text-sage-light">{res.externalId ? `ASIN: ${res.externalId}` : "Manual"}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-sage-light text-center">No products found.</div>
              )}
            </div>
          )}
        </div>

        {/* Rows Per Page */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-sm text-sage-light flex items-center gap-1">
            <Layers size={16} /> Show:
          </span>
          <select 
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="bg-cream/50 border border-cream-dark text-sage-dark text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
          >
            {[5, 10, 15, 20, 25, 50].map(num => (
              <option key={num} value={num}>{num} rows</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🟢 DATA TABLE */}
      <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-cream border-b border-cream-dark text-sage-dark text-xs sm:text-sm">
                <th className="px-4 sm:px-6 py-4 font-semibold w-16">Image</th>
                <th className="px-4 sm:px-6 py-4 font-semibold max-w-xs">Product Details</th>
                <th className="px-4 sm:px-6 py-4 font-semibold">Price</th>
                <th className="px-4 sm:px-6 py-4 font-semibold">Source</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-sage-light animate-pulse">Loading products inventory...</td></tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-cream-dark/50 hover:bg-cream/30 transition-colors">
                    
                    {/* Image Column */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden border border-cream-dark relative">
                        <img 
                          src={product.images[0] || "/placeholder.jpg"} 
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Details Column (Title + Category) */}
                    <td className="px-4 sm:px-6 py-4 max-w-xs">
                      <p className="font-medium text-sage-dark text-sm truncate" title={product.title}>
                        {product.title}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-sage/10 text-sage text-[10px] font-semibold rounded-full">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-semibold text-sage-dark text-sm">${product.price}</p>
                      {product.originalPrice && (
                        <p className="text-[11px] text-sage-light line-through">${product.originalPrice}</p>
                      )}
                    </td>

                    {/* Source Column (Amazon vs Manual) */}
                    <td className="px-4 sm:px-6 py-4">
                      {product.source === "AmazonAPI" ? (
                        <span className="flex items-center gap-1 text-[#FF9900] text-xs font-semibold">
                          <ShoppingBag size={14} /> Amazon
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sage text-xs font-semibold">
                          <Edit2 size={14} /> Manual
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 sm:px-6 py-4 flex items-center justify-end gap-2 h-full mt-2">
                      {/* Navigate to Edit Page */}
                      <Link 
                        href={`/admin/products/edit/${product._id}`} 
                        className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id, product.title)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-sage-light">No products found in inventory.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🟢 PAGINATION */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/30">
            <div className="text-sm text-sage-light text-center sm:text-left">
              Showing <span className="font-semibold text-sage-dark">{startItem}</span> to <span className="font-semibold text-sage-dark">{endItem}</span> of <span className="font-semibold text-sage-dark">{totalDocs}</span> products
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {renderPagination()}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}