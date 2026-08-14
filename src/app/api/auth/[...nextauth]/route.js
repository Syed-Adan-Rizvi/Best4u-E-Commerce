// app/api/auth/[...nextauth]/route.js

// 1. NextAuth aur CredentialsProvider ko import kar rahe hain
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 2. Auth options ka blueprint bana rahe hain ke login system kaise kaam karega
export const authOptions = {
  
  // Providers wo tarike hote hain jinse login hota hai (Google, GitHub, waghera). 
  // Hum apna custom Email/Password use kar rahe hain, isliye CredentialsProvider lagaya hai.
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      
      // Yeh 'authorize' function asal Checkpost hai. 
      // Jab user frontend par login button dabayega, toh uski email aur password 'credentials' object mein yahan aayengi.

      async authorize(credentials) {
        // .trim() lagane se shuru aur aakhir ki extra spaces khud remove ho jayengi
        const userEmail = credentials.email.trim();
        const userPassword = credentials.password.trim();
        
        const adminEmail = process.env.ADMIN_EMAIL.trim();
        const adminPassword = process.env.ADMIN_PASSWORD.trim();

        // 🐛 DEBUGGING CONSOLE
        console.log("==================================");
        console.log("📝 User Input (Trimmed) -> Email:", userEmail, "| Password:", userPassword);
        console.log("📂 ENV Data (Trimmed) -> Email:", adminEmail, "| Password:", adminPassword);
        console.log("==================================");

        // Ab trimmed values ko compare kar rahe hain
        if (userEmail === adminEmail && userPassword === adminPassword) {
          console.log("✅ MATCH SUCCESS! Login Pass.");
          return { id: 1, name: "Admin", email: adminEmail };
        }
        
        console.log("❌ MISMATCH! Login Failed.");
        return null;
      }


      // async authorize(credentials) {
        
      //   // Data flow: Yahan hum apne .env.local vault se asli email/password utha rahe hain
      //   const adminEmail = process.env.ADMIN_EMAIL;
      //   const adminPassword = process.env.ADMIN_PASSWORD;

      //   // Ab hum check kar rahe hain ke jo user ne form mein daala hai, kya wo hamare .env walon se match karta hai?
      //   if (
      //     credentials.email === adminEmail && 
      //     credentials.password === adminPassword
      //   ) {
      //     // Agar dono cheezein 100% match ho gayin, toh hum ek user object wapis bhej denge. 
      //     // Iska matlab hai "Login Successful". NextAuth khud iska ek secure token bana dega.
      //     return { id: 1, name: "Admin", email: adminEmail };
      //   }
        
      //   // Agar password ya email ghalat nikla, toh null return kar denge. 
      //   // Iska matlab hai "Login Failed", aur frontend par error show ho jayega.
      //   return null;
      // }
    })
  ],

  // 3. Pages Configuration
  // NextAuth ka apna ek default, plain sa login page hota hai. 
  // Hum usko bata rahe hain ke wo use mat karna, hamara apna custom beautiful design wala page '/admin/login' par hai.
  pages: {
    signIn: '/login',
  },

  // 4. Session Strategy
  // Hum 'jwt' (JSON Web Token) use kar rahe hain. 
  // Yani jab login hoga, toh user ke browser cookies mein ek encrypted token save ho jayega.
  session: {
    strategy: "jwt",
  },

  // 5. Secret Key
  // Yeh wo chabi hai jo .env file mein rakhi thi, jo hamare jwt token ko lock aur unlock karegi.
  secret: process.env.NEXTAUTH_SECRET,
};

// 6. Next.js 13+ (App Router) ka zaroori format: 
// Is setup ko GET aur POST requests ke liye export karna parta hai taake NextAuth background mein apna kaam kar sake.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };