// File Path: src/app/admin/products/import/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { 
  Search, DownloadCloud, Link as LinkIcon, 
  ArrowLeft, ShoppingBag, CheckCircle2, AlertCircle, Loader2, Plus
} from "lucide-react";
import useAmazonStore from "@/store/useAmazonStore"; // Hamari Zehdasht (Zustand Store)

// =================================================================
// 🎨 UI STORY: "The Amazon Import Hub"
// Bulk Keyword Search aur Single ASIN Fetch dono isi page par hain.
// Zustand store ensure karega ke data navigate hone ke baad bhi mehfooz rahe.
// =================================================================
export default function AmazonImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL se type check karna (kya user ne ASIN button click kiya tha?)
  const initialType = searchParams.get("type") === "asin" ? "asin" : "keyword";
  const [importMode, setImportMode] = useState(initialType);
  
  // Local States for Inputs
  const [keywordInput, setKeywordInput] = useState("");
  const [asinInput, setAsinInput] = useState("");
  const [limitInput, setLimitInput] = useState(20);
  const [isFetching, setIsFetching] = useState(false);

  // 🧠 ZUSTAND STORE HOOKS (Global State)
  const { 
    fetchedProducts, searchKeyword, searchLimit, 
    setAmazonData, setCameFromAmazon, clearAmazonData 
  } = useAmazonStore();

  // Agar store mein pehle se keyword tha, toh input mein bhar do
  useEffect(() => {
    if (searchKeyword) setKeywordInput(searchKeyword);
    if (searchLimit) setLimitInput(searchLimit);
  }, [searchKeyword, searchLimit]);

  // 📡 FETCH PRODUCTS FROM AMAZON API
  const handleFetch = async () => {
    if (importMode === "keyword" && !keywordInput) return toast.error("Please enter a keyword!");
    if (importMode === "asin" && !asinInput) return toast.error("Please enter an ASIN!");

    setIsFetching(true);
    const toastId = toast.loading("Amazon se data laya ja raha hai... ⏳");
    
    try {
      // Build API URL dynamically
      const apiUrl = importMode === "keyword" 
        ? `/api/amazon/fetch?keyword=${keywordInput}&limit=${limitInput}`
        : `/api/amazon/fetch?asin=${asinInput}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.success) {
        toast.success("Amazon data successfully fetched! 🎉", { id: toastId });
        
        // Agar ASIN hai toh array mein wrap karo (kyunke API object bhejti hai)
        const productsToStore = importMode === "asin" ? [data.product] : data.products;
        
        // 🧠 ZUSTAND SAVE: Data ko store mein save kar diya taake gayab na ho
        setAmazonData(productsToStore, importMode === "keyword" ? keywordInput : "", limitInput);
      } else {
        toast.error(data.error || "Data fetch nahi ho saka", { id: toastId });
      }
    } catch (error) {
      console.error("❌ [Amazon Fetch Error]:", error);
      toast.error("Network error! API call fail ho gayi.", { id: toastId });
    } finally {
      setIsFetching(false);
    }
  };

  // 🛒 ADD TO DB HANDLER
  const handleAddToDB = (asin) => {
    // 🧠 Store ko batana ke admin Amazon form se aa raha hai
    setCameFromAmazon(true);
    // User ko Form page par bhejo, ASIN sath URL mein lagakar
    router.push(`/admin/products/new?import=${asin}`);
  };

  return (
    <div className="space-y-6">
      
      {/* 🟢 TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div>
          <button 
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2 text-sage-light hover:text-sage-dark transition-colors text-sm font-medium mb-2"
          >
            <ArrowLeft size={16} /> Back to Products
          </button>
          <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
            <span className="text-[#FF9900]"><ShoppingBag size={24} /></span> 
            Amazon Import Hub
          </h1>
          <p className="text-sm text-sage-light mt-1">Apni store ke liye Amazon se latest products fetch karein.</p>
        </div>
        
        {/* Clear Data Button */}
        {fetchedProducts.length > 0 && (
          <button 
            onClick={() => {
              if(confirm("Are you sure? Fetched data clear ho jayega.")) clearAmazonData();
            }}
            className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-red-100"
          >
            Clear Fetched Data
          </button>
        )}
      </div>

      {/* 🟢 IMPORT CONTROLS (TABS & INPUTS) */}
      <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-cream-dark">
          <button 
            onClick={() => setImportMode("keyword")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              importMode === "keyword" ? "bg-cream text-sage-dark border-b-2 border-sage" : "text-sage-light hover:bg-cream/50"
            }`}
          >
            <DownloadCloud size={18} /> Bulk Search (Keyword)
          </button>
          <button 
            onClick={() => setImportMode("asin")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              importMode === "asin" ? "bg-cream text-sage-dark border-b-2 border-sage" : "text-sage-light hover:bg-cream/50"
            }`}
          >
            <LinkIcon size={18} /> Single Product (ASIN)
          </button>
        </div>

        {/* Inputs Area */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-end">
          
          {importMode === "keyword" ? (
            <>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Search Keyword *</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-light" />
                  <input 
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="e.g. Smart Watch, Gaming Laptop..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark"
                  />
                </div>
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Limit</label>
                <select 
                  value={limitInput}
                  onChange={(e) => setLimitInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </>
          ) : (
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Amazon ASIN *</label>
              <div className="relative">
                <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-light" />
                <input 
                  type="text"
                  value={asinInput}
                  onChange={(e) => setAsinInput(e.target.value)}
                  placeholder="e.g. B08N5WRWNW"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark uppercase"
                />
              </div>
            </div>
          )}

          {/* Fetch Button */}
          <button 
            onClick={handleFetch}
            disabled={isFetching}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#E68A00] text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-70 h-[46px]"
          >
            {isFetching ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
            Fetch Data
          </button>
        </div>
      </div>

      {/* 🟢 FETCHED DATA GRID (Zehdasht ka Kamaal) */}
      {fetchedProducts.length > 0 && (
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-sage-dark mb-4">
            Fetched Results ({fetchedProducts.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {fetchedProducts.map((product, index) => (
              <div key={index} className="bg-white border border-cream-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                
                {/* Product Image */}
                <div className="h-48 w-full bg-cream relative p-4 flex items-center justify-center">
                  <img 
                    src={product.thumbnail || product.images?.[0] || "/placeholder.jpg"} 
                    alt="Product"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                  {/* ASIN Badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-sage-dark border border-cream-dark shadow-sm">
                    ASIN: {product.externalId}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4 flex flex-col flex-1 border-t border-cream-dark">
                  <h4 className="font-semibold text-sage-dark text-sm line-clamp-2 mb-2" title={product.title}>
                    {product.title}
                  </h4>
                  <p className="text-lg font-bold text-sage mb-4 mt-auto">
                    ${product.price}
                  </p>

                  {/* 🟢 Action Button Logic (Already in DB ya Add to DB) */}
                  {product.alreadyInDB ? (
                    <button 
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-cream text-sage-light py-2 rounded-xl text-sm font-medium border border-cream-dark cursor-not-allowed"
                    >
                      <CheckCircle2 size={16} className="text-sage" /> Already in DB
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAddToDB(product.externalId)}
                      className="w-full flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Plus size={16} /> Add to Store
                    </button>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Khali State */}
      {!isFetching && fetchedProducts.length === 0 && (
        <div className="h-40 flex flex-col items-center justify-center text-sage-light bg-white border border-cream-dark rounded-2xl shadow-sm border-dashed">
          <ShoppingBag size={40} className="opacity-20 mb-3" />
          <p className="text-sm">Search keyword ya ASIN likh kar products fetch karein.</p>
        </div>
      )}

    </div>
  );
}