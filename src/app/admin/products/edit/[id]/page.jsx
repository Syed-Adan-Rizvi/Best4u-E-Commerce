// File Path: src/app/admin/products/edit/[id]/page.jsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  ArrowLeft, UploadCloud, Trash2, Link as LinkIcon, 
  ShoppingBag, Loader2, Video, Settings, Star, Zap, Save, RefreshCw, Plus
} from "lucide-react";

// 🛡️ FRONTEND ZOD SCHEMA (100% Sync with Backend Schema)
const productZodSchema = z.object({
  title: z.string().min(3, "Title kam az kam 3 characters ka hona chahiye"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description thori detail mein likhein"),
  price: z.number({ required_error: "Price lazmi hai", invalid_type_error: "Price number mein likhein" }).min(0),
  originalPrice: z.number().optional().nullable(),
  affiliateLink: z.string().url("Affiliate link lazmi aur valid hona chahiye"),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Category select karna lazmi hai"),
  source: z.enum(['AmazonAPI', 'Manual_Local', 'Other']),
  externalId: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  tags: z.string().optional(),
  features: z.array(z.object({
    title: z.string().min(1, "Feature title lazmi hai"),
    value: z.string().min(1, "Feature value lazmi hai")
  })).optional(),
});

export default function EditProductPage({ params }) {
  // Next.js 15+ convention for dynamic params
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const router = useRouter();

  // 🧠 States
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🖼️ Media States (Smart Segregation)
  const [existingImages, setExistingImages] = useState([]); // URLs from Database
  const [existingVideo, setExistingVideo] = useState(""); // URL from Database
  const [localImageFiles, setLocalImageFiles] = useState([]); // New files dragged by user
  const [localVideoFile, setLocalVideoFile] = useState(null); // New video dragged by user

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  // 🎛️ Form Setup
  const { register, control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productZodSchema),
  });

  const { fields: featureFields, append: addFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });

  const currentSource = watch("source");
  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  // =================================================================
  // 📡 1. INITIAL DATA FETCH (Product & Categories)
  // =================================================================
  // =================================================================
  // 📡 1. INITIAL DATA FETCH (Product & Categories)
  // =================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`🚀 [Fetch] Loading product ID: ${productId}`);
        
        // 1. Categories layen
        const catRes = await fetch("/api/categories?limit=100");
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.categories);

        // 2. 🟢 NAYA LOGIC: Sirf specific ID wala product fetch karein
        const prodRes = await fetch(`/api/products?id=${productId}`); 
        const prodData = await prodRes.json();
        
        if (prodData.success) {
          const product = prodData.product; // .find() ki zaroorat khatam, direct object mil gaya!
          
          if (!product) {
            toast.error("Product nahi mila!");
            router.push("/admin/products");
            return;
          }

          console.log("📦 [Pre-fill] Data received:", product);

          // Populate Form
          reset({
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            affiliateLink: product.affiliateLink,
            category: product.category?._id || product.category,
            source: product.source,
            externalId: product.externalId,
            rating: product.rating,
            reviewCount: product.reviewCount,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            metaTitle: product.metaTitle || "",
            metaDescription: product.metaDescription || "",
            tags: product.tags?.join(", ") || "", 
            features: product.features || [],
          });

          // Set Media
          setExistingImages(product.images || []);
          setExistingVideo(product.videoUrl || "");
        } else {
           toast.error(prodData.error || "Product load nahi ho saka");
           router.push("/admin/products");
        }
      } catch (error) {
        toast.error("Data load karne mein masla aaya");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (productId) fetchData();
  }, [productId, reset, router]);

  // Cleanup Blob URLs
  useEffect(() => {
    return () => {
      localImageFiles.forEach(img => URL.revokeObjectURL(img.preview));
      if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
    };
  }, [localImageFiles, localVideoFile]);


  // =================================================================
  // 🔄 2. THE AMAZON SYNC LOGIC
  // =================================================================
  const handleAmazonSync = async () => {
    const asin = watch("externalId");
    if (!asin) return toast.error("Is product ka ASIN mojood nahi hai!");

    setIsSyncing(true);
    const toastId = toast.loading("Amazon se fresh data laya ja raha hai... ⏳");

    try {
      console.log(`🔄 [Sync] Fetching fresh data for ASIN: ${asin}`);
      const res = await fetch(`/api/amazon/fetch?asin=${asin}`);
      const data = await res.json();

      if (data.success && data.product) {
        const freshData = data.product;
        
        // Difference Check Logic
        const oldPrice = watch("price");
        const oldRating = watch("rating");
        const oldReviews = watch("reviewCount");

        let diffMessage = "Kya aap in naye Amazon updates ko form mein laana chahte hain?\n\n";
        let hasChanges = false;

        if (oldPrice !== freshData.price) {
          diffMessage += `💰 Price: $${oldPrice} ➡️ $${freshData.price}\n`;
          hasChanges = true;
        }
        if (oldRating !== freshData.rating) {
          diffMessage += `⭐ Rating: ${oldRating} ➡️ ${freshData.rating}\n`;
          hasChanges = true;
        }
        if (oldReviews !== freshData.reviewCount) {
          diffMessage += `📝 Reviews: ${oldReviews} ➡️ ${freshData.reviewCount}\n`;
          hasChanges = true;
        }

        if (!hasChanges) {
          toast.success("Product pehle se hi Amazon ke sath fully updated hai! 💯", { id: toastId });
          return;
        }

        diffMessage += `\n(Title aur Description ko humne nahi chera taake aapka custom SEO kharab na ho)`;

        // Confirmation Box
        if (window.confirm(diffMessage)) {
          setValue("price", freshData.price);
          if (freshData.originalPrice) setValue("originalPrice", freshData.originalPrice);
          setValue("rating", freshData.rating);
          setValue("reviewCount", freshData.reviewCount);
          toast.success("Form mein naya data update ho gaya! Ab Save dabayen.", { id: toastId });
        } else {
          toast.info("Sync cancel kar diya gaya.", { id: toastId });
        }
      } else {
        toast.error("Amazon se naya data nahi mil saka.", { id: toastId });
      }
    } catch (error) {
      toast.error("Sync API fail ho gayi.", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };


  // =================================================================
  // 🖼️ 3. DRAG & DROP HANDLERS
  // =================================================================
  const processImageFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (!validFiles.length) return toast.error("Sirf image files allowed hain!");
    
    const newPreviews = validFiles.map(file => ({
      file, preview: URL.createObjectURL(file)
    }));
    setLocalImageFiles(prev => [...prev, ...newPreviews]);
  };

  const processVideoFile = (file) => {
    if (!file || !file.type.startsWith("video/")) return toast.error("Sirf video file allow hai!");
    if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
    setLocalVideoFile({ file, preview: URL.createObjectURL(file) });
  };

  // Pehchan Logic for Images
  const getImageSourceType = (url) => {
    if (url.includes("amazon.com") || url.includes("images-amazon")) return "Amazon";
    if (url.includes("cloudinary.com")) return "Cloudinary";
    return "Other";
  };


  // =================================================================
  // 🚀 4. FINAL SUBMIT (Save to DB)
  // =================================================================
  const uploadToCloudinary = async (file, type = "image") => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; 
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "best4u");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  };

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && localImageFiles.length === 0) {
      return toast.error("Kam az kam ek image lazmi hai!");
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Updating product...");

    try {
      // 1. Upload NEW Local Files
      let uploadedImageUrls = [];
      if (localImageFiles.length > 0) {
        toast.loading("Uploading new images to Cloudinary...", { id: toastId });
        uploadedImageUrls = await Promise.all(localImageFiles.map(img => uploadToCloudinary(img.file, "image")));
      }
      
      let finalVideoUrl = existingVideo; // Purani video ko default rakhein
      if (localVideoFile) {
        toast.loading("Uploading new video to Cloudinary...", { id: toastId });
        finalVideoUrl = await uploadToCloudinary(localVideoFile.file, "video");
      }

      // 2. Combine Images (Purani bachi hui + Nayi Uploaded)
      // Note: Backend automatically delete check laga lega!
      const finalImages = [...existingImages, ...uploadedImageUrls];

      // 3. Prepare Payload
      const processedData = {
        ...data,
        images: finalImages,
        videoUrl: finalVideoUrl,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      // 4. Hit Backend PUT API
      toast.loading("Saving changes to Database...", { id: toastId });
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product Updated & Garbage Cleared Successfully! 🚀", { id: toastId });
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Update error", { id: toastId });
      }
    } catch (error) {
      toast.error("Save process fail ho gaya.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-sage-light">
        <Loader2 size={40} className="animate-spin mb-4 text-sage" />
        <p className="text-lg font-medium text-sage-dark">Loading Product Data...</p>
      </div>
    );
  }

  // =================================================================
  // 🎨 UI RENDER
  // =================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🟢 TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div>
          <button onClick={() => router.push('/admin/products')} className="flex items-center gap-2 text-sage-light hover:text-sage-dark transition-colors text-sm font-medium mb-2">
            <ArrowLeft size={16} /> Back to Products List
          </button>
          
          <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
            <Settings size={24} className="text-sage" /> Edit Product
          </h1>
        </div>
        
        {/* 🌟 THE AMAZON SYNC BUTTON 🌟 */}
        {currentSource === "AmazonAPI" && (
          <button 
            onClick={handleAmazonSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900] hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync with Amazon"}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 lg:col-span-1">
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Product Title *</label>
                <input {...register("title")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">URL Slug</label>
                <input {...register("slug")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream/50 text-sage-light" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">SKU / ASIN</label>
                <input {...register("externalId")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream/30 uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Description *</label>
              <textarea {...register("description")} rows={5} className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage resize-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Current Price ($) *</label>
                <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage font-semibold text-sage-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Original Price ($)</label>
                <input {...register("originalPrice", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Rating</label>
                <input {...register("rating", { valueAsNumber: true })} type="number" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Reviews</label>
                <input {...register("reviewCount", { valueAsNumber: true })} type="number" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5 flex items-center gap-2">
                <LinkIcon size={16} /> Affiliate Link *
              </label>
              <input {...register("affiliateLink")} type="url" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
            </div>
          </div>

          {/* Features Dynamic List */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <h2 className="text-lg font-semibold text-sage-dark">Product Features</h2>
              <button type="button" onClick={() => addFeature({ title: "", value: "" })} className="text-sage hover:text-sage-dark text-sm font-medium flex items-center gap-1 bg-sage/10 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Add Feature
              </button>
            </div>
            {featureFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input {...register(`features.${index}.title`)} placeholder="Title" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                  <input {...register(`features.${index}.value`)} placeholder="Value" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                </div>
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          {/* SEO Section */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
              <Settings size={18} /> SEO Setup
            </h2>
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Title</label>
              <input {...register("metaTitle")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Description</label>
              <textarea {...register("metaDescription")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white resize-none" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Organization & Toggles */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-sage-dark flex items-center gap-2">
                    <Zap size={16} className={isActive ? "text-green-500" : "text-sage-light"} /> Product Status
                  </p>
                  <p className="text-[11px] text-sage-light">{isActive ? "In Stock / Visible" : "Sold Out / Hidden"}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" {...register("isActive")} className="sr-only" />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-sage' : 'bg-cream-dark'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-sage-dark flex items-center gap-2">
                    <Star size={16} className={isFeatured ? "text-[#FF9900]" : "text-sage-light"} /> Featured
                  </p>
                  <p className="text-[11px] text-sage-light">Show on Homepage</p>
                </div>
                <div className="relative">
                  <input type="checkbox" {...register("isFeatured")} className="sr-only" />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-[#FF9900]' : 'bg-cream-dark'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>

            <hr className="border-cream-dark" />

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Category *</label>
              <select {...register("category")} className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage">
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Tags</label>
              <input {...register("tags")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
            </div>
          </div>

          {/* MEDIA COLLECTION (Drag & Drop + Existing) */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Media Collection</h2>
            
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-2">Images *</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDraggingImage(false); }}
                onDrop={(e) => { e.preventDefault(); setIsDraggingImage(false); processImageFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all mb-4 ${
                  isDraggingImage ? 'border-sage bg-sage/5' : 'border-cream-dark bg-cream/30'
                }`}
              >
                <UploadCloud size={24} className={isDraggingImage ? 'text-sage mb-2' : 'text-sage-light mb-2'} />
                <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white font-semibold shadow-sm">
                  Add New Images <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => processImageFiles(e.target.files)} />
                </label>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Purani Images (Database se) */}
                {existingImages.map((url, i) => {
                  const type = getImageSourceType(url);
                  return (
                    <div key={`exist-${i}`} className={`relative group rounded-xl overflow-hidden border aspect-square bg-cream ${type === 'Amazon' ? 'border-[#FF9900]/50' : 'border-purple-400'}`}>
                      <img src={url} alt="Exist" className="w-full h-full object-cover" />
                      <div className={`absolute bottom-0 w-full text-white text-[9px] text-center py-0.5 ${type === 'Amazon' ? 'bg-[#FF9900]' : 'bg-purple-500'}`}>
                        {type}
                      </div>
                      <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Nayi Images (Local Preview) */}
                {localImageFiles.map((fileObj, i) => (
                  <div key={`local-${i}`} className="relative group rounded-xl overflow-hidden border border-sage aspect-square bg-cream">
                    <img src={fileObj.preview} alt="Local" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 w-full bg-sage text-white text-[9px] text-center py-0.5">New Local</div>
                    <button type="button" onClick={() => setLocalImageFiles(localImageFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-cream-dark" />

            {/* Video */}
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-2">Product Video</label>
              
              {localVideoFile ? (
                <div className="relative group rounded-xl overflow-hidden border border-sage w-full bg-black mt-3">
                  <video src={localVideoFile.preview} controls className="w-full h-auto max-h-40" />
                  <div className="absolute bottom-2 left-2 bg-sage text-white text-[10px] px-2 py-0.5 rounded">New Local Video</div>
                  <button type="button" onClick={() => setLocalVideoFile(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md z-10"><Trash2 size={16} /></button>
                </div>
              ) : existingVideo ? (
                <div className="relative group rounded-xl overflow-hidden border border-purple-400 w-full bg-black mt-3">
                  <video src={existingVideo} controls className="w-full h-auto max-h-40" />
                  <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded">Cloudinary Video</div>
                  <button type="button" onClick={() => setExistingVideo("")} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </div>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingVideo(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingVideo(false); processVideoFile(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${isDraggingVideo ? 'border-sage bg-sage/5' : 'border-cream-dark bg-cream/30'}`}
                >
                  <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white font-semibold shadow-sm">
                    Upload New Video <input type="file" accept="video/*" className="hidden" onChange={(e) => processVideoFile(e.target.files[0])} />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-sage text-white py-4 rounded-xl font-semibold hover:bg-sage-dark transition-all shadow-md disabled:opacity-70 text-lg"
          >
            {isSubmitting ? <><Loader2 size={22} className="animate-spin" /> Saving Changes...</> : <><Save size={22} /> Update Product</>}
          </button>
          
        </div>
      </form>
    </div>
  );
}