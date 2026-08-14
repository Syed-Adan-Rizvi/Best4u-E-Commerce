// File Path: src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import connectDB from "@/lib/db";
import SiteSettings from "@/models/SiteSettings"; // Schema import


export const revalidate = 60;


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



// 🟢 GLOBAL DYNAMIC SEO (Updated with your Schema Fields)
export async function generateMetadata() {
  try {
    await connectDB();
    // findOne ka matlab hai jo bhi ek document mile usay utha lo
    const settings = await SiteSettings.findOne({}).lean();

    // Mapping fields with your Schema
    const siteName = settings?.siteName || "Verdant Finds"; // Schema ka default name
    const siteTitle = settings?.metaTitle || siteName;
    const siteDescription = settings?.metaDescription || "Explore our curated mindful collections.";

    return {
      title: {
        default: siteTitle, 
        template: `%s | ${siteName}`,
      },
      description: siteDescription,
      openGraph: {
        title: siteTitle,
        description: siteDescription,
        siteName: siteName,
        // Logo field from your schema
        images: settings?.siteLogo ? [settings.siteLogo] : [],
      }
    };
  } catch (error) {
    console.error("Layout SEO fetch error:", error);
    return {
      title: "Verdant Finds",
      description: "Welcome to our store",
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}








// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Best4u",
//   description: "E-commerce website",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">{children}</body>
//     </html>
//   );
// }
