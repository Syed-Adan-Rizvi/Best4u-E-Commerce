// File Path: src/app/(public)/products/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaStar, FaStarHalfAlt, FaRegStar, FaLeaf, FaCheckCircle } from "react-icons/fa"; // 🌟 Icons Updated
import { ArrowRight, Sparkles } from "lucide-react"; // 🌟 Sparkles Added
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; 
import ProductCard from "@/components/public/ProductCard";
import ProductDetailClient from "./ProductDetailClient"; 

export const revalidate = 60;

// 🟢 1. DYNAMIC SEO (Server Side)
export async function generateMetadata({ params }) {
  const resolvedParams = await params; 

  await connectDB();
  const product = await Product.findOne({ slug: resolvedParams.slug }).lean();

  if (!product) return { title: "Product Not Found" };

  // 🟢 JSON-LD STRUCTURED DATA (Google ke liye)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description.substring(0, 150),
    image: product.images?.[0],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD', // Aap apni site ke hisab se badal sakte hain
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 0,
      reviewCount: product.reviewCount || 0,
    },
  };

  return {
    title: product.metaTitle || `${product.title} - Best4u`,
    description: product.metaDescription || product.description.substring(0, 150),
    openGraph: {
      images: [product.images?.[0] || ""],
    },
    // 🟢 Yeh script tag Google ko batayegi ke yeh Product hai
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}

// 🟢 2. MAIN SERVER COMPONENT
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;

  await connectDB();
  
  const product = await Product.findOne({ slug: resolvedParams.slug, isActive: true })
    .populate("category", "name slug")
    .lean();

  if (!product) {
    notFound(); 
  }

  const relatedProducts = await Product.find({ 
    category: product.category._id, 
    _id: { $ne: product._id }, 
    isActive: true 
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const serializedProduct = {
    ...product,
    _id: product._id.toString(),
    category: product.category ? { ...product.category, _id: product.category._id.toString() } : null,
    features: product.features?.map(feat => ({ ...feat, _id: feat._id ? feat._id.toString() : undefined })) || [],
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };

  const serializedRelated = relatedProducts.map(p => ({
    ...p,
    _id: p._id.toString(),
    category: { _id: product.category._id.toString(), name: product.category.name }, 
    features: p.features?.map(feat => ({ ...feat, _id: feat._id ? feat._id.toString() : undefined })) || [],
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`f-${i}`} className="text-[#FF9900]" size={16} />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="h" className="text-[#FF9900]" size={16} />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`e-${i}`} className="text-[#FF9900] opacity-40" size={16} />);
    return stars;
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      
      {/* BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs font-medium text-sage-light">
          <Link href="/" className="hover:text-sage transition-colors">Home</Link>
          <span>›</span>
          <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-sage transition-colors">{product.category?.name || "Products"}</Link>
          <span>›</span>
          <span className="text-sage-dark truncate max-w-[200px] sm:max-w-md">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-20">
          
          <div className="w-full lg:w-1/2">
             <ProductDetailClient product={serializedProduct} />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {product.isFeatured && (
              <div className="inline-flex px-3 py-1 bg-[#FFF0E5] text-[#FF7A00] text-xs font-extrabold tracking-wide uppercase rounded-md mb-4 self-start">
                Top Pick
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-sage-dark leading-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <div className="text-sm font-bold text-sage-dark flex items-center gap-1.5">
                {product.rating?.toFixed(1) || "0.0"} 
                <span className="text-sage-light font-medium underline decoration-sage-light/30 underline-offset-4">
                  ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"} Reviews)
                </span>
              </div>
            </div>

            <p className="text-sage-dark/80 text-base sm:text-lg leading-relaxed mb-8">
              {product.description.substring(0, 250)}...
            </p>

            <div className="w-full sm:w-64 mb-6">
              <ProductDetailClient type="actionButton" product={serializedProduct} />
            </div>

            {/* 🟢 NEW TRUST BADGES */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-cream-dark pt-6 mt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-sage-dark bg-sage/5 px-3 py-1.5 rounded-lg">
                <FaCheckCircle className="text-sage" size={16}/> Handpicked Value
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-sage-dark bg-sage/5 px-3 py-1.5 rounded-lg">
                <FaLeaf className="text-sage" size={16}/> Mindful Choice
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-sage-dark bg-sage/5 px-3 py-1.5 rounded-lg">
                <Sparkles className="text-sage" size={16}/> Highly Rated
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 border-t border-cream-dark pt-16">
          
          <div>
            <h2 className="text-2xl font-serif font-bold text-sage-dark mb-6">Product Description</h2>
            <div className="prose prose-sage max-w-none text-sage-dark/80 leading-relaxed whitespace-pre-line">
               {product.description}
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-sage-dark mb-6">Specifications</h2>
              <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {product.features.map((feature, index) => (
                      <tr key={index} className={`border-b border-cream-dark last:border-b-0 ${index % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-white'}`}>
                        <th className="px-6 py-4 font-bold text-sage-dark w-1/3 align-top">{feature.title}</th>
                        <td className="px-6 py-4 text-sage-dark/80">{feature.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 🟢 VIDEO SECTION IS NOW HANDLED BY CLIENT COMPONENT */}
        {product.videoUrl && (
          <div className="mb-20 border-t border-cream-dark pt-16">
             <h2 className="text-2xl font-serif font-bold text-sage-dark mb-8 text-center">See it in Action</h2>
             <ProductDetailClient type="video" product={serializedProduct} />
          </div>
        )}

        {serializedRelated.length > 0 && (
          <div className="border-t border-cream-dark pt-16">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">Related Products</h2>
              <Link href={`/shop?category=${product.category?.slug}`} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group">
                View Category <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serializedRelated.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
























// // File Path: src/app/(public)/products/[slug]/page.jsx
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { FaStar, FaStarHalfAlt, FaRegStar, FaShippingFast, FaShieldAlt } from "react-icons/fa";
// import { ArrowRight } from "lucide-react";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// // Category model zaroori hai populate ke liye
// import Category from "@/models/Category"; 
// import ProductCard from "@/components/public/ProductCard";
// import ProductDetailClient from "./ProductDetailClient"; 

// // 🟢 1. DYNAMIC SEO (Server Side)
// export async function generateMetadata({ params }) {
//   // 🌟 BUG FIX: params ko await karna zaroori hai
//   const resolvedParams = await params; 

//   await connectDB();
//   const product = await Product.findOne({ slug: resolvedParams.slug }).lean();

//   if (!product) return { title: "Product Not Found" };

//   return {
//     title: product.metaTitle || `${product.title} - Best4u`,
//     description: product.metaDescription || product.description.substring(0, 150),
//     openGraph: {
//       images: [product.images?.[0] || ""],
//     },
//   };
// }

// // 🟢 2. MAIN SERVER COMPONENT
// export default async function ProductDetailPage({ params }) {
//   // 🌟 BUG FIX: params ko await karna zaroori hai
//   const resolvedParams = await params;

//   await connectDB();
  
//   // 1️⃣ Fetch Product with Category Name
//   const product = await Product.findOne({ slug: resolvedParams.slug, isActive: true })
//     .populate("category", "name slug")
//     .lean();

//   if (!product) {
//     notFound(); // Agar product na milay toh Next.js khud 404 page dikha dega
//   }

//   // 2️⃣ Fetch Related Products (Same category, par yeh wala product nahi)
//   const relatedProducts = await Product.find({ 
//     category: product.category._id, 
//     _id: { $ne: product._id }, // Current product ko exclude karo
//     isActive: true 
//   })
//     .sort({ createdAt: -1 })
//     .limit(4)
//     .lean();

//   // Serialization for Client Components (MongoDB ObjectIDs ko string mein badalna)
//   const serializedProduct = {
//     ...product,
//     _id: product._id.toString(),
//     category: product.category ? { ...product.category, _id: product.category._id.toString() } : null,
//     features: product.features?.map(feat => ({ ...feat, _id: feat._id ? feat._id.toString() : undefined })) || [],
//     createdAt: product.createdAt?.toISOString(),
//     updatedAt: product.updatedAt?.toISOString(),
//   };

//   const serializedRelated = relatedProducts.map(p => ({
//     ...p,
//     _id: p._id.toString(),
//     category: { _id: product.category._id.toString(), name: product.category.name }, 
//     features: p.features?.map(feat => ({ ...feat, _id: feat._id ? feat._id.toString() : undefined })) || [],
//     createdAt: p.createdAt?.toISOString(),
//     updatedAt: p.updatedAt?.toISOString(),
//   }));

//   // 🌟 Dynamic Star Rating Logic (Read-only for server component)
//   const renderStars = (rating = 0) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//     for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`f-${i}`} className="text-[#FF9900]" size={16} />);
//     if (hasHalfStar) stars.push(<FaStarHalfAlt key="h" className="text-[#FF9900]" size={16} />);
//     for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`e-${i}`} className="text-[#FF9900] opacity-40" size={16} />);
//     return stars;
//   };

//   return (
//     <div className="bg-[#FAF8F5] min-h-screen pb-20">
      
//       {/* 🟢 BREADCRUMBS */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="flex items-center gap-2 text-xs font-medium text-sage-light">
//           <Link href="/" className="hover:text-sage transition-colors">Home</Link>
//           <span>›</span>
//           <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-sage transition-colors">{product.category?.name || "Products"}</Link>
//           <span>›</span>
//           <span className="text-sage-dark truncate max-w-[200px] sm:max-w-md">{product.title}</span>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* 🟢 TOP SECTION: Image Gallery & Product Info */}
//         <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-20">
          
//           {/* Left: Image Gallery (Client Component for interaction) */}
//           <div className="w-full lg:w-1/2">
//              <ProductDetailClient product={serializedProduct} />
//           </div>

//           {/* Right: Product Details & Action */}
//           <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
//             {/* Top Pick / Featured Badge */}
//             {product.isFeatured && (
//               <div className="inline-flex px-3 py-1 bg-[#FFF0E5] text-[#FF7A00] text-xs font-extrabold tracking-wide uppercase rounded-md mb-4 self-start">
//                 Top Pick
//               </div>
//             )}

//             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-sage-dark leading-tight mb-4">
//               {product.title}
//             </h1>

//             {/* Rating */}
//             <div className="flex items-center gap-3 mb-6">
//               <div className="flex items-center gap-1">
//                 {renderStars(product.rating)}
//               </div>
//               <div className="text-sm font-bold text-sage-dark flex items-center gap-1.5">
//                 {product.rating?.toFixed(1) || "0.0"} 
//                 <span className="text-sage-light font-medium underline decoration-sage-light/30 underline-offset-4">
//                   ({product.reviewCount ? product.reviewCount.toLocaleString() : "0"} Reviews)
//                 </span>
//               </div>
//             </div>

//             {/* Short Description */}
//             <p className="text-sage-dark/80 text-base sm:text-lg leading-relaxed mb-8">
//               {product.description.substring(0, 250)}...
//             </p>

//             {/* 🟢 ACTION BUTTON (Click Tracking Client Component) */}
//             <div className="w-full sm:w-64 mb-6">
//               <ProductDetailClient type="actionButton" product={serializedProduct} />
//             </div>

//             {/* Trust Badges */}
//             <div className="flex items-center gap-6 border-t border-cream-dark pt-6 mt-2">
//               <div className="flex items-center gap-2 text-sm font-bold text-sage-dark">
//                 <FaShippingFast className="text-sage" size={18}/> Free Shipping
//               </div>
//               <div className="flex items-center gap-2 text-sm font-bold text-sage-dark">
//                 <FaShieldAlt className="text-sage" size={18}/> 2 Year Warranty
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* 🟢 MIDDLE SECTION: Description & Specifications */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 border-t border-cream-dark pt-16">
          
//           {/* Detailed Description */}
//           <div>
//             <h2 className="text-2xl font-serif font-bold text-sage-dark mb-6">Product Description</h2>
//             <div className="prose prose-sage max-w-none text-sage-dark/80 leading-relaxed whitespace-pre-line">
//                {product.description}
//             </div>
//           </div>

//           {/* Specifications Table */}
//           {product.features && product.features.length > 0 && (
//             <div>
//               <h2 className="text-2xl font-serif font-bold text-sage-dark mb-6">Specifications</h2>
//               <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden shadow-sm">
//                 <table className="w-full text-sm text-left">
//                   <tbody>
//                     {product.features.map((feature, index) => (
//                       <tr key={index} className={`border-b border-cream-dark last:border-b-0 ${index % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-white'}`}>
//                         <th className="px-6 py-4 font-bold text-sage-dark w-1/3 align-top">{feature.title}</th>
//                         <td className="px-6 py-4 text-sage-dark/80">{feature.value}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 🟢 VIDEO SECTION (If available) */}
//         {product.videoUrl && (
//           <div className="mb-20 border-t border-cream-dark pt-16">
//              <h2 className="text-2xl font-serif font-bold text-sage-dark mb-8 text-center">See it in Action</h2>
//              <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-cream-dark aspect-video relative bg-sage-dark">
//                <iframe 
//                   src={product.videoUrl.replace("watch?v=", "embed/")} 
//                   title="Product Video"
//                   className="w-full h-full"
//                   frameBorder="0"
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                 ></iframe>
//              </div>
//           </div>
//         )}

//         {/* 🟢 RELATED PRODUCTS SECTION */}
//         {serializedRelated.length > 0 && (
//           <div className="border-t border-cream-dark pt-16">
//             <div className="flex items-end justify-between mb-8">
//               <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sage-dark">Related Products</h2>
//               <Link href={`/shop?category=${product.category?.slug}`} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-sage hover:text-sage-dark transition-colors group">
//                 View Category <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {serializedRelated.map((relProduct) => (
//                 <ProductCard key={relProduct._id} product={relProduct} />
//               ))}
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }