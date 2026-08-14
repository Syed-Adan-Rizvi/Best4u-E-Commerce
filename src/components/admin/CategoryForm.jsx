"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 🛡️ FRONTEND ZOD SCHEMA (Backend wala exact schema)
const categorySchema = z.object({
  name: z.string().min(3, "Naam kam az kam 3 characters ka hona chahiye").max(50, "Naam bohot lamba hai"),
  slug: z.string().optional(),
  metaTitle: z.string().max(60, "SEO Title 60 characters se lamba na ho").optional(),
  metaDescription: z.string().max(160, "SEO Description 160 characters se lambi na ho").optional(),
});

export default function CategoryForm({ initialData, onSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);

  // 🎛️ React Hook Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
    },
  });

  // 🔗 Auto Slug Generator (Jab user naam type kare, toh slug khud ban jaye)
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue && !initialData?.slug) {
      const generatedSlug = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue("slug", generatedSlug);
    }
  }, [nameValue, initialData, setValue]);

  // 🚀 Form Submit Handler
  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading(initialData ? "Updating category..." : "Creating category...");

    try {
      const url = initialData ? `/api/categories/${initialData._id}` : "/api/categories";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Category ${initialData ? "updated" : "created"} successfully!`, { id: toastId });
        onSuccess(); // Modal band karne aur list refresh karne ke liye
      } else {
        toast.error(result.error || "Kuch ghalat ho gaya", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-sage-dark mb-1">Category Name *</label>
        <input 
          {...register("name")}
          type="text"
          className="w-full px-4 py-2 rounded-xl border border-cream-dark bg-cream focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sage-dark placeholder-sage-light/50"
          placeholder="e.g. Smart Home Devices"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Slug Field */}
      <div>
        <label className="block text-sm font-medium text-sage-dark mb-1">URL Slug (Auto Generated)</label>
        <input 
          {...register("slug")}
          type="text"
          className="w-full px-4 py-2 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark"
          placeholder="e.g. smart-home-devices"
        />
      </div>

      {/* SEO Meta Title */}
      <div>
        <label className="block text-sm font-medium text-sage-dark mb-1">SEO Title (Optional)</label>
        <input 
          {...register("metaTitle")}
          type="text"
          className="w-full px-4 py-2 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark"
        />
        {errors.metaTitle && <p className="text-red-500 text-xs mt-1">{errors.metaTitle.message}</p>}
      </div>

      {/* SEO Meta Description */}
      <div>
        <label className="block text-sm font-medium text-sage-dark mb-1">SEO Description (Optional)</label>
        <textarea 
          {...register("metaDescription")}
          rows={3}
          className="w-full px-4 py-2 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-sage text-sage-dark resize-none"
        />
        {errors.metaDescription && <p className="text-red-500 text-xs mt-1">{errors.metaDescription.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-dark">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-sage-dark hover:bg-cream rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark transition-colors disabled:opacity-70"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {initialData ? "Update Category" : "Save Category"}
        </button>
      </div>
    </form>
  );
}