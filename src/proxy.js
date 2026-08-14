// import { withAuth } from "next-auth/middleware";

// // Next.js 16 ab chahta hai ke hum proper function export karein.
// // Hum NextAuth ke withAuth ko ek default function ke taur par export kar rahe hain.
// export default withAuth({
//   pages: {
//     signIn: "/login", // Agar koi bina login ke admin kholay, toh yahan bhej do
//   },
// });

// // Yeh config Next.js ko batati hai ke kin raston (routes) par yeh proxy/security chalani hai
// export const config = {
//   // Hamara admin ka poora panel secure hona chahiye
//   matcher: ["/admin/:path*"], 
// };






















// src/proxy.js

// 1. Zaroori functions import kar rahe hain
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// 2. Next.js 16 ke asool ke mutabiq ab hum isay 'export default' kar rahe hain
export default async function proxy(req) {
  
  // A. Magic Switch Check (Testing Mode)
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  
  if (isTestingMode) {
    // Agar testing mode ON hai, toh bouncer kisi ko nahi rokega
    return NextResponse.next();
  }

  // B. Token Check (Security Mode)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // C. User kis page par jana chahta hai? 
  const url = req.nextUrl.pathname;

  // D. Asal Security Logic (Updated Path)
  // Agar user "/admin" wale kisi page par ja raha hai...
  // AUR uske paas valid token NAHI hai...
  if (url.startsWith("/admin") && !token) {
    
    // Toh bouncer usko utha kar wapis "/login" page par redirect kar dega
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Agar user ke paas token hai, toh pass hone do
  return NextResponse.next();
}

// 3. Matcher Configuration
export const config = {
  matcher: ["/admin/:path*"]
};















// // middleware.js (Project ke root folder mein banani hai)

// // 1. Zaroori functions import kar rahe hain
// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// // 2. Yeh hamara main bouncer function hai jo har request par chalega
// export async function middleware(req) {
  
//   // A. Magic Switch Check (Testing Mode)
//   // Hum check kar rahe hain ke kya .env mein testing mode ON hai?
//   const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  
//   if (isTestingMode) {
//     // Agar testing mode ON hai, toh bouncer kisi ko nahi rokega, sabko andar jane dega.
//     // Yeh Postman testing ke liye best hai.
//     return NextResponse.next();
//   }

//   // B. Token Check (Security Mode)
//   // Agar testing mode OFF hai, toh hum user ke browser (cookies) se token nikalne ki koshish karenge
//   const token = await getToken({ 
//     req, 
//     secret: process.env.NEXTAUTH_SECRET 
//   });

//   // C. User kis page par jana chahta hai? Wo URL hum nikal rahe hain
//   const url = req.nextUrl.pathname;

//   // D. Asal Security Logic
//   // Agar user "/admin" se shuru hone wale kisi page par ja raha hai...
//   // AUR wo page "/admin/login" NAHI hai (kyunke login page par toh bina token ke jana allow hona chahiye)...
//   // AUR uske paas valid token bhi NAHI hai...
//   if (url.startsWith("/admin") && !url.startsWith("/admin/login") && !token) {
    
//     // Toh bouncer usko utha kar wapis "/admin/login" page par redirect kar dega
//     return NextResponse.redirect(new URL("/admin/login", req.url));
//   }

//   // Agar user ke paas token hai, ya wo frontend ki normal website dekh raha hai, toh pass hone do
//   return NextResponse.next();
// }

// // 3. Matcher Configuration
// // Hum bouncer ko bata rahe hain ke usne sirf kahan kahan duty deni hai.
// // Yeh sirf "/admin" aur uske aage wale saare pages ko protect karega, 
// // baki poori website (homepage, product page) ko normal speed par chalne dega.
// export const config = {
//   matcher: ["/admin/:path*"]
// };