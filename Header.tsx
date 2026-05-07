import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toggleCart, itemCount } = useCart();
  const { settings } = useSiteSettings();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: '#featured' },
    { name: 'Categories', href: '#categories' },
    { name: 'Contact', href: '#footer' },
    { name: 'Admin', href: '/admin' },
  ];

  const Logo = () => (
    <a href="#" className="inline-block">
      {settings.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.storeName}
          className="h-10 md:h-12 w-auto object-contain"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
        />
      ) : (
        <span className="text-2xl font-bold tracking-widest text-foreground">{settings.storeName}</span>
      )}
    </a>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Mobile Menu Button */}
          <div className="flex-1 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          {/* Logo — center */}
          <div className="flex-1 text-center md:flex-none">
            <Logo />
          </div>

          {/* Right Actions */}
          <div className="flex-1 flex justify-end items-center gap-1 sm:gap-3">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    placeholder="Search..."
                    className="absolute right-10 py-1.5 px-3 bg-background border border-border rounded-full text-sm outline-none focus:border-accent hidden sm:block"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                )}
              </AnimatePresence>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-foreground hover:text-accent transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            </div>

            <a
              href="/login"
              className="p-2 text-foreground hover:text-accent transition-colors relative"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {customer && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
              )}
            </a>

            <button onClick={toggleCart} className="p-2 text-foreground hover:text-accent transition-colors relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border border-background">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-background flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-10">
              <Logo />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground hover:text-primary">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-semibold text-foreground hover:text-primary transition-colors py-3 border-b border-border/40"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-display font-semibold text-foreground hover:text-primary transition-colors py-3 border-b border-border/40 flex items-center gap-3"
              >
                {customer ? `${customer.name.split(' ')[0]} ✓` : 'Login / Register'}
              </a>
            </div>

            <div className="mt-auto text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-widest">{settings.storeTagline}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
