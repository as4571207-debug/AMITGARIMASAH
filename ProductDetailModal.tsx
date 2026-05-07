import { useState } from 'react';
import { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import {
  X, ChevronLeft, ChevronRight, ShoppingBag, Zap, ImageIcon, Star, Shield, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderModal from './OrderModal';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [currentImg, setCurrentImg] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const allImages = [
    product.image,
    ...(product.images || []),
  ].filter(Boolean) as string[];

  const hasImages = allImages.length > 0;

  const prevImg = () => setCurrentImg((i) => (i - 1 + (allImages.length || 1)) % (allImages.length || 1));
  const nextImg = () => setCurrentImg((i) => (i + 1) % (allImages.length || 1));

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          className="bg-white w-full md:max-w-3xl md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] md:max-h-[90vh] flex flex-col"
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100 shrink-0 md:hidden">
            <button onClick={onClose} className="p-2 -ml-1 text-gray-500 hover:text-purple-700 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-700 line-clamp-1 flex-1 text-center mx-2">{product.name}</span>
            <button onClick={onClose} className="p-2 -mr-1 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="md:flex">

              {/* ── LEFT: Image Gallery ── */}
              <div className="md:w-1/2 md:shrink-0 bg-purple-50">
                {/* Main Image */}
                <div className="relative aspect-square md:aspect-[4/5] bg-purple-50 overflow-hidden">
                  {hasImages ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImg}
                          src={allImages[currentImg]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        />
                      </AnimatePresence>

                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImg}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={nextImg}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                          {/* Dot indicators */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {allImages.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentImg(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-purple-600 w-5' : 'bg-white/70'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-purple-200">
                        <ImageIcon className="w-20 h-20 mx-auto mb-2" />
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImg(i)}
                        className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          i === currentImg ? 'border-purple-500' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── RIGHT: Product Info ── */}
              <div className="md:w-1/2 p-5 flex flex-col gap-4">

                {/* Category + Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                  </div>
                </div>

                {/* Name */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-purple-700">{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(Math.round(product.price * 1.3))}</span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">23% off</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Truck className="w-4 h-4" />, label: 'Free Delivery', sub: 'Above ₹999' },
                    { icon: <Shield className="w-4 h-4" />, label: '100% Safe', sub: 'Secure order' },
                    { icon: <Star className="w-4 h-4" />, label: 'Top Rated', sub: '4.8 stars' },
                  ].map(({ icon, label, sub }) => (
                    <div key={label} className="flex flex-col items-center text-center bg-purple-50 rounded-xl p-2">
                      <span className="text-purple-500 mb-1">{icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                      <span className="text-[10px] text-gray-400">{sub}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-purple-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-gray-800 border-x border-purple-200 min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex gap-3 mt-auto pt-2">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 rounded-xl py-3 text-sm font-bold transition-all ${
                      addedToCart
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {addedToCart ? 'Added!' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-lg shadow-purple-200"
                  >
                    <Zap className="w-4 h-4" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Bottom Buttons */}
          <div className="md:hidden flex gap-3 px-4 py-4 border-t border-purple-100 bg-white shrink-0">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 rounded-xl py-3.5 text-sm font-bold transition-all ${
                addedToCart
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'text-purple-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-purple-200"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showOrderModal && (
          <OrderModal
            product={product}
            quantity={qty}
            onClose={() => setShowOrderModal(false)}
            onSuccess={() => { setShowOrderModal(false); onClose(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
