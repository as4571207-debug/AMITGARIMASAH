import { useState } from 'react';
import { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { useOrders } from '@/context/OrdersContext';
import { X, MapPin, Phone, User, FileText, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  product: Product;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  notes: '',
};

export default function OrderModal({ product, quantity, onClose, onSuccess }: Props) {
  const { placeOrder } = useOrders();
  const [form, setForm] = useState({ ...emptyForm });
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Naam zaroori hai';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Sahi mobile number daalo (10 digits)';
    if (!form.address.trim()) e.address = 'Address zaroori hai';
    if (!form.city.trim()) e.city = 'City zaroori hai';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6 digit pincode daalo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    placeOrder({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      productCategory: product.category,
      price: product.price * quantity,
      quantity,
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes.trim() || undefined,
      },
    });
    setPlaced(true);
  };

  const field = (
    name: keyof typeof emptyForm,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    type = 'text',
    extra?: object
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {name !== 'notes' && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300">{icon}</span>
        {name === 'notes' ? (
          <textarea
            value={form[name]}
            onChange={(e) => { setForm((f) => ({ ...f, [name]: e.target.value })); setErrors((er) => ({ ...er, [name]: '' })); }}
            placeholder={placeholder}
            rows={2}
            className="w-full border border-purple-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
          />
        ) : (
          <input
            type={type}
            value={form[name]}
            onChange={(e) => { setForm((f) => ({ ...f, [name]: e.target.value })); setErrors((er) => ({ ...er, [name]: '' })); }}
            placeholder={placeholder}
            className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 transition-all ${errors[name] ? 'border-red-400 focus:border-red-400' : 'border-purple-200 focus:border-purple-500'}`}
            {...extra}
          />
        )}
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 flex items-end md:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 bg-purple-50 shrink-0">
          <button onClick={onClose} className="p-1.5 text-purple-400 hover:text-purple-700 transition-colors md:hidden">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-purple-900 text-base flex-1 text-center md:text-left">
            Delivery Details
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {placed ? (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 px-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Order Place Ho Gaya!</h3>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-semibold text-purple-700">{product.name}</span> ka order admin ko mil gaya hai.
                </p>
                <p className="text-gray-400 text-sm mb-8">Jald hi aapko confirm kiya jaayega.</p>
                <button
                  onClick={onSuccess}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                  Theek Hai
                </button>
              </motion.div>
            ) : (
              /* Order Form */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="p-5 space-y-4"
              >
                {/* Product Summary */}
                <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-purple-100 shrink-0 border border-purple-200">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-purple-200 text-2xl">🛍️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {quantity}</p>
                  </div>
                  <p className="font-bold text-purple-700 text-base shrink-0">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>

                {field('name', 'Aapka Naam', 'e.g. Priya Sharma', <User className="w-4 h-4" />)}
                {field('phone', 'Mobile Number', '10-digit mobile number', <Phone className="w-4 h-4" />, 'tel', { maxLength: 10, inputMode: 'numeric' })}
                {field('address', 'Ghar ka Address', 'House no., Street, Area...', <MapPin className="w-4 h-4" />)}

                <div className="grid grid-cols-2 gap-3">
                  {field('city', 'City', 'e.g. Mumbai', <MapPin className="w-4 h-4" />)}
                  {field('pincode', 'Pincode', '6-digit', <MapPin className="w-4 h-4" />, 'text', { maxLength: 6, inputMode: 'numeric' })}
                </div>

                {field('notes', 'Koi Special Note? (Optional)', 'koi khas baat...', <FileText className="w-4 h-4" />)}

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-purple-700 text-base">{formatPrice(product.price * quantity)}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center mb-3">Cash on Delivery · Free Shipping above ₹999</p>
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-4 font-bold text-sm transition-colors shadow-lg shadow-purple-200"
                  >
                    Order Confirm Karo 🎉
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
