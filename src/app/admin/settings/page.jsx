// File Path: src/app/admin/settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Save, Loader2, Image as ImageIcon, UploadCloud, Trash2, 
  Settings, Type, ShieldCheck, Link as LinkIcon, Plus, LayoutTemplate
} from "lucide-react";

// 🛡️ FRONTEND ZOD SCHEMA (Backend wala exact schema)
const settingsZodSchema = z.object({
  siteName: z.string().min(2, "Site ka naam kam az kam 2 characters ka hona chahiye").optional(),
  contactEmail: z.string().email("Email valid nahi hai").optional().or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  heroDescription: z.string().optional(),
  
  // React Hook Form mein arrays of strings ko handle karna thoda tricky hota hai, 
  // Isliye hum UI mein objects use karenge aur submit karte waqt strings mein badal denge.
  heroTypewriterLinesObj: z.array(z.object({ text: z.string().min(1, "Line khali nahi ho sakti") })).optional(),
  
  trustBadges: z.array(
    z.object({
      icon: z.string().optional(),
      value: z.string().min(1, "Value lazmi hai"),
      label: z.string().min(1, "Label lazmi hai")
    })
  ).optional(),
  
  socialLinks: z.array(
    z.object({
      platformName: z.string().min(1, "Platform lazmi hai"),
      url: z.string().url("Social link URL valid nahi hai").optional(),
      icon: z.string().optional()
    })
  ).optional(),
});

// =================================================================
// 🎨 UI STORY: "The Master Site Settings Form"
// Yahan admin website ka naam, logo, hero section, aur footer manage karega.
// Preview First, Upload Later strategy is applied here as well.
// =================================================================
export default function SiteSettingsPage() {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🖼️ Media States (Smart Segregation)
  const [existingLogo, setExistingLogo] = useState(""); 
  const [localLogoFile, setLocalLogoFile] = useState(null); 
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const [existingHeroImages, setExistingHeroImages] = useState([]); 
  const [localHeroFiles, setLocalHeroFiles] = useState([]); 
  const [isDraggingHero, setIsDraggingHero] = useState(false);

  // 🎛️ Form Setup
  const { register, control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(settingsZodSchema),
    defaultValues: {
      heroTypewriterLinesObj: [],
      trustBadges: [],
      socialLinks: []
    }
  });

  // Dynamic Array Fields Hooks
  const { fields: typewriterFields, append: addTypewriter, remove: removeTypewriter } = useFieldArray({ control, name: "heroTypewriterLinesObj" });
  const { fields: badgeFields, append: addBadge, remove: removeBadge } = useFieldArray({ control, name: "trustBadges" });
  const { fields: socialFields, append: addSocial, remove: removeSocial } = useFieldArray({ control, name: "socialLinks" });

  // =================================================================
  // 📡 1. INITIAL DATA FETCH
  // =================================================================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log("🚀 [Fetch] Loading Site Settings...");
        const res = await fetch("/api/settings");
        const data = await res.json();
        
        if (data.success && data.settings) {
          const settings = data.settings;
          console.log("📦 [Data Loaded]:", settings);

          // RHF format conversion for string arrays
          const formattedTypewriterLines = settings.heroTypewriterLines 
            ? settings.heroTypewriterLines.map(line => ({ text: line })) 
            : [];

          reset({
            siteName: settings.siteName || "Verdant Finds",
            contactEmail: settings.contactEmail || "hello@verdantfinds.com",
            metaTitle: settings.metaTitle || "",
            metaDescription: settings.metaDescription || "",
            heroDescription: settings.heroDescription || "",
            heroTypewriterLinesObj: formattedTypewriterLines,
            trustBadges: settings.trustBadges || [],
            socialLinks: settings.socialLinks || [],
          });

          setExistingLogo(settings.siteLogo || "");
          setExistingHeroImages(settings.heroImages || []);
        }
      } catch (error) {
        toast.error("Settings load karne mein masla aaya!");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchSettings();
  }, [reset]);

  // 🗑️ MEMORY LEAK CLEANUP
  useEffect(() => {
    return () => {
      if (localLogoFile) URL.revokeObjectURL(localLogoFile.preview);
      localHeroFiles.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [localLogoFile, localHeroFiles]);

  // =================================================================
  // 🖼️ 2. DRAG & DROP HANDLERS (Local Previews)
  // =================================================================
  
  // --- Logo Handler (Single Image) ---
  const processLogoFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return toast.error("Sirf image file allowed hai!");
    if (localLogoFile) URL.revokeObjectURL(localLogoFile.preview); // Purani local uda do
    
    setLocalLogoFile({ file, preview: URL.createObjectURL(file) });
    setExistingLogo(""); // Naya lagaya toh purana hide kar do
  };

  // --- Hero Images Handler (Multiple Images) ---
  const processHeroFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (!validFiles.length) return toast.error("Sirf image files allowed hain!");
    
    const newPreviews = validFiles.map(file => ({
      file, preview: URL.createObjectURL(file)
    }));
    setLocalHeroFiles(prev => [...prev, ...newPreviews]);
  };

  // =================================================================
  // ☁️ 3. CLOUDINARY UPLOADER
  // =================================================================
  const uploadToCloudinary = async (file) => {
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

  // =================================================================
  // 🚀 4. FINAL FORM SUBMIT
  // =================================================================
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving website settings...");

    try {
      // 1. Array of Objects ko wapis Array of Strings mein badalna
      const cleanTypewriterLines = data.heroTypewriterLinesObj.map(obj => obj.text).filter(Boolean);

      // 2. Upload Naya Logo (Agar select kiya hai)
      let finalLogoUrl = existingLogo;
      if (localLogoFile) {
        toast.loading("Uploading Logo...", { id: toastId });
        finalLogoUrl = await uploadToCloudinary(localLogoFile.file);
      }

      // 3. Upload Nayi Hero Images
      let uploadedHeroUrls = [];
      if (localHeroFiles.length > 0) {
        toast.loading("Uploading Hero Images...", { id: toastId });
        uploadedHeroUrls = await Promise.all(localHeroFiles.map(img => uploadToCloudinary(img.file)));
      }
      const finalHeroImages = [...existingHeroImages, ...uploadedHeroUrls];

      // 4. Final Payload Tyar Karna
      const processedData = {
        siteName: data.siteName,
        contactEmail: data.contactEmail,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        heroDescription: data.heroDescription,
        heroTypewriterLines: cleanTypewriterLines, // 🌟 Strings wali array jayegi
        trustBadges: data.trustBadges,
        socialLinks: data.socialLinks,
        siteLogo: finalLogoUrl,
        heroImages: finalHeroImages,
      };

      // 5. Backend ko bhej do!
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Settings Updated Successfully! 🎉", { id: toastId });
        // Clean local state & set as existing
        setExistingLogo(result.settings.siteLogo || "");
        setExistingHeroImages(result.settings.heroImages || []);
        setLocalLogoFile(null);
        setLocalHeroFiles([]);
      } else {
        toast.error(result.error || "Update error", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Save process fail ho gaya.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-sage-light">
        <Loader2 size={40} className="animate-spin mb-4 text-sage" />
        <p className="text-lg font-medium text-sage-dark">Loading Site Settings...</p>
      </div>
    );
  }

  // =================================================================
  // 🎨 UI RENDER
  // =================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 🟢 TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div>
          <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
            <Settings size={28} className="text-sage" /> Website Settings
          </h1>
          <p className="text-sm text-sage-light mt-1">Apni website ka logo, hero section, aur footer customize karein.</p>
        </div>
        
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-sage text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-sage-dark transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: General, Hero, Badges */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 space-y-6">
          
          
          {/* --- GENERAL SETTINGS --- */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
              <LayoutTemplate size={18} /> General & SEO
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Website Name</label>
                <input {...register("siteName")} type="text" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
                {errors.siteName && <p className="text-red-500 text-xs mt-1">{errors.siteName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Contact Email (Footer)</label>
                <input {...register("contactEmail")} type="email" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4 pt-2 border-t border-cream-dark/50 mt-2">
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Homepage Meta Title (SEO)</label>
                <input {...register("metaTitle")} type="text" placeholder="e.g. Best Deals on Gadgets | Verdant Finds" className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage" />
              </div>
              
              {/* 🌟 FIX: Rows ko 1 se badha kar 3 kar diya gaya hai */}
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1.5">Meta Description (SEO)</label>
                <textarea 
                  {...register("metaDescription")} 
                  rows={3} 
                  placeholder="e.g. Discover the finest collection of products curated just for you. Shop now for the best deals!" 
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage resize-none" 
                />
              </div>
            </div>
          </div>

          {/* --- HERO SECTION --- */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
              <Type size={18} /> Hero Section Setup
            </h2>

            <div>
              <label className="block text-sm font-medium text-sage-dark mb-1.5">Hero Description (Subtext)</label>
              <textarea {...register("heroDescription")} rows={2} placeholder="Discover the finest collection of products..." className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-white focus:ring-2 focus:ring-sage resize-none" />
            </div>

            {/* Typewriter Dynamic Array */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-sage-dark">Typewriter Effect Lines</label>
                <button type="button" onClick={() => addTypewriter({ text: "" })} className="text-sage hover:text-sage-dark text-xs font-semibold flex items-center gap-1 bg-sage/10 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Add Line
                </button>
              </div>
              {typewriterFields.length === 0 && <p className="text-xs text-sage-light py-1">Typewriter empty. Add some catchy phrases!</p>}
              <div className="space-y-2">
                {typewriterFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <input {...register(`heroTypewriterLinesObj.${index}.text`)} placeholder="e.g. Trendy Gadgets" className="flex-1 px-3 py-2 rounded-lg border border-cream-dark focus:ring-2 focus:ring-sage text-sm" />
                    <button type="button" onClick={() => removeTypewriter(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-cream-dark" />

            {/* Hero Images Drag & Drop */}
            <div>
              <label className="block text-sm font-medium text-sage-dark mb-2">Hero Slider Images (Desktop/Mobile)</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingHero(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDraggingHero(false); }}
                onDrop={(e) => { e.preventDefault(); setIsDraggingHero(false); processHeroFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all mb-4 ${isDraggingHero ? 'border-sage bg-sage/5' : 'border-cream-dark bg-cream/30'}`}
              >
                <UploadCloud size={24} className={isDraggingHero ? 'text-sage mb-2' : 'text-sage-light mb-2'} />
                <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-3 py-1.5 rounded-lg hover:bg-sage hover:text-white font-semibold shadow-sm">
                  Browse Hero Images <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => processHeroFiles(e.target.files)} />
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingHeroImages.map((url, i) => (
                  <div key={`exist-${i}`} className="relative group rounded-xl overflow-hidden border border-purple-400 aspect-[16/9] bg-cream">
                    <img src={url} alt="Exist" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setExistingHeroImages(existingHeroImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                  </div>
                ))}
                {localHeroFiles.map((fileObj, i) => (
                  <div key={`local-${i}`} className="relative group rounded-xl overflow-hidden border border-sage aspect-[16/9] bg-cream">
                    <img src={fileObj.preview} alt="Local" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 w-full bg-sage text-white text-[9px] text-center py-0.5">New</div>
                    <button type="button" onClick={() => setLocalHeroFiles(localHeroFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- TRUST BADGES --- */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <h2 className="text-lg font-semibold text-sage-dark flex items-center gap-2"><ShieldCheck size={18} /> Trust Badges</h2>
              <button type="button" onClick={() => addBadge({ icon: "", value: "", label: "" })} className="text-sage hover:text-sage-dark text-xs font-semibold flex items-center gap-1 bg-sage/10 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Add Badge
              </button>
            </div>
            {badgeFields.length === 0 && <p className="text-xs text-sage-light py-1">No trust badges added yet.</p>}
            <div className="grid gap-3">
              {badgeFields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row items-start gap-2 bg-cream/30 p-3 rounded-xl border border-cream-dark">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 w-full">
                    <input {...register(`trustBadges.${index}.icon`)} placeholder="Icon URL/Name" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                    <input {...register(`trustBadges.${index}.value`)} placeholder="e.g. 500+" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                    <input {...register(`trustBadges.${index}.label`)} placeholder="e.g. Happy Shoppers" className="col-span-2 sm:col-span-1 w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                  </div>
                  <button type="button" onClick={() => removeBadge(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg w-full sm:w-auto flex justify-center"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Logo & Social Links */}
        {/* ========================================================= */}
        <div className="space-y-6">
          
          {/* --- LOGO UPLOAD --- */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-sage-dark border-b border-cream-dark pb-3 flex items-center gap-2">
              <ImageIcon size={18} /> Website Logo
            </h2>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingLogo(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDraggingLogo(false); processLogoFile(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${isDraggingLogo ? 'border-sage bg-sage/5 scale-[1.02]' : 'border-cream-dark bg-cream/30 hover:bg-cream/50'}`}
            >
              {localLogoFile ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white border border-sage p-2 flex items-center justify-center">
                  <img src={localLogoFile.preview} alt="New Logo" className="max-w-full max-h-full object-contain" />
                  <div className="absolute top-1 right-1 bg-sage text-white text-[9px] px-2 py-0.5 rounded">New</div>
                </div>
              ) : existingLogo ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white border border-cream-dark p-2 flex items-center justify-center">
                  <img src={existingLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <>
                  <UploadCloud size={28} className="text-sage-light mb-2" />
                  <p className="text-xs text-sage-dark font-medium mb-3">Drag & drop logo (PNG/SVG)</p>
                </>
              )}

              <label className="cursor-pointer text-xs bg-white border border-sage text-sage px-4 py-2 rounded-lg hover:bg-sage hover:text-white transition-colors font-semibold shadow-sm mt-4">
                {localLogoFile || existingLogo ? "Change Logo" : "Browse Image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => processLogoFile(e.target.files[0])} />
              </label>

              {(localLogoFile || existingLogo) && (
                <button type="button" onClick={() => { setLocalLogoFile(null); setExistingLogo(""); }} className="text-xs text-red-500 mt-3 font-medium hover:underline">
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          {/* --- SOCIAL LINKS --- */}
          <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <h2 className="text-lg font-semibold text-sage-dark flex items-center gap-2"><LinkIcon size={18} /> Social Links</h2>
              <button type="button" onClick={() => addSocial({ platformName: "", url: "", icon: "" })} className="text-sage hover:text-sage-dark text-xs font-semibold flex items-center gap-1 bg-sage/10 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Add
              </button>
            </div>
            
            {socialFields.length === 0 && <p className="text-xs text-sage-light py-1">No social links. Add your Instagram, TikTok etc.</p>}
            
            <div className="grid gap-4">
              {socialFields.map((field, index) => (
                <div key={field.id} className="relative bg-cream/30 p-3 rounded-xl border border-cream-dark space-y-2">
                  <button type="button" onClick={() => removeSocial(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-md p-1 shadow-sm"><Trash2 size={14} /></button>
                  <div className="pr-8">
                    <input {...register(`socialLinks.${index}.platformName`)} placeholder="Platform (e.g. Instagram)" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm mb-2" />
                    <input {...register(`socialLinks.${index}.url`)} placeholder="Profile URL" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm mb-2" />
                    <input {...register(`socialLinks.${index}.icon`)} placeholder="Icon Name/URL (Optional)" className="w-full px-3 py-2 rounded-lg border border-cream-dark text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}