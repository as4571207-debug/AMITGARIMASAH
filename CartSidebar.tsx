import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSidebar() {
  const { isOpen, closeCart, items, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-background shadow-2xl z-[101] flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-card">
              <h2 className="font-display text-2xl font-bold text-primary">Your Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <ShoppingBag className="w-16 h-16 mb-4 text-muted-foreground" strokeWidth={1} />
                  <p className="text-lg font-medium text-foreground">Your cart is empty</p>
                  <p className="text-sm mt-2">Discover our luxury collections to begin.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-8 px-6 py-2 border border-foreground text-foreground uppercase tracking-widest text-xs font-semibold hover:bg-foreground hover:text-background transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 group">
                    {/* Tiny Placeholder Image */}
                    <div className="w-20 h-24 bg-gradient-to-br from-muted to-border flex items-center justify-center flex-shrink-0">
                       <span className="font-display text-2xl text-foreground/20 font-black">
                         {item.product.category.charAt(0)}
                       </span>
                    </div>

                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <span className="text-xs text-muted-foreground mt-1">
                        {item.product.category}
                      </span>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-none">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1.5 hover:bg-muted text-foreground transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1.5 hover:bg-muted text-foreground transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <span className="font-semibold text-sm">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground font-medium">Subtotal</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mb-6">
                  Taxes and shipping calculated at checkout. Free shipping on orders above ₹999.
                </p>

                <button className="w-full bg-primary text-primary-foreground py-4 font-semibold uppercase tracking-widest text-sm hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
