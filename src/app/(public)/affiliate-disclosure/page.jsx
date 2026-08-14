// File Path: src/app/(public)/affiliate-disclosure/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Affiliate Disclosure",
  description: "Read our affiliate disclosure to understand how we earn commissions through qualifying purchases.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-sage-light mb-6">
          <Link href="/" className="hover:text-sage transition-colors">Home</Link>
          <span>›</span>
          <span className="text-sage-dark">Affiliate Disclosure</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sage-dark mb-4">
            Affiliate Disclosure
          </h1>
          <p className="text-sm text-sage-light mb-8 pb-6 border-b border-cream-dark">
            Last updated: August 2026
          </p>

          <div className="space-y-6 text-sage-dark/80 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">1. Amazon Associates Program</h2>
              <p>
                We are a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated sites.
              </p>
              <p>
                As an Amazon Associate, we earn from qualifying purchases at no additional cost to you. Whenever you click on our product links and make a purchase on Amazon or other partner networks, we may receive a small commission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">2. Why Trust Our Recommendations?</h2>
              <p>
                Our mission is to curate the best mindful recommendations, everyday gadgets, and lifestyle products. Our editorial independence is never compromised by affiliate partnerships. While we may earn commissions, we handpick or filter items based on quality, value, and utility to ensure you get the absolute best guidance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">3. Pricing and Availability</h2>
              <p>
                Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.com at the time of purchase will apply to the purchase of the product.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-sage-dark">4. Questions or Concerns</h2>
              <p>
                If you have any questions regarding our affiliate disclosures or partnerships, please feel free to reach out to us through our contact channels.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}