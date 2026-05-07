import { useState } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/data/products';
import ProductDetailModal from './ProductDetailModal';

export default function ProductGrid() {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getPlaceholderStyle = (category: string) => {
    switch (category) {
      case 'Jewellery': return 'from-purple-100 to-purple-200';
      case 'Stationery': return 'from-violet-100 to-violet-200';
      case 'Wallets': return 'from-fuchsia-100 to-fuchsia-200';
      case 'Custom': return 'from-purple-100 to-fuchsia-200';
      default: return 'from-purple-50 to-purple-100';
    }
  };

  return (
    <section id="featured" className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Featured Hampers
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-display">No products listed yet.</p>
            <a href="/admin" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
              Go to Admin Panel to add products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1, duration: 0.5 }}
                className="group flex flex-col bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 relative cursor-pointer rounded-xl overflow-hidden"
                onClick={() => setSelectedProduct(product)}
              >
                {product.badge && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md rounded-full">
                    {product.badge}
                  </div>
                )}

                {/* Image */}
                <div className={`aspect-square w-full relative overflow-hidden flex items-center justify-center ${product.image ? '' : `bg-gradient-to-br ${getPlaceholderStyle(product.category)}`}`}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-purple-200" />
                  )}

                  {/* Quick Add - Desktop */}
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="w-full bg-purple-600 text-white py-2.5 font-semibold text-xs tracking-wider hover:bg-purple-700 transition-colors shadow-lg rounded-lg"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-purple-500 tracking-widest uppercase mb-1">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1 flex-grow hidden md:block">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-base text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="w-8 h-8 md:w-9 md:h-9 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-md"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
