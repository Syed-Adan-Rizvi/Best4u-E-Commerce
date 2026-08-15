// File Path: src/components/public/Footer.jsx
import Link from "next/link";
import { ShoppingBag, Link as LinkIcon, Mail } from "lucide-react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaTiktok, 
  FaWhatsapp, 
  FaApple, 
  FaGooglePlay,
  FaLinkedin
} from "react-icons/fa";

export const revalidate = 60;


export default function Footer({ settings }) {
  
  const getSocialIcon = (platformName, customIconUrl) => {
    if (customIconUrl && customIconUrl.startsWith("http")) {
      return <img src={customIconUrl} alt={platformName} className="w-4 h-4 object-contain" />;
    }
    
    const name = platformName?.toLowerCase().trim() || "";
    if (name.includes("facebook")) return <FaFacebook size={18} />;
    if (name.includes("instagram")) return <FaInstagram size={18} />;
    if (name.includes("twitter") || name.includes("x")) return <FaTwitter size={18} />;
    if (name.includes("youtube")) return <FaYoutube size={18} />;
    if (name.includes("tiktok")) return <FaTiktok size={18} />;
    if (name.includes("whatsapp")) return <FaWhatsapp size={18} />;
    if (name.includes("apple")) return <FaApple size={18} />;
    if (name.includes("play")) return <FaGooglePlay size={18} />;
    if (name.includes("linkedin")) return <FaLinkedin size={18} />;
    if (name.includes("email") || name.includes("mail")) return <Mail size={18} />;
    
    return <LinkIcon size={18} />; 
  };

  return (
    <footer className="bg-cream border-t border-cream-dark shadow-sm pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* 1. Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {/* 🟢 FIX: Dynamic Logo Support for Footer */}
              {settings?.siteLogo ? (
                <img src={settings.siteLogo} alt={settings?.siteName || "Logo"} className="w-8 h-8 object-contain rounded-xl" />
              ) : (
                <div className="w-8 h-8 bg-sage rounded-xl flex items-center justify-center text-white">
                  <ShoppingBag size={18} />
                </div>
              )}
              <span className="text-xl font-serif font-bold text-sage-dark tracking-tight">
                {settings?.siteName || "Best4u"}<span className="text-sage">.</span>
              </span>
            </Link>
            <p className="text-sm text-sage-light leading-relaxed">
              Curated product recommendations for mindful living. We handpick the best Amazon deals so you don't have to.
            </p>
          </div>

          {/* 2. Explore Links */}
          <div>
            <h3 className="text-xs font-bold text-sage-dark uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-sage-light hover:text-sage transition-colors">Home</Link></li>
              <li><Link href="/shop" className="text-sm text-sage-light hover:text-sage transition-colors">All Products</Link></li>
              <li><Link href="/shop" className="text-sm text-sage-light hover:text-sage transition-colors">Categories</Link></li>
              <li><Link href="/trending" className="text-sm text-sage-light hover:text-sage transition-colors">Trending Deals</Link></li>
            </ul>
          </div>

          {/* 3. Legal Links */}
          <div>
            <h3 className="text-xs font-bold text-sage-dark uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-sm text-sage-light hover:text-sage transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-sm text-sage-light hover:text-sage transition-colors">Terms of Service</Link></li>
              <li><Link href="/affiliate-disclosure" className="text-sm text-sage-light hover:text-sage transition-colors">Affiliate Disclosure</Link></li>
              <li><Link href="/contact" className="text-sm text-sage-light hover:text-sage transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* 4. Social Links */}
          <div>
            <h3 className="text-xs font-bold text-sage-dark uppercase tracking-wider mb-4">Follow Us</h3>
            <p className="text-sm text-sage-light mb-4">Stay updated with our latest deals and finds.</p>
            <div className="flex flex-wrap items-center gap-3">
              
              {settings?.socialLinks && settings.socialLinks.length > 0 && (
                settings.socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sage-dark hover:bg-sage hover:text-white transition-all shadow-sm"
                    aria-label={link.platformName}
                  >
                    {getSocialIcon(link.platformName, link.icon)}
                  </a>
                ))
              )}

              {/* 🟢 FIX: Automatically add Mailto icon if contactEmail is present */}
              {settings?.contactEmail && (
                <a 
                  href={`mailto:${settings.contactEmail}`} 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sage-dark hover:bg-sage hover:text-white transition-all shadow-sm"
                  aria-label="Email Us"
                  title={`Email us at ${settings.contactEmail}`}
                >
                  <Mail size={18} />
                </a>
              )}

              {(!settings?.socialLinks || settings.socialLinks.length === 0) && !settings?.contactEmail && (
                <p className="text-xs text-sage-light">No contact info added yet.</p>
              )}

            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-cream flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sage-light text-center md:text-left">
            © {new Date().getFullYear()} {settings?.siteName || "Best4u"}. As an Amazon Associate we earn from qualifying purchases.
          </p>
          <p className="text-xs text-sage-light font-medium flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> for Smart Shoppers
          </p>
        </div>
      </div>
    </footer>
  );
}