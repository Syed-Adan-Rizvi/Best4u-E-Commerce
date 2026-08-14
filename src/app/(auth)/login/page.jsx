"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

export default function AdminLogin() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    // Main Container - Gradient khatam kar diya, ab solid cream color hai
    <div className="min-h-screen bg-cream flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      
      {/* Background Shapes - Simple solid blobs with blur (no gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[45vw] h-[60vw] md:h-[45vw] bg-sage-light opacity-30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] md:w-[40vw] h-[50vw] md:h-[40vw] bg-sage-light opacity-20 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white/80 backdrop-blur-md border border-cream-dark p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-serif text-sage-dark mb-1 md:mb-2 tracking-tight">Best4u</h1>
          <p className="text-xs sm:text-sm text-gray-500">Sign in to your admin workspace</p>
        </div>

        {/* Error Message Box */}
        {error && (
          <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-red-50 text-red-600 text-xs sm:text-sm rounded-lg sm:rounded-xl text-center border border-red-100 flex items-center justify-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-sage-dark mb-1.5 sm:mb-2">Email Address</label>
            <div className="relative">
              {/* Email Icon */}
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-sage-light">
                <FiMail className="text-lg sm:text-xl" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white border border-cream-dark focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                placeholder="admin@best4u.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-sage-dark mb-1.5 sm:mb-2">Password</label>
            <div className="relative">
              {/* Lock Icon */}
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-sage-light">
                <FiLock className="text-lg sm:text-xl" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white border border-cream-dark focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              {/* Eye Icon Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sage-dark transition-colors p-1"
              >
                {showPassword ? <FiEyeOff className="text-lg sm:text-xl" /> : <FiEye className="text-lg sm:text-xl" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            // disabled classes add ki hain taake button disable hone par visually change ho
            className="w-full py-3 sm:py-3.5 mt-2 text-sm sm:text-base bg-sage text-white rounded-lg sm:rounded-xl font-medium hover:bg-sage-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage flex justify-center items-center disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              // Spinner aur text dono sath show honge
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}