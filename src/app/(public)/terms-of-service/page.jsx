// File Path: src/app/(public)/terms-of-service/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Read the rules, guidelines, and terms governing the use of our website.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-6">
          <Link href="/" className="hover:text-sage transition-colors">Home</Link>
          <span>›</span>
          <span className="text-sage-dark">Terms of Service</span>
        </div>

        <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-sage-light mb-8 pb-6 border-b border-cream-dark">
            Last updated: August 2026
          </p>

          <div className="space-y-6 text-sage-dark/80 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please refrain from using our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. You may not modify, copy, distribute, or reverse engineer any content without written permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">3. Affiliate Disclaimer & Limitation of Liability</h2>
              <p>
                We act as an affiliate publisher recommending products available on external stores like Amazon. We do not process direct payments, handle shipping, or manage product warranties. All transactions take place on the respective merchant platforms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">4. Modifications</h2>
              <p>
                We reserve the right to revise these terms of service at any time without notice. By continuing to use this website, you agree to be bound by the current version of these terms.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}