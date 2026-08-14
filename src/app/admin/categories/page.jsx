"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Layers } from "lucide-react";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pagination & Limits
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Search & Suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // ⏳ Debounce (300ms baad update hoga taake API par load na pare)
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  
  const searchRef = useRef(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 📡 API Data Fetcher (Ab Search Support ke Sath)
  const fetchCategories = async (currentPage, currentLimit, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?page=${currentPage}&limit=${currentLimit}&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
        setTotalDocs(data.pagination.totalDocs);
      }
    } catch (error) {
      toast.error("Categories load nahi ho saki!");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 JAB BHI PAGE, LIMIT YA SEARCH CHANGE HO, NAYA DATA LAO
  useEffect(() => {
    fetchCategories(page, limit, debouncedSearch);
  }, [page, limit, debouncedSearch]);

  // Delete Handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure? Yeh category hamesha ke liye delete ho jayegi!")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted!", { id: toastId });
        fetchCategories(page, limit, debouncedSearch);
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error("Delete fail ho gaya", { id: toastId });
    }
  };

  // 🛠️ Dynamic Pagination Number Generator (Ab hamesha show hoga)
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
              if (jumpTo && !isNaN(jumpTo) && jumpTo > 0 && jumpTo <= totalPages) {
                setPage(Number(jumpTo));
              }
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
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-dark">Categories</h1>
          <p className="text-sm text-sage-light">Apni website ki saari categories manage karein.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-cream-dark shadow-sm">
        
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md" ref={searchRef}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-cream/50 border border-cream-dark rounded-xl focus-within:ring-2 focus-within:ring-sage transition-all">
            <Search size={18} className="text-sage-light" />
            <input 
              type="text"
              placeholder="Search complete database..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // 🌟 Jaise hi type karein, page 1 par chale jayen
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

          {/* Suggestions Dropdown (Ab API se filtered data aayega) */}
          {showSuggestions && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-cream-dark rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-sage-light text-center">Searching...</div>
              ) : categories.length > 0 ? (
                categories.map(res => (
                  <div 
                    key={res._id} 
                    onClick={() => {
                      setSearchQuery(res.name);
                      setShowSuggestions(false);
                      setEditingCategory(res);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-3 hover:bg-cream cursor-pointer border-b border-cream-dark/50 last:border-0 flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-sage-dark group-hover:text-sage">{res.name}</span>
                    <Edit2 size={14} className="text-sage-light opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-sage-light text-center">No categories found in database.</div>
              )}
            </div>
          )}
        </div>

        {/* Rows Per Page Dropdown */}
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

      <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream border-b border-cream-dark text-sage-dark text-sm">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-sage-light animate-pulse">Loading data...</td></tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-cream-dark/50 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-sage-dark">{cat.name}</td>
                    <td className="px-6 py-4 text-sage-light text-sm">{cat.slug}</td>
                    <td className="px-6 py-4 text-sage-light text-sm">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-10 text-center text-sage-light">No data found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🟢 PAGINATION (Hamesha dikhegi agar pages > 1 hain) */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/30">
            <div className="text-sm text-sage-light text-center sm:text-left">
              Showing <span className="font-semibold text-sage-dark">{startItem}</span> to <span className="font-semibold text-sage-dark">{endItem}</span> of <span className="font-semibold text-sage-dark">{totalDocs}</span> categories
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Pagination Numbers visible now */}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-cream-dark">
              <h2 className="text-xl font-bold text-sage-dark">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-sage-light hover:text-sage-dark">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <CategoryForm 
                initialData={editingCategory} 
                onSuccess={() => { setIsModalOpen(false); fetchCategories(page, limit, debouncedSearch); }} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useDebounce } from "use-debounce";
// import Fuse from "fuse.js";
// import { toast } from "sonner";
// import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Layers } from "lucide-react";
// import CategoryForm from "@/components/admin/CategoryForm";

// export default function CategoriesPage() {
//   // 🗄️ Data States
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // 📦 Modal States
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);

//   // 📄 Pagination & Limits
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10); // 🌟 Naya: Rows per page limit
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalDocs, setTotalDocs] = useState(0); // 🌟 Naya: Total categories count

//   // 🔍 Search & Suggestions
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showSuggestions, setShowSuggestions] = useState(false); // Dropdown toggle
//   const [debouncedSearch] = useDebounce(searchQuery, 300);
  
//   // Click outside suggestion box close logic
//   const searchRef = useRef(null);
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // 📡 API Data Fetcher (Ab Limit ke sath)
//   const fetchCategories = async (currentPage = 1, currentLimit = 10) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/categories?page=${currentPage}&limit=${currentLimit}`);
//       const data = await res.json();
//       if (data.success) {
//         setCategories(data.categories);
//         setTotalPages(data.pagination.totalPages);
//         setPage(data.pagination.page);
//         setTotalDocs(data.pagination.totalDocs);
//       }
//     } catch (error) {
//       toast.error("Categories load nahi ho saki!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Jab bhi Page ya Limit change ho, naya data mangwao
//   useEffect(() => {
//     fetchCategories(page, limit);
//   }, [page, limit]);

//   // 🔍 FUSE.JS MAGIC: Suggestions & Filtering
//   const fuse = new Fuse(categories, {
//     keys: ["name", "slug"],
//     threshold: 0.3,
//   });

//   const searchResults = debouncedSearch ? fuse.search(debouncedSearch).map(res => res.item) : categories;

//   // 🗑️ Delete Handler
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure? Yeh category hamesha ke liye delete ho jayegi!")) return;
//     const toastId = toast.loading("Deleting...");
//     try {
//       const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Category deleted!", { id: toastId });
//         fetchCategories(page, limit);
//       } else {
//         toast.error(data.error, { id: toastId });
//       }
//     } catch (error) {
//       toast.error("Delete fail ho gaya", { id: toastId });
//     }
//   };

//   // 🛠️ Dynamic Pagination Number Generator (1, 2, 3 ... 10)
//   const renderPagination = () => {
//     let pages = [];
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       if (page <= 4) {
//         pages = [1, 2, 3, 4, 5, '...', totalPages - 1, totalPages];
//       } else if (page >= totalPages - 3) {
//         pages = [1, 2, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//       } else {
//         pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
//       }
//     }

//     return pages.map((p, index) => {
//       if (p === '...') {
//         return (
//           <button 
//             key={index} 
//             onClick={() => {
//               const jumpTo = prompt(`Enter page number (1 to ${totalPages}):`);
//               if (jumpTo && !isNaN(jumpTo) && jumpTo > 0 && jumpTo <= totalPages) {
//                 setPage(Number(jumpTo));
//               }
//             }}
//             className="w-8 h-8 flex items-center justify-center rounded-lg text-sage-light hover:bg-cream hover:text-sage-dark transition-colors font-medium text-sm"
//             title="Jump to page"
//           >
//             ...
//           </button>
//         );
//       }
//       return (
//         <button
//           key={index}
//           onClick={() => setPage(p)}
//           className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-all ${
//             page === p ? 'bg-sage text-white shadow-sm' : 'text-sage-dark hover:bg-cream border border-transparent hover:border-cream-dark'
//           }`}
//         >
//           {p}
//         </button>
//       );
//     });
//   };

//   // 📊 "Showing X of Y" Calculations
//   const startItem = totalDocs === 0 ? 0 : (page - 1) * limit + 1;
//   const endItem = Math.min(page * limit, totalDocs);

//   return (
//     <div className="space-y-6">
      
//       {/* 🟢 TOP HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-sage-dark">Categories</h1>
//           <p className="text-sm text-sage-light">Apni website ki saari categories manage karein.</p>
//         </div>
//         <button 
//           onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
//           className="flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
//         >
//           <Plus size={18} />
//           Add Category
//         </button>
//       </div>

//       {/* 🟢 CONTROLS BAR: Search (Moderate Width) & Row Limit Dropdown */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-cream-dark shadow-sm">
        
//         {/* Search Bar with Suggestions */}
//         <div className="relative w-full sm:max-w-md" ref={searchRef}>
//           <div className="flex items-center gap-3 px-4 py-2.5 bg-cream/50 border border-cream-dark rounded-xl focus-within:ring-2 focus-within:ring-sage focus-within:border-transparent transition-all">
//             <Search size={18} className="text-sage-light" />
//             <input 
//               type="text"
//               placeholder="Search categories..."
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value);
//                 setShowSuggestions(true);
//               }}
//               onFocus={() => setShowSuggestions(true)}
//               className="w-full bg-transparent border-none focus:outline-none text-sage-dark placeholder-sage-light text-sm"
//             />
//             {searchQuery && (
//               <button onClick={() => setSearchQuery("")} className="text-sage-light hover:text-red-500">
//                 <X size={16} />
//               </button>
//             )}
//           </div>

//           {/* 🌟 Suggestions Dropdown */}
//           {showSuggestions && searchQuery && (
//             <div className="absolute top-full left-0 w-full mt-2 bg-white border border-cream-dark rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto overflow-x-hidden">
//               {searchResults.length > 0 ? (
//                 searchResults.map(res => (
//                   <div 
//                     key={res._id} 
//                     onClick={() => {
//                       setSearchQuery(res.name);
//                       setShowSuggestions(false);
//                       setEditingCategory(res); // Click karne par direct Edit modal open ho jayega
//                       setIsModalOpen(true);
//                     }}
//                     className="px-4 py-3 hover:bg-cream cursor-pointer border-b border-cream-dark/50 last:border-0 flex items-center justify-between group"
//                   >
//                     <span className="text-sm font-medium text-sage-dark group-hover:text-sage">{res.name}</span>
//                     <Edit2 size={14} className="text-sage-light opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 ))
//               ) : (
//                 <div className="px-4 py-3 text-sm text-sage-light text-center">No matching suggestions</div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Rows Per Page Dropdown */}
//         <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
//           <span className="text-sm text-sage-light flex items-center gap-1">
//             <Layers size={16} /> Show:
//           </span>
//           <select 
//             value={limit}
//             onChange={(e) => {
//               setLimit(Number(e.target.value));
//               setPage(1); // Limit change hone par page 1 par wapis aana chahiye
//             }}
//             className="bg-cream/50 border border-cream-dark text-sage-dark text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
//           >
//             {[5, 10, 15, 20, 25, 50].map(num => (
//               <option key={num} value={num}>{num} rows</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* 🟢 DATA TABLE */}
//       <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-cream border-b border-cream-dark text-sage-dark text-sm">
//                 <th className="px-6 py-4 font-semibold">Name</th>
//                 <th className="px-6 py-4 font-semibold">Slug</th>
//                 <th className="px-6 py-4 font-semibold">Created At</th>
//                 <th className="px-6 py-4 font-semibold text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan="4" className="p-10 text-center text-sage-light animate-pulse">Loading data...</td></tr>
//               ) : searchResults.length > 0 ? (
//                 searchResults.map((cat) => (
//                   <tr key={cat._id} className="border-b border-cream-dark/50 hover:bg-cream/30 transition-colors">
//                     <td className="px-6 py-4 font-medium text-sage-dark">{cat.name}</td>
//                     <td className="px-6 py-4 text-sage-light text-sm">{cat.slug}</td>
//                     <td className="px-6 py-4 text-sage-light text-sm">
//                       {new Date(cat.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 flex items-center justify-end gap-2">
//                       <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors">
//                         <Edit2 size={18} />
//                       </button>
//                       <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="4" className="p-10 text-center text-sage-light">No data available.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* 🟢 PAGINATION & SHOWING DATA TEXT */}
//         {!searchQuery && totalDocs > 0 && (
//           <div className="p-4 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/30">
            
//             <div className="text-sm text-sage-light text-center sm:text-left">
//               Showing <span className="font-semibold text-sage-dark">{startItem}</span> to <span className="font-semibold text-sage-dark">{endItem}</span> of <span className="font-semibold text-sage-dark">{totalDocs}</span> categories
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
//               >
//                 <ChevronLeft size={18} />
//               </button>
              
//               <div className="flex items-center gap-1 hidden sm:flex">
//                 {renderPagination()}
//               </div>

//               <button 
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* 🟢 MODAL (Add / Edit) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-5 flex items-center justify-between border-b border-cream-dark">
//               <h2 className="text-xl font-bold text-sage-dark">
//                 {editingCategory ? "Edit Category" : "Add New Category"}
//               </h2>
//               <button onClick={() => setIsModalOpen(false)} className="text-sage-light hover:text-sage-dark transition-colors">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-5">
//               <CategoryForm 
//                 initialData={editingCategory} 
//                 onSuccess={() => { setIsModalOpen(false); fetchCategories(page, limit); }} 
//                 onCancel={() => setIsModalOpen(false)} 
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }














// "use client";

// import { useState, useEffect } from "react";
// import { useDebounce } from "use-debounce";
// import Fuse from "fuse.js";
// import { toast } from "sonner";
// import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
// import CategoryForm from "@/components/admin/CategoryForm";

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Modal States
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);

//   // Pagination & Search States
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   // ⏳ DEBOUNCE MAGIC: User typing rukega tabhi 300ms baad search hoga
//   const [debouncedSearch] = useDebounce(searchQuery, 500);

//   // 📡 API Data Fetcher
//   const fetchCategories = async (currentPage = 1) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/categories?page=${currentPage}&limit=10`);
//       const data = await res.json();
//       if (data.success) {
//         setCategories(data.categories);
//         setTotalPages(data.pagination.totalPages);
//         setPage(data.pagination.page);
//       }
//     } catch (error) {
//       toast.error("Categories load nahi ho saki!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories(page);
//   }, [page]);

//   // 🔍 FUSE.JS MAGIC: Client-side Typo-Tolerance Search
//   // Agar user 'smat' likhega toh bhi 'Smart' dhoond lega!
//   const fuse = new Fuse(categories, {
//     keys: ["name", "slug"],
//     threshold: 0.3, // Jitna chota, utna strict. 0.3 acha typo-tolerance deta hai.
//   });

//   // Agar search mein kuch hai toh Fuse filter karega, warna original list dikhayega
//   const displayedCategories = debouncedSearch 
//     ? fuse.search(debouncedSearch).map(result => result.item)
//     : categories;

//   // 🗑️ Delete Handler
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure? Yeh category hamesha ke liye delete ho jayegi!")) return;
    
//     const toastId = toast.loading("Deleting...");
//     try {
//       const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Category deleted!", { id: toastId });
//         fetchCategories(page); // Refresh list
//       } else {
//         toast.error(data.error, { id: toastId });
//       }
//     } catch (error) {
//       toast.error("Delete fail ho gaya", { id: toastId });
//     }
//   };

//   // 📦 Modal Handlers
//   const openAddModal = () => {
//     setEditingCategory(null);
//     setIsModalOpen(true);
//   };

//   const openEditModal = (category) => {
//     setEditingCategory(category);
//     setIsModalOpen(true);
//   };

//   const handleFormSuccess = () => {
//     setIsModalOpen(false);
//     fetchCategories(page); // API call taake naya data aa jaye
//   };

//   return (
//     <div className="space-y-6">
      
//       {/* 🟢 TOP HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-sage-dark">Categories</h1>
//           <p className="text-sm text-sage-light">Apni website ki saari categories manage karein.</p>
//         </div>
//         <button 
//           onClick={openAddModal}
//           className="flex items-center gap-2 bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
//         >
//           <Plus size={18} />
//           Add Category
//         </button>
//       </div>

//       {/* 🟢 SEARCH BAR & TABLE */}
//       <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
        
//         {/* Search */}
//         <div className="p-4 border-b border-cream-dark flex items-center gap-3 bg-cream/30">
//           <Search size={20} className="text-sage-light" />
//           <input 
//             type="text"
//             placeholder="Search categories (e.g., smart home)..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-transparent border-none focus:outline-none text-sage-dark placeholder-sage-light text-sm"
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-cream border-b border-cream-dark text-sage-dark text-sm">
//                 <th className="px-6 py-4 font-semibold">Name</th>
//                 <th className="px-6 py-4 font-semibold">Slug</th>
//                 <th className="px-6 py-4 font-semibold">Created At</th>
//                 <th className="px-6 py-4 font-semibold text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan="4" className="p-6 text-center text-sage-light">Loading categories...</td></tr>
//               ) : displayedCategories.length > 0 ? (
//                 displayedCategories.map((cat) => (
//                   <tr key={cat._id} className="border-b border-cream-dark/50 hover:bg-cream/50 transition-colors">
//                     <td className="px-6 py-4 font-medium text-sage-dark">{cat.name}</td>
//                     <td className="px-6 py-4 text-sage-light text-sm">{cat.slug}</td>
//                     <td className="px-6 py-4 text-sage-light text-sm">
//                       {new Date(cat.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 flex items-center justify-end gap-3">
//                       <button onClick={() => openEditModal(cat)} className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors">
//                         <Edit2 size={18} />
//                       </button>
//                       <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="4" className="p-6 text-center text-sage-light">No categories found.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         {!searchQuery && totalPages > 1 && (
//           <div className="p-4 border-t border-cream-dark flex items-center justify-between bg-cream/30">
//             <span className="text-sm text-sage-light">Page {page} of {totalPages}</span>
//             <div className="flex gap-2">
//               <button 
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50"
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <button 
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* 🟢 MODAL (Add / Edit) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-5 flex items-center justify-between border-b border-cream-dark">
//               <h2 className="text-xl font-bold text-sage-dark">
//                 {editingCategory ? "Edit Category" : "Add New Category"}
//               </h2>
//               <button onClick={() => setIsModalOpen(false)} className="text-sage-light hover:text-sage-dark">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-5">
//               {/* Hamara reusable form component */}
//               <CategoryForm 
//                 initialData={editingCategory} 
//                 onSuccess={handleFormSuccess} 
//                 onCancel={() => setIsModalOpen(false)} 
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }