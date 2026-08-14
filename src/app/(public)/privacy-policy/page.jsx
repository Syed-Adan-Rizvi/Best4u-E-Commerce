// File Path: src/app/(public)/privacy-policy/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-6">
          <Link href="/" className="hover:text-sage transition-colors">Home</Link>
          <span>›</span>
          <span className="text-sage-dark">Privacy Policy</span>
        </div>

        <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-sage-light mb-8 pb-6 border-b border-cream-dark">
            Last updated: August 2026
          </p>

          <div className="space-y-6 text-sage-dark/80 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">1. Information We Collect</h2>
              <p>
                We collect minimal personal data necessary to improve your browsing experience. This may include email addresses when you subscribe to our newsletter or alerts, and standard log data (IP address, browser type, pages visited) via analytics tools.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">2. Cookies and Tracking</h2>
              <p>
                Our website uses cookies to enhance user experience, track visitor preferences, and analyze site traffic. Third-party vendors, including Amazon, use cookies to serve ads based on a user's prior visits to our website.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">3. How We Use Your Information</h2>
              <p>
                The information we collect is used to send curated product deals, newsletters (if subscribed), optimize website layout, and comply with legal or affiliate obligations. We never sell or rent your personal information to third parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">4. Third-Party Links</h2>
              <p>
                Our site contains links to external e-commerce platforms like Amazon. Once you click these links and leave our platform, we are not responsible for the privacy practices or content of those external websites.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}