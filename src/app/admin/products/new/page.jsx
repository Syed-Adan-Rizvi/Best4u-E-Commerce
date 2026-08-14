// File Path: src/app/admin/products/new/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  ArrowLeft, UploadCloud, Plus, Trash2, Link as LinkIcon, 
  ShoppingBag, Loader2, Video, Settings, Star, Zap, Image as ImageIcon
} from "lucide-react";
import useAmazonStore from "@/store/useAmazonStore";

// 🛡️ FRONTEND ZOD SCHEMA
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

// =================================================================
// 🎨 UI STORY: "The Ultimate Product Form with Drag & Drop"
// =================================================================
export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const importAsin = searchParams.get("import");

  console.log("🛠️ [Component Mount] Form Load Hua Hai.");

  // 🧠 Zehdasht & States (markAsAddedInDB nikal liya)
  const { fetchedProducts, cameFromAmazon, setCameFromAmazon, markAsAddedInDB } = useAmazonStore();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🖼️ Media States
  const [amazonImages, setAmazonImages] = useState([]); 
  const [localImageFiles, setLocalImageFiles] = useState([]); 
  const [localVideoFile, setLocalVideoFile] = useState(null); 

  // 🖱️ Drag & Drop States
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  // 🎛️ React Hook Form Setup
  const {
    register, control, handleSubmit, setValue, watch, formState: { errors, touchedFields }
  } = useForm({
    resolver: zodResolver(productZodSchema),
    defaultValues: {
      source: "Manual_Local",
      features: [],
      rating: 0,
      reviewCount: 0,
      isFeatured: false,
      isActive: true,
    }
  });

  const { fields: featureFields, append: addFeature, remove: removeFeature } = useFieldArray({
    control, name: "features"
  });

  const currentTitle = watch("title");
  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  // 🔗 AUTO-SLUG GENERATOR
  useEffect(() => {
    if (currentTitle && !touchedFields.slug) {
      const generatedSlug = currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [currentTitle, setValue, touchedFields.slug]);

  // 📡 1. CATEGORIES FETCH & AMAZON PRE-FILL
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories?limit=100");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (error) {
        console.error("❌ Categories Fetch Error", error);
      }
    };
    loadCategories();

    if (importAsin && fetchedProducts.length > 0) {
      console.log(`📦 [Amazon Sync] ASIN (${importAsin}) pre-fill ho raha hai...`);
      const productToImport = fetchedProducts.find(p => p.externalId === importAsin);
      
      if (productToImport) {
        toast.success("Amazon data auto-filled!");
        setValue("title", productToImport.title);
        setValue("description", productToImport.description || "Amazon imported product.");
        setValue("price", productToImport.price);
        if (productToImport.originalPrice) setValue("originalPrice", productToImport.originalPrice);
        setValue("affiliateLink", productToImport.affiliateLink);
        setValue("source", "AmazonAPI");
        setValue("externalId", productToImport.externalId); 
        setValue("rating", productToImport.rating || 0);    
        setValue("reviewCount", productToImport.reviewCount || 0); 
        
        if (productToImport.images && productToImport.images.length > 0) {
          setAmazonImages(productToImport.images);
        } else if (productToImport.thumbnail) {
          setAmazonImages([productToImport.thumbnail]);
        }
      }
    }
  }, [importAsin, fetchedProducts, setValue]);

  // 🗑️ MEMORY LEAK CLEANUP
  useEffect(() => {
    return () => {
      localImageFiles.forEach(img => URL.revokeObjectURL(img.preview));
      if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
    };
  }, [localImageFiles, localVideoFile]);

  // =================================================================
  // 🖼️ 2. DRAG & DROP + LOCAL MEDIA LOGIC
  // =================================================================
  
  const processImageFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    
    if (!validFiles.length) {
      return toast.error("Sirf image files (JPG, PNG) allowed hain!");
    }
    
    console.log(`📂 [Image Select] User ne ${validFiles.length} nayi images select/drop ki hain.`);
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setLocalImageFiles(prev => [...prev, ...newPreviews]);
  };

  const processVideoFile = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      return toast.error("Sirf video file (MP4) allow hai!");
    }
    
    console.log(`📂 [Video Select] User ne video select/drop ki hai: ${file.name}`);
    if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
    setLocalVideoFile({
      file,
      preview: URL.createObjectURL(file)
    });
  };

  // ☁️ 3. CLOUDINARY UPLOADER (Executes on Save)
  const uploadToCloudinary = async (file, type = "image") => {
    console.log(`☁️ [Cloudinary Upload] Uploading ${type}...`);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; 
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "best4u");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.secure_url;
  };

  // 🚀 4. FINAL FORM SUBMIT
  const onSubmit = async (data) => {
    if (amazonImages.length === 0 && localImageFiles.length === 0) {
      return toast.error("Kam az kam ek image zaroor upload karein!");
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing your request...");

    try {
      toast.loading("Uploading media to Cloudinary... ☁️", { id: toastId });
      
      const uploadedImageUrls = await Promise.all(
        localImageFiles.map(img => uploadToCloudinary(img.file, "image"))
      );
      
      let finalVideoUrl = "";
      if (localVideoFile) {
        finalVideoUrl = await uploadToCloudinary(localVideoFile.file, "video");
      }

      const finalImages = [...amazonImages, ...uploadedImageUrls];

      toast.loading("Saving to database... 💾", { id: toastId });
      
      const processedData = {
        ...data,
        images: finalImages, 
        videoUrl: finalVideoUrl,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [], 
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product successfully added to store! 🚀", { id: toastId });
        
        // 🌟 ZUSTAND FIX: Mark as added using 'data.externalId'
        if (data.externalId) {
          markAsAddedInDB(data.externalId); 
        }
        
        setCameFromAmazon(false);
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Database error occurred", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload ya Save mein problem aayi.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI RENDER
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🟢 TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div>
          {cameFromAmazon ? (
            <button 
              onClick={() => router.push('/admin/products/import')}
              className="flex items-center gap-2 text-[#FF9900] hover:text-[#E68A00] transition-colors text-sm font-semibold mb-2"
            >
              <ArrowLeft size={16} /> Go Back to Amazon Search Results
            </button>
          ) : (
            <button 
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-2 text-sage-light hover:text-sage-dark transition-colors text-sm font-medium mb-2"
            >
              <ArrowLeft size={16} /> Back to Products List
            </button>
          )}
          
          <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
            {watch("source") === "AmazonAPI" ? (
              <><ShoppingBag size={24} className="text-[#FF9900]" /> Review Amazon Product</>
            ) : (
              <><Plus size={24} className="text-sage" /> Add New Product</>
            )}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Main Info, SEO, Features */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 lg:col-span-1">
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Product Title *</label>
                <input {...register("title")} type="text" placeholder="Product name" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">URL Slug (Auto)</label>
                <input {...register("slug")} type="text" placeholder="auto-generated-slug" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream/50 text-sage-light focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">SKU / ASIN (Optional)</label>
                <input {...register("externalId")} type="text" placeholder="e.g. B08XYZ or SKU-123" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Description *</label>
              <textarea {...register("description")} rows={5} placeholder="Write detailed product description..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Current Price ($) *</label>
                <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Original Price ($)</label>
                <input {...register("originalPrice", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Rating (0-5)</label>
                <input {...register("rating", { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Review Count</label>
                <input {...register("reviewCount", { valueAsNumber: true })} type="number" placeholder="e.g. 120" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5 flex items-center gap-2">
                <LinkIcon size={16} /> Affiliate Link (Amazon/External) *
              </label>
              <input {...register("affiliateLink")} type="url" placeholder="https://amazon.com/dp/..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
              {errors.affiliateLink && <p className="text-red-500 text-xs mt-1">{errors.affiliateLink.message}</p>}
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
            {featureFields.length === 0 && <p className="text-sm text-sage-light py-2">No features added. (e.g. Brand: Apple)</p>}
            {featureFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input {...register(`features.${index}.title`)} placeholder="e.g. Color" className="w-full px-3 py-2 rounded-lg border border-cream-dark focus:ring-2 focus:ring-sage text-sm" />
                  <input {...register(`features.${index}.value`)} placeholder="e.g. Matte Black" className="w-full px-3 py-2 rounded-lg border border-cream-dark focus:ring-2 focus:ring-sage text-sm" />
                </div>
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* SEO Section */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
              <Settings size={18} /> Search Engine Optimization (SEO)
            </h2>
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Title (Optional)</label>
              <input {...register("metaTitle")} type="text" placeholder="Catchy title for Google..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Description (Optional)</label>
              <textarea {...register("metaDescription")} rows={3} placeholder="Brief description for search results..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Media, Organization, Visibility */}
        {/* ========================================================= */}
        <div className="space-y-6">
          
          {/* Visibility & Organization */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Status & Organization</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-sage-dark group-hover:text-sage transition-colors flex items-center gap-2">
                    <Zap size={16} className={isActive ? "text-green-500" : "text-sage-light"} /> 
                    Product Status
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
                  <p className="text-sm font-medium text-sage-dark group-hover:text-sage transition-colors flex items-center gap-2">
                    <Star size={16} className={isFeatured ? "text-[#FF9900]" : "text-sage-light"} /> 
                    Featured Product
                  </p>
                  <p className="text-[11px] text-sage-light">Show on Frontend Homepage</p>
                </div>
                <div className="relative">
                  <input type="checkbox" {...register("isFeatured")} className="sr-only" />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-[#FF9900]' : 'bg-cream-dark'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>

            <hr className="border-cream-dark my-4" />

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Category *</label>
              <select {...register("category")} className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage">
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Tags</label>
              <input {...register("tags")} type="text" placeholder="smart, watch, tech (Comma separated)" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
            </div>
          </div>

          {/* DRAG & DROP MEDIA COLLECTION */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Media Collection</h2>
            
            {/* --- IMAGES SECTION --- */}
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-2">Images *</label>
              
              {/* Drag & Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDraggingImage(false); }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  setIsDraggingImage(false); 
                  processImageFiles(e.dataTransfer.files); 
                }}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 mb-4 ${
                  isDraggingImage ? 'border-sage bg-sage/5 scale-[1.02]' : 'border-cream-dark bg-cream/30 hover:bg-cream/70'
                }`}
              >
                <UploadCloud size={32} className={`mb-3 ${isDraggingImage ? 'text-sage' : 'text-sage-light'}`} />
                <p className="text-sm text-sage-dark font-medium mb-1">Drag & drop images here</p>
                <p className="text-xs text-sage-light mb-4">or click below to browse from device</p>
                
                <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-4 py-2 rounded-lg hover:bg-sage hover:text-white transition-colors font-semibold shadow-sm">
                  Browse Images
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => processImageFiles(e.target.files)} />
                </label>
              </div>
              
              {/* Image Previews Grid */}
              <div className="grid grid-cols-3 gap-2">
                {amazonImages.map((url, i) => (
                  <div key={`amazon-${i}`} className="relative group rounded-xl overflow-hidden border border-[#FF9900]/30 aspect-square bg-cream">
                    <img src={url} alt="Amazon" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-[#FF9900] text-white text-[9px] text-center py-0.5">Amazon</div>
                    <button type="button" onClick={() => setAmazonImages(amazonImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {localImageFiles.map((fileObj, i) => (
                  <div key={`local-${i}`} className="relative group rounded-xl overflow-hidden border border-sage aspect-square bg-cream">
                    <img src={fileObj.preview} alt="Local" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-sage text-white text-[9px] text-center py-0.5">New</div>
                    <button type="button" onClick={() => setLocalImageFiles(localImageFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              {amazonImages.length === 0 && localImageFiles.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Kam az kam 1 image lazmi hai.</p>
              )}
            </div>

            <hr className="border-cream-dark" />

            {/* --- VIDEO SECTION --- */}
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-2">Product Video (Optional)</label>
              
              {localVideoFile ? (
                <div className="relative group rounded-xl overflow-hidden border border-sage w-full bg-black mt-3 shadow-sm">
                  <video src={localVideoFile.preview} controls className="w-full h-auto max-h-40" />
                  <div className="absolute bottom-2 left-2 bg-sage text-white text-[10px] px-2 py-0.5 rounded">Ready to Upload</div>
                  <button type="button" onClick={() => setLocalVideoFile(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingVideo(false); }}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDraggingVideo(false); 
                    processVideoFile(e.dataTransfer.files[0]); 
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                    isDraggingVideo ? 'border-sage bg-sage/5 scale-[1.02]' : 'border-cream-dark bg-cream/30 hover:bg-cream/70'
                  }`}
                >
                  <Video size={28} className={`mb-2 ${isDraggingVideo ? 'text-sage' : 'text-sage-light'}`} />
                  <p className="text-xs text-sage-dark font-medium mb-3">Drag & drop a video file (MP4)</p>
                  
                  <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white transition-colors font-semibold shadow-sm">
                    Browse Video
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => processVideoFile(e.target.files[0])} />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-sage text-white py-4 rounded-xl font-semibold hover:bg-sage-dark transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? (
              <><Loader2 size={22} className="animate-spin" /> Processing & Uploading...</>
            ) : (
              <><Plus size={22} /> Save Product to Store</>
            )}
          </button>
          
        </div>

      </form>
    </div>
  );
}






















// // File Path: src/app/admin/products/new/page.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import { 
//   ArrowLeft, UploadCloud, Plus, Trash2, Link as LinkIcon, 
//   ShoppingBag, Loader2, Video, Settings, Star, Zap
// } from "lucide-react";
// import useAmazonStore from "@/store/useAmazonStore";

// // 🛡️ FRONTEND ZOD SCHEMA (100% Sync with Backend Schema)
// const productZodSchema = z.object({
//   title: z.string().min(3, "Title kam az kam 3 characters ka hona chahiye"),
//   slug: z.string().optional(),
//   description: z.string().min(10, "Description thori detail mein likhein"),
  
//   price: z.number({ required_error: "Price lazmi hai", invalid_type_error: "Price number mein likhein" }).min(0),
//   originalPrice: z.number().optional().nullable(),
  
//   affiliateLink: z.string().url("Affiliate link lazmi aur valid hona chahiye"),
//   category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Category select karna lazmi hai"),
//   source: z.enum(['AmazonAPI', 'Manual_Local', 'Other']),
  
//   externalId: z.string().optional().nullable(), // For Amazon ASIN or Manual SKU
//   rating: z.number().min(0).max(5).optional(), // 0 se 5 tak rating
//   reviewCount: z.number().min(0).optional(), // Total reviews count
  
//   // SEO & Visibility Flags
//   metaTitle: z.string().optional(),
//   metaDescription: z.string().optional(),
//   isFeatured: z.boolean().default(false),
//   isActive: z.boolean().default(true),
  
//   tags: z.string().optional(),
//   features: z.array(z.object({
//     title: z.string().min(1, "Feature title lazmi hai"),
//     value: z.string().min(1, "Feature value lazmi hai")
//   })).optional(),
// });

// // =================================================================
// // 🎨 UI STORY: "The Ultimate Product Form (Fixed & Upgraded)"
// // Isme Auto-Slug, ASIN/Rating fields, aur Zero-Cost Cloudinary Preview shamil hai.
// // =================================================================
// export default function AddProductPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const importAsin = searchParams.get("import");

//   console.log("🛠️ [Component Mount] Form Load Hua Hai.");

//   // 🧠 Zehdasht & States
//   const { fetchedProducts, cameFromAmazon, setCameFromAmazon } = useAmazonStore();
//   const [categories, setCategories] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 🖼️ Media States (Preview First, Upload Later Logic)
//   const [amazonImages, setAmazonImages] = useState([]); // Jo Amazon se direct URLs aaye
//   const [localImageFiles, setLocalImageFiles] = useState([]); // Jo admin ne PC/Mobile se select kiye
//   const [localVideoFile, setLocalVideoFile] = useState(null); 

//   // 🎛️ React Hook Form Setup
//   const {
//     register, control, handleSubmit, setValue, watch, formState: { errors, touchedFields }
//   } = useForm({
//     resolver: zodResolver(productZodSchema),
//     defaultValues: {
//       source: "Manual_Local",
//       features: [],
//       rating: 0,
//       reviewCount: 0,
//       isFeatured: false,
//       isActive: true,
//     }
//   });

//   const { fields: featureFields, append: addFeature, remove: removeFeature } = useFieldArray({
//     control, name: "features"
//   });

//   // Watchers for Real-time UI updates
//   const currentTitle = watch("title");
//   const isFeatured = watch("isFeatured");
//   const isActive = watch("isActive");

//   // 🔗 FIXED AUTO-SLUG GENERATOR
//   useEffect(() => {
//     // Logic: Agar Title mein kuch likha hai, AUR admin ne abhi tak manually Slug input par click kar ke usay "touch" nahi kiya, tabhi auto-generate karo.
//     if (currentTitle && !touchedFields.slug) {
//       const generatedSlug = currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//       setValue("slug", generatedSlug, { shouldValidate: true });
//       console.log(`🔗 [Slug Generator] Naya Slug bana: ${generatedSlug}`);
//     }
//   }, [currentTitle, setValue, touchedFields.slug]);

//   // 📡 1. CATEGORIES FETCH & AMAZON PRE-FILL
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetch("/api/categories?limit=100");
//         const data = await res.json();
//         if (data.success) setCategories(data.categories);
//       } catch (error) {
//         console.error("❌ Categories Fetch Error", error);
//       }
//     };
//     loadCategories();

//     // 🌟 AMAZON PREFILL LOGIC
//     if (importAsin && fetchedProducts.length > 0) {
//       console.log(`📦 [Amazon Sync] ASIN (${importAsin}) ke data ko form mein pre-fill kiya ja raha hai...`);
      
//       const productToImport = fetchedProducts.find(p => p.externalId === importAsin);
//       if (productToImport) {
//         toast.success("Amazon data auto-filled!");
        
//         // Populate Form Fields
//         setValue("title", productToImport.title);
//         setValue("description", productToImport.description || "Amazon imported product.");
//         setValue("price", productToImport.price);
//         if (productToImport.originalPrice) setValue("originalPrice", productToImport.originalPrice);
//         setValue("affiliateLink", productToImport.affiliateLink);
//         setValue("source", "AmazonAPI");
        
//         // 🎯 Newly added UI Fields population
//         setValue("externalId", productToImport.externalId); // ASIN fill ho gaya
//         setValue("rating", productToImport.rating || 0);    // Rating fill ho gayi
//         setValue("reviewCount", productToImport.reviewCount || 0); // Reviews count fill ho gaya
        
//         // Amazon Images mapping
//         if (productToImport.images && productToImport.images.length > 0) {
//           setAmazonImages(productToImport.images);
//           console.log("🖼️ [Amazon Images] Images pre-filled:", productToImport.images);
//         } else if (productToImport.thumbnail) {
//           setAmazonImages([productToImport.thumbnail]);
//         }
//       }
//     }
//   }, [importAsin, fetchedProducts, setValue]);

//   // 🗑️ MEMORY LEAK CLEANUP
//   useEffect(() => {
//     return () => {
//       // Jab component close ho, toh local blob URLs ko destroy kar do taake browser RAM clear ho jaye
//       localImageFiles.forEach(img => URL.revokeObjectURL(img.preview));
//       if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
//     };
//   }, [localImageFiles, localVideoFile]);

//   // 🖼️ 2. LOCAL MEDIA HANDLERS (Generate Preview, No Cloudinary Upload yet)
//   const handleLocalImageSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;
    
//     console.log(`📂 [File Select] User ne ${files.length} nayi images select ki hain.`);
//     const newPreviews = files.map(file => ({
//       file,
//       preview: URL.createObjectURL(file) // 🌟 Local Temporary Link (Zero Cost)
//     }));
//     setLocalImageFiles(prev => [...prev, ...newPreviews]);
//   };

//   const handleLocalVideoSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     console.log(`📂 [File Select] User ne video select ki hai: ${file.name}`);
//     if (localVideoFile) URL.revokeObjectURL(localVideoFile.preview);
//     setLocalVideoFile({
//       file,
//       preview: URL.createObjectURL(file)
//     });
//   };

//   // ☁️ 3. THE ACTUAL CLOUDINARY UPLOADER (Yeh function sirf submit par chalega)
//   const uploadToCloudinary = async (file, type = "image") => {
//     console.log(`☁️ [Cloudinary Upload] Uploading ${type} file to Cloudinary...`);
//     const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
//     const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; 
    
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", uploadPreset);
//     formData.append("folder", "best4u");

//     const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
//       method: "POST",
//       body: formData,
//     });
//     const data = await res.json();
//     if (data.error) throw new Error(data.error.message);
    
//     console.log(`✅ [Cloudinary Success] File uploaded. URL: ${data.secure_url}`);
//     return data.secure_url;
//   };

//   // 🚀 4. FINAL FORM SUBMIT HANDLER
//   const onSubmit = async (data) => {
//     console.log("=========================================");
//     console.log("🚀 [Submit Start] 'Save Product' button dabaya gaya.");
    
//     // Image Check
//     if (amazonImages.length === 0 && localImageFiles.length === 0) {
//       console.warn("⚠️ [Submit Blocked] Koi image majood nahi thi.");
//       return toast.error("Kam az kam ek image zaroor upload karein!");
//     }

//     setIsSubmitting(true);
//     const toastId = toast.loading("Processing your request...");

//     try {
//       // ----------------------------------------------------
//       // STEP 1: UPLOAD LOCAL FILES TO CLOUDINARY FIRST
//       // ----------------------------------------------------
//       console.log("⏳ [Step 1] Local files ko Cloudinary par upload kar rahe hain...");
//       toast.loading("Uploading media to Cloudinary... ☁️", { id: toastId });
      
//       const uploadedImageUrls = await Promise.all(
//         localImageFiles.map(img => uploadToCloudinary(img.file, "image"))
//       );
      
//       let finalVideoUrl = "";
//       if (localVideoFile) {
//         finalVideoUrl = await uploadToCloudinary(localVideoFile.file, "video");
//       }

//       // Assemble all images (Amazon URLs + New Cloudinary URLs)
//       const finalImages = [...amazonImages, ...uploadedImageUrls];
//       console.log("✅ [Step 1 Done] Final Images Array:", finalImages);

//       // ----------------------------------------------------
//       // STEP 2: PREPARE FINAL PAYLOAD FOR DATABASE
//       // ----------------------------------------------------
//       console.log("⏳ [Step 2] Database payload tyar kiya ja raha hai...");
//       toast.loading("Saving to database... 💾", { id: toastId });
      
//       const processedData = {
//         ...data,
//         images: finalImages, 
//         videoUrl: finalVideoUrl,
//         tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [], // Tags string ko array banaya
//       };

//       console.log("📦 [Final Payload Bheja Jaa Raha Hai]:", processedData);

//       // ----------------------------------------------------
//       // STEP 3: HIT DATABASE API
//       // ----------------------------------------------------
//       const response = await fetch("/api/products", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(processedData),
//       });

//       const result = await response.json();
//       console.log("📡 [Backend Response]:", result);

//       if (response.ok) {
//         toast.success("Product successfully added to store! 🚀", { id: toastId });
//         setCameFromAmazon(false); // Zehdasht clear ki
//         router.push("/admin/products"); // Products list par wapis bhej diya
//       } else {
//         toast.error(result.error || "Database error occurred", { id: toastId });
//       }
//     } catch (error) {
//       console.error("❌ [Submit Process Error]:", error);
//       toast.error("Upload ya Save mein problem aayi.", { id: toastId });
//     } finally {
//       setIsSubmitting(false);
//       console.log("🏁 [Submit Process End]");
//       console.log("=========================================");
//     }
//   };

//   // UI RENDER
//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
      
//       {/* 🟢 TOP HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
//         <div>
//           {cameFromAmazon ? (
//             <button 
//               onClick={() => router.push('/admin/products/import')}
//               className="flex items-center gap-2 text-[#FF9900] hover:text-[#E68A00] transition-colors text-sm font-semibold mb-2"
//             >
//               <ArrowLeft size={16} /> Go Back to Amazon Search Results
//             </button>
//           ) : (
//             <button 
//               onClick={() => router.push('/admin/products')}
//               className="flex items-center gap-2 text-sage-light hover:text-sage-dark transition-colors text-sm font-medium mb-2"
//             >
//               <ArrowLeft size={16} /> Back to Products List
//             </button>
//           )}
          
//           <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
//             {watch("source") === "AmazonAPI" ? (
//               <><ShoppingBag size={24} className="text-[#FF9900]" /> Review Amazon Product</>
//             ) : (
//               <><Plus size={24} className="text-sage" /> Add New Product</>
//             )}
//           </h1>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
//         {/* ========================================================= */}
//         {/* LEFT COLUMN: Main Info, SEO, Features */}
//         {/* ========================================================= */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Basic Info */}
//           <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
//             <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Basic Information</h2>
            
//             {/* Title, Slug & External ID */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="md:col-span-1 lg:col-span-1">
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">Product Title *</label>
//                 <input {...register("title")} type="text" placeholder="Product name" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//                 {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">URL Slug (Auto)</label>
//                 <input {...register("slug")} type="text" placeholder="auto-generated-slug" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream/50 text-sage-light focus:outline-none" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">SKU / ASIN (Optional)</label>
//                 <input {...register("externalId")} type="text" placeholder="e.g. B08XYZ or SKU-123" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage uppercase" />
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5">Description *</label>
//               <textarea {...register("description")} rows={5} placeholder="Write detailed product description..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
//               {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
//             </div>

//             {/* Pricing & Ratings Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">Current Price ($) *</label>
//                 <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//                 {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">Original Price ($)</label>
//                 <input {...register("originalPrice", { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">Rating (0-5)</label>
//                 <input {...register("rating", { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-sage-dark mb-1.5">Review Count</label>
//                 <input {...register("reviewCount", { valueAsNumber: true })} type="number" placeholder="e.g. 120" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//               </div>
//             </div>

//             {/* Affiliate Link */}
//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5 flex items-center gap-2">
//                 <LinkIcon size={16} /> Affiliate Link (Amazon/External) *
//               </label>
//               <input {...register("affiliateLink")} type="url" placeholder="https://amazon.com/dp/..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//               {errors.affiliateLink && <p className="text-red-500 text-xs mt-1">{errors.affiliateLink.message}</p>}
//             </div>
//           </div>

//           {/* Features Dynamic List */}
//           <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
//             <div className="flex items-center justify-between border-b border-cream-dark pb-3">
//               <h2 className="text-lg font-semibold text-sage-dark">Product Features</h2>
//               <button type="button" onClick={() => addFeature({ title: "", value: "" })} className="text-sage hover:text-sage-dark text-sm font-medium flex items-center gap-1 bg-sage/10 px-3 py-1.5 rounded-lg transition-colors">
//                 <Plus size={16} /> Add Feature
//               </button>
//             </div>
//             {featureFields.length === 0 && <p className="text-sm text-sage-light py-2">No features added. (e.g. Brand: Apple)</p>}
//             {featureFields.map((field, index) => (
//               <div key={field.id} className="flex items-start gap-3">
//                 <div className="flex-1 grid grid-cols-2 gap-3">
//                   <input {...register(`features.${index}.title`)} placeholder="e.g. Color" className="w-full px-3 py-2 rounded-lg border border-cream-dark focus:ring-2 focus:ring-sage text-sm" />
//                   <input {...register(`features.${index}.value`)} placeholder="e.g. Matte Black" className="w-full px-3 py-2 rounded-lg border border-cream-dark focus:ring-2 focus:ring-sage text-sm" />
//                 </div>
//                 <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5">
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* SEO Section */}
//           <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
//             <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
//               <Settings size={18} /> Search Engine Optimization (SEO)
//             </h2>
//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Title (Optional)</label>
//               <input {...register("metaTitle")} type="text" placeholder="Catchy title for Google..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Description (Optional)</label>
//               <textarea {...register("metaDescription")} rows={3} placeholder="Brief description for search results..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
//             </div>
//           </div>

//         </div>

//         {/* ========================================================= */}
//         {/* RIGHT COLUMN: Media, Organization, Visibility */}
//         {/* ========================================================= */}
//         <div className="space-y-6">
          
//           {/* Visibility & Organization */}
//           <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
//             <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Status & Organization</h2>
            
//             {/* Custom Toggles */}
//             <div className="space-y-4">
//               <label className="flex items-center justify-between cursor-pointer group">
//                 <div>
//                   <p className="text-sm font-medium text-sage-dark group-hover:text-sage transition-colors flex items-center gap-2">
//                     <Zap size={16} className={isActive ? "text-green-500" : "text-sage-light"} /> 
//                     Product Status
//                   </p>
//                   <p className="text-[11px] text-sage-light">{isActive ? "In Stock / Visible" : "Sold Out / Hidden"}</p>
//                 </div>
//                 <div className="relative">
//                   <input type="checkbox" {...register("isActive")} className="sr-only" />
//                   <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-sage' : 'bg-cream-dark'}`}></div>
//                   <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-4' : ''}`}></div>
//                 </div>
//               </label>

//               <label className="flex items-center justify-between cursor-pointer group">
//                 <div>
//                   <p className="text-sm font-medium text-sage-dark group-hover:text-sage transition-colors flex items-center gap-2">
//                     <Star size={16} className={isFeatured ? "text-[#FF9900]" : "text-sage-light"} /> 
//                     Featured Product
//                   </p>
//                   <p className="text-[11px] text-sage-light">Show on Frontend Homepage</p>
//                 </div>
//                 <div className="relative">
//                   <input type="checkbox" {...register("isFeatured")} className="sr-only" />
//                   <div className={`block w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-[#FF9900]' : 'bg-cream-dark'}`}></div>
//                   <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-4' : ''}`}></div>
//                 </div>
//               </label>
//             </div>

//             <hr className="border-cream-dark my-4" />

//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5">Category *</label>
//               <select {...register("category")} className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage">
//                 <option value="">Select Category...</option>
//                 {categories.map(cat => (
//                   <option key={cat._id} value={cat._id}>{cat.name}</option>
//                 ))}
//               </select>
//               {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-sage-dark mb-1.5">Tags</label>
//               <input {...register("tags")} type="text" placeholder="smart, watch, tech (Comma separated)" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage" />
//             </div>
//           </div>

//           {/* Media Previews (Safe Frontend Upload Strategy) */}
//           <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
//             <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3">Media Collection</h2>
            
//             {/* Images */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <label className="text-sm font-medium text-sage-dark">Images *</label>
//                 <label className="cursor-pointer text-xs bg-sage/10 text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white transition-colors flex items-center gap-1 font-semibold">
//                   <UploadCloud size={14} /> Browse
//                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleLocalImageSelect} />
//                 </label>
//               </div>
              
//               <div className="grid grid-cols-3 gap-2">
//                 {/* 1. Amazon Pre-filled Images */}
//                 {amazonImages.map((url, i) => (
//                   <div key={`amazon-${i}`} className="relative group rounded-xl overflow-hidden border border-[#FF9900]/30 aspect-square bg-cream">
//                     <img src={url} alt="Amazon" className="w-full h-full object-cover" />
//                     <div className="absolute bottom-0 left-0 right-0 bg-[#FF9900] text-white text-[9px] text-center py-0.5">Amazon</div>
//                     <button type="button" onClick={() => setAmazonImages(amazonImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Trash2 size={12} />
//                     </button>
//                   </div>
//                 ))}

//                 {/* 2. Local File Previews */}
//                 {localImageFiles.map((fileObj, i) => (
//                   <div key={`local-${i}`} className="relative group rounded-xl overflow-hidden border border-sage aspect-square bg-cream">
//                     <img src={fileObj.preview} alt="Local" className="w-full h-full object-cover" />
//                     <div className="absolute bottom-0 left-0 right-0 bg-sage text-white text-[9px] text-center py-0.5">New</div>
//                     <button type="button" onClick={() => setLocalImageFiles(localImageFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Trash2 size={12} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
              
//               {amazonImages.length === 0 && localImageFiles.length === 0 && (
//                 <p className="text-xs text-red-500 mt-2">Kam az kam 1 image lazmi hai.</p>
//               )}
//             </div>

//             {/* Video */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <label className="text-sm font-medium text-sage-dark">Product Video</label>
//                 <label className="cursor-pointer text-xs bg-sage/10 text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white transition-colors flex items-center gap-1 font-semibold">
//                   <Video size={14} /> Browse Video
//                   <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoSelect} />
//                 </label>
//               </div>
              
//               {localVideoFile ? (
//                 <div className="relative group rounded-xl overflow-hidden border border-sage w-full bg-black">
//                   <video src={localVideoFile.preview} controls className="w-full h-auto max-h-40" />
//                   <div className="absolute bottom-2 left-2 bg-sage text-white text-[10px] px-2 py-0.5 rounded">Ready to Upload</div>
//                   <button type="button" onClick={() => setLocalVideoFile(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               ) : (
//                 <div className="h-20 bg-cream/50 border border-cream-dark rounded-xl flex items-center justify-center text-xs text-sage-light border-dashed">
//                   No video selected
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button 
//             type="submit" 
//             disabled={isSubmitting}
//             className="w-full flex items-center justify-center gap-2 bg-sage text-white py-4 rounded-xl font-semibold hover:bg-sage-dark transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-lg"
//           >
//             {isSubmitting ? (
//               <><Loader2 size={22} className="animate-spin" /> Processing & Uploading...</>
//             ) : (
//               <><Plus size={22} /> Save Product to Store</>
//             )}
//           </button>
          
//         </div>

//       </form>
//     </div>
//   );
// }