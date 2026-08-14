// File Path: next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // 🟢 MAGIC FIX: Vercel (Production) par sab logs automatically remove ho jayenge!
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"], // Sirf error ya warnings ko rehne dega
    } : false,
  },
};

// 🟢 FIX: .mjs file ke liye export default use hota hai
export default nextConfig;








// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
// };

// export default nextConfig;
