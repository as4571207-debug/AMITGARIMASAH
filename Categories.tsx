import { Gem, BookHeart, Wallet, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 1, name: "Jewellery", icon: Gem, desc: "Bracelets, Necklaces & More" },
  { id: 2, name: "Stationery", icon: BookHeart, desc: "Premium Journaling Kits" },
  { id: 3, name: "Wallets", icon: Wallet, desc: "Classic & Minimalist" },
  { id: 4, name: "Custom", icon: Gift, desc: "Curated Hampers" },
];

export default function Categories() {
  return (
    <section id="categories" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {CATEGORIES.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-card border border-border flex flex-col items-center justify-center p-6 text-center shadow-sm hover:shadow-xl hover:border-accent hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                  <category.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-lg md:text-xl text-foreground mb-2">
                  {category.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {category.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
