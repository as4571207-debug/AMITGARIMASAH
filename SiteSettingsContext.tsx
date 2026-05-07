import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ThemeColor = 'purple' | 'rose' | 'navy' | 'emerald' | 'black' | 'crimson' | 'orange' | 'teal' | 'pink' | 'brown';
export type BgMode = 'light' | 'cream' | 'white' | 'dark';
export type FontStyle = 'luxury' | 'modern' | 'clean';
export type ButtonStyle = 'sharp' | 'rounded' | 'pill';
export type HeroOverlay = 'light' | 'medium' | 'dark';

export interface HeroSlide {
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  logoUrl: string;
  themeColor: ThemeColor;
  bgMode: BgMode;
  fontStyle: FontStyle;
  buttonStyle: ButtonStyle;
  heroOverlay: HeroOverlay;
  announcementEnabled: boolean;
  announcementText: string;
  heroSlides: HeroSlide[];
  heroButtonText: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  footerDescription: string;
}

export const THEMES: Record<ThemeColor, { label: string; primary: string; accent: string; bg: string; fg: string; muted: string; mutedFg: string; swatch: string }> = {
  purple:  { label: 'Royal Purple', primary: '270 70% 42%', accent: '43 65% 52%', bg: '270 30% 97%', fg: '270 40% 12%', muted: '270 20% 94%', mutedFg: '270 20% 50%', swatch: '#6B21A8' },
  rose:    { label: 'Rose Gold',    primary: '340 60% 48%', accent: '30 70% 60%', bg: '340 25% 97%', fg: '340 30% 12%', muted: '340 15% 93%', mutedFg: '340 15% 50%', swatch: '#BE185D' },
  navy:    { label: 'Deep Navy',    primary: '215 65% 32%', accent: '43 65% 52%', bg: '215 25% 96%', fg: '215 40% 10%', muted: '215 20% 92%', mutedFg: '215 15% 48%', swatch: '#1E3A5F' },
  emerald: { label: 'Emerald',      primary: '160 55% 32%', accent: '43 65% 52%', bg: '160 20% 96%', fg: '160 35% 10%', muted: '160 15% 92%', mutedFg: '160 15% 48%', swatch: '#065F46' },
  black:   { label: 'Midnight',     primary: '0 0% 12%',   accent: '43 65% 52%', bg: '0 0% 97%',   fg: '0 0% 8%',   muted: '0 0% 94%',   mutedFg: '0 0% 45%',   swatch: '#1A1A1A' },
  crimson: { label: 'Deep Red',     primary: '0 65% 42%',  accent: '43 65% 52%', bg: '0 25% 97%',  fg: '0 35% 10%', muted: '0 15% 93%',  mutedFg: '0 10% 48%',  swatch: '#9B1C1C' },
  orange:  { label: 'Sunset',       primary: '25 80% 44%', accent: '45 80% 55%', bg: '25 30% 97%', fg: '25 40% 10%', muted: '25 20% 93%', mutedFg: '25 15% 48%', swatch: '#C2410C' },
  teal:    { label: 'Ocean Teal',   primary: '185 60% 35%',accent: '43 65% 52%', bg: '185 25% 96%', fg: '185 40% 10%',muted: '185 15% 92%',mutedFg: '185 15% 48%',swatch: '#0E7490' },
  pink:    { label: 'Blossom',      primary: '320 55% 48%',accent: '30 70% 60%', bg: '320 25% 97%', fg: '320 30% 12%',muted: '320 15% 93%',mutedFg: '320 10% 50%',swatch: '#9D174D' },
  brown:   { label: 'Coffee',       primary: '25 40% 35%', accent: '43 65% 52%', bg: '25 20% 96%', fg: '25 35% 10%', muted: '25 15% 92%', mutedFg: '25 10% 48%', swatch: '#78350F' },
};

export const BG_MODES: Record<BgMode, { label: string; swatch: string }> = {
  light: { label: 'Light',  swatch: '#F5F0FF' },
  cream: { label: 'Cream',  swatch: '#F7F0E6' },
  white: { label: 'White',  swatch: '#FFFFFF' },
  dark:  { label: 'Dark',   swatch: '#141414' },
};

export const FONT_STYLES: Record<FontStyle, { label: string; desc: string; headingClass: string; subClass: string }> = {
  luxury:  { label: 'Luxury',   desc: 'Playfair serif — elegant & classic', headingClass: 'font-display font-bold', subClass: 'font-sans tracking-[0.2em] uppercase text-sm' },
  modern:  { label: 'Modern',   desc: 'Bold sans-serif — clean & strong',    headingClass: 'font-sans font-black tracking-tight', subClass: 'font-sans tracking-[0.15em] uppercase text-sm font-medium' },
  clean:   { label: 'Clean',    desc: 'Light sans-serif — minimal & airy',   headingClass: 'font-sans font-light tracking-wide', subClass: 'font-sans tracking-[0.25em] uppercase text-xs font-normal' },
};

export const BUTTON_STYLES: Record<ButtonStyle, { label: string; desc: string; className: string }> = {
  sharp:   { label: 'Sharp',   desc: 'Rectangle — bold & luxury',  className: 'rounded-none' },
  rounded: { label: 'Rounded', desc: 'Soft corners — modern feel',  className: 'rounded-xl' },
  pill:    { label: 'Pill',    desc: 'Fully rounded — friendly',    className: 'rounded-full' },
};

export const HERO_OVERLAYS: Record<HeroOverlay, { label: string; className: string }> = {
  light:  { label: 'Light',  className: 'from-black/50 via-primary/20 to-black/10' },
  medium: { label: 'Medium', className: 'from-black/70 via-primary/35 to-black/25' },
  dark:   { label: 'Dark',   className: 'from-black/90 via-primary/50 to-black/40' },
};

export function applyTheme(color: ThemeColor, bgMode: BgMode = 'light') {
  const t = THEMES[color];
  const root = document.documentElement;
  root.style.setProperty('--primary', t.primary);
  root.style.setProperty('--accent', t.accent);

  switch (bgMode) {
    case 'light':
      root.style.setProperty('--background', t.bg);
      root.style.setProperty('--foreground', t.fg);
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', t.fg);
      root.style.setProperty('--muted', t.muted);
      root.style.setProperty('--muted-foreground', t.mutedFg);
      break;
    case 'cream':
      root.style.setProperty('--background', '30 25% 95%');
      root.style.setProperty('--foreground', '25 35% 12%');
      root.style.setProperty('--card', '30 20% 99%');
      root.style.setProperty('--card-foreground', '25 35% 12%');
      root.style.setProperty('--muted', '30 15% 91%');
      root.style.setProperty('--muted-foreground', '30 20% 48%');
      break;
    case 'white':
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '0 0% 8%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '0 0% 8%');
      root.style.setProperty('--muted', '0 0% 95%');
      root.style.setProperty('--muted-foreground', '0 0% 45%');
      break;
    case 'dark':
      root.style.setProperty('--background', '0 0% 8%');
      root.style.setProperty('--foreground', '0 0% 92%');
      root.style.setProperty('--card', '0 0% 13%');
      root.style.setProperty('--card-foreground', '0 0% 92%');
      root.style.setProperty('--muted', '0 0% 18%');
      root.style.setProperty('--muted-foreground', '0 0% 60%');
      break;
  }
}

const DEFAULTS: SiteSettings = {
  storeName: 'AGS',
  storeTagline: 'Luxury Gifting, Redefined.',
  logoUrl: '/images/ags-logo.svg',
  themeColor: 'purple',
  bgMode: 'light',
  fontStyle: 'luxury',
  buttonStyle: 'sharp',
  heroOverlay: 'medium',
  announcementEnabled: true,
  announcementText: '✨ Free delivery on orders above ₹999 | Cash on Delivery available',
  heroSlides: [
    { title: 'Luxury Jewellery Hampers', subtitle: 'Elegance in every piece' },
    { title: 'Stationery & Journaling Sets', subtitle: 'Crafted for the creative soul' },
    { title: 'Custom Gift Hampers', subtitle: 'Made with love, just for you' },
  ],
  heroButtonText: 'Shop Now',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@ags.store',
  address: '123 Luxury Avenue, Fashion District, Mumbai 400001',
  instagram: '#',
  facebook: '#',
  footerDescription: "Luxury gifting redefined. Curated hampers, premium jewellery, and artisanal stationery for life's most precious moments.",
};

const KEY = 'ags_site_settings_v2';

function loadSettings(): SiteSettings {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULTS };
}

function saveSettings(s: SiteSettings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

interface Ctx {
  settings: SiteSettings;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const SiteSettingsContext = createContext<Ctx | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(loadSettings);

  useEffect(() => { applyTheme(settings.themeColor, settings.bgMode); }, [settings.themeColor, settings.bgMode]);

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
