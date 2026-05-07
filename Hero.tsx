import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings, FONT_STYLES, BUTTON_STYLES, HERO_OVERLAYS } from '@/context/SiteSettingsContext';

const DEFAULT_IMAGES = [
  `${import.meta.env.BASE_URL}images/hero-jewellery.png`,
  `${import.meta.env.BASE_URL}images/hero-stationery.png`,
  `${import.meta.env.BASE_URL}images/hero-custom.png`,
];

export default function Hero() {
  const { settings } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = settings.heroSlides;

  const font = FONT_STYLES[settings.fontStyle ?? 'luxury'];
  const btn  = BUTTON_STYLES[settings.buttonStyle ?? 'sharp'];
  const overlay = HERO_OVERLAYS[settings.heroOverlay ?? 'medium'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentImage = slides[currentSlide]?.imageUrl || DEFAULT_IMAGES[currentSlide % DEFAULT_IMAGES.length];

  return (
    <>
      {/* Announcement Bar */}
      <AnimatePresence>
        {settings.announcementEnabled && settings.announcementText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary text-primary-foreground text-center text-xs py-2 px-4 font-medium tracking-wide"
          >
            {settings.announcementText}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative w-full h-[85vh] md:h-screen min-h-[600px] overflow-hidden bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${overlay.className} z-10`} />

            {/* Slide image */}
            <img
              src={currentImage}
              alt={slides[currentSlide]?.title}
              className="w-full h-full object-cover"
            />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <motion.p
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`text-accent ${font.subClass} mb-4`}
              >
                {slides[currentSlide]?.subtitle}
              </motion.p>

              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className={`text-4xl md:text-6xl lg:text-7xl text-white max-w-4xl leading-tight mb-8 ${font.headingClass}`}
              >
                {slides[currentSlide]?.title}
              </motion.h1>

              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <button
                  className={`px-8 py-4 bg-accent text-accent-foreground font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-primary transition-all duration-300 shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:shadow-[0_0_32px_rgba(255,255,255,0.4)] hover:-translate-y-1 ${btn.className}`}
                  onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {settings.heroButtonText}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-accent w-8' : 'bg-white/50 w-2.5 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
