import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer id="footer" className="bg-[#1A1A1A] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Col */}
          <div className="lg:col-span-1">
            <a href="#" className="block mb-6">
              {settings.logoUrl
              ? <img src={settings.logoUrl} alt={settings.storeName} className="h-14 w-auto object-contain brightness-0 invert" />
              : <span className="text-2xl font-bold tracking-widest text-white">{settings.storeName}</span>
            }
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6 pr-4">
              {settings.footerDescription}
            </p>
            <div className="flex gap-4">
              <a href={settings.instagram} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={settings.facebook} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-white/90">Quick Links</h4>
            <ul className="space-y-4">
              <li><a href="#featured" className="text-sm text-white/60 hover:text-accent transition-colors">Shop All</a></li>
              <li><a href="#categories" className="text-sm text-white/60 hover:text-accent transition-colors">Categories</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-accent transition-colors">Corporate Gifting</a></li>
              <li><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-accent transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-white/90">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-white/60 hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-accent transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-accent transition-colors">Returns & Exchanges</a></li>
              <li><a href={`mailto:${settings.email}`} className="text-sm text-white/60 hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-white/90">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-accent transition-colors">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors">{settings.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <span>Designed with elegance.</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      {settings.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp}?text=Hi! I'm interested in your products.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      )}
    </footer>
  );
}
