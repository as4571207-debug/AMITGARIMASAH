import { useState, useRef } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { useOrders, OrderStatus } from '@/context/OrdersContext';
import { useSiteSettings, THEMES, ThemeColor, BG_MODES, BgMode, FONT_STYLES, FontStyle, BUTTON_STYLES, ButtonStyle, HERO_OVERLAYS, HeroOverlay, applyTheme } from '@/context/SiteSettingsContext';
import { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Package, Tag, ShoppingBag, LayoutDashboard, Pencil, Trash2,
  X, Upload, Check, Eye, EyeOff, LogOut, ImageIcon, ShoppingCart, Clock,
  CheckCircle, Truck, XCircle, Phone, MapPin, RefreshCw, Settings, Globe,
  MessageSquare, Instagram, RotateCcw, Save,
} from 'lucide-react';

const ADMIN_PASSWORD = 'ags02june';
const SESSION_KEY = 'velvetora_admin_auth';
const CATEGORIES = ['Jewellery', 'Stationery', 'Wallets', 'Custom', 'Accessories', 'Gifts'];
const BADGES = ['', 'New', 'Bestseller', 'Popular', 'Custom', 'Limited'];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: <CheckCircle className="w-3 h-3" /> },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-700 border-purple-200',  icon: <Truck className="w-3 h-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200',     icon: <Check className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200',           icon: <XCircle className="w-3 h-3" /> },
};

/* ─────── Admin Login ─────── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center p-4">
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl border border-purple-100 w-full max-w-sm p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/images/ags-logo.svg" alt="AGS" className="h-16 w-auto mb-4 drop-shadow" />
          <h1 className="text-2xl font-bold text-purple-900">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Enter password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="Password"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 transition-all ${
                error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 text-center">
              Galat password hai. Dobara try karo.
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-bold text-sm transition-colors shadow-md"
          >
            Login Karo
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─────── Order Status Badge ─────── */
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─────── Admin Dashboard ─────── */
const emptyForm = {
  name: '',
  category: 'Jewellery',
  price: '',
  description: '',
  badge: '',
  image: null as string | null,
  images: [] as string[],
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [siteForm, setSiteForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      description: p.description,
      badge: p.badge || '',
      image: p.image,
      images: p.images || [],
    });
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({
          ...f,
          images: [...f.images, ev.target?.result as string].slice(0, 4),
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeExtraImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(form.price);
    if (!form.name || isNaN(price) || price <= 0) return;
    const data = {
      name: form.name.trim(),
      category: form.category,
      price,
      description: form.description.trim(),
      badge: form.badge || undefined,
      image: form.image,
      images: form.images.length ? form.images : undefined,
    };
    if (editProduct) {
      updateProduct({ ...data, id: editProduct.id });
      showSuccess('Product update ho gaya!');
    } else {
      addProduct(data);
      showSuccess('Product add ho gaya!');
    }
    setShowForm(false);
    setEditProduct(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    showSuccess('Product delete ho gaya.');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const totalValue = products.reduce((s, p) => s + p.price, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f5f3ff]">
      {/* Top Bar */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:block">Back to Store</span>
            </a>
            <div className="h-6 w-px bg-purple-100" />
            <div className="flex items-center gap-2">
              <img src="/images/ags-logo.svg" alt="AGS" className="h-8 w-auto" />
              <span className="font-bold text-purple-900 hidden sm:block">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 border border-purple-200 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
            {activeTab === 'products' && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <Check className="w-4 h-4" /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Products</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Categories</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {new Set(products.map((p) => p.category)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Orders</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{pendingOrders}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'products' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500 border border-purple-100 hover:text-purple-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Products
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'products' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}`}>
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'orders' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500 border border-purple-100 hover:text-purple-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Orders
            {pendingOrders > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'orders' ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-600'}`}>
                {pendingOrders} new
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setSiteForm({ ...settings }); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'settings' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500 border border-purple-100 hover:text-purple-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Site Settings
          </button>
        </div>

        {/* ─── PRODUCTS TAB ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                  <h2 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    All Products
                  </h2>
                  <span className="text-xs text-gray-400 bg-purple-50 px-3 py-1 rounded-full">{products.length} items</span>
                </div>

                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Package className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No products yet</p>
                    <p className="text-sm mt-1">Click "Add Product" to list your first item</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-50 text-left">
                          <th className="px-4 py-3 text-purple-700 font-semibold text-xs uppercase tracking-wide">Product</th>
                          <th className="px-4 py-3 text-purple-700 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Category</th>
                          <th className="px-4 py-3 text-purple-700 font-semibold text-xs uppercase tracking-wide">Price</th>
                          <th className="px-4 py-3 text-purple-700 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Badge</th>
                          <th className="px-4 py-3 text-purple-700 font-semibold text-xs uppercase tracking-wide text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                                  {p.image
                                    ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                    : <ImageIcon className="w-5 h-5 text-purple-300" />
                                  }
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                                    {p.images?.length ? `+${p.images.length} more photos` : 'Main photo only'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">{p.category}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">{formatPrice(p.price)}</td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              {p.badge
                                ? <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">{p.badge}</span>
                                : <span className="text-gray-300">—</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {deleteConfirm === p.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDelete(p.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                      Confirm
                                    </button>
                                    <button onClick={() => setDeleteConfirm(null)} className="p-1 text-gray-400 hover:text-gray-600">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── ORDERS TAB ─── */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                  <h2 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                    All Orders
                  </h2>
                  <span className="text-xs text-gray-400 bg-purple-50 px-3 py-1 rounded-full">{orders.length} orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Abhi koi order nahi aaya</p>
                    <p className="text-sm mt-1">Jab customer order karega, yahan dikhega</p>
                  </div>
                ) : (
                  <div className="divide-y divide-purple-50">
                    {orders.map((order) => (
                      <div key={order.id} className="hover:bg-purple-50/30 transition-colors">
                        {/* Order Row */}
                        <div
                          className="px-4 py-4 flex items-center gap-3 cursor-pointer"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          {/* Product Image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-100 shrink-0 border border-purple-200 flex items-center justify-center">
                            {order.productImage
                              ? <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                              : <ImageIcon className="w-5 h-5 text-purple-300" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm line-clamp-1">{order.productName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  <span className="font-medium text-purple-700">{order.customer.name}</span>
                                  {' · '}
                                  <span>{order.customer.city}</span>
                                  {' · '}
                                  <span>Qty {order.quantity}</span>
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-purple-700 text-sm">{formatPrice(order.price)}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <StatusBadge status={order.status} />
                              <span className="text-[10px] text-gray-400">{order.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-5 bg-purple-50/50 border-t border-purple-100">
                                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                  {/* Customer Info */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">Customer Details</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                                      <span>{order.customer.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-700">
                                      <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                      <span>{order.customer.address}, {order.customer.city} - {order.customer.pincode}</span>
                                    </div>
                                    {order.customer.notes && (
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                                        <span className="font-semibold">Note:</span> {order.customer.notes}
                                      </div>
                                    )}
                                  </div>

                                  {/* Status Update */}
                                  <div>
                                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">Update Status</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                                        <button
                                          key={s}
                                          onClick={() => updateOrderStatus(order.id, s)}
                                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                            order.status === s
                                              ? STATUS_CONFIG[s].color + ' border-current'
                                              : 'border-purple-200 text-gray-500 hover:border-purple-400 hover:text-purple-700 bg-white'
                                          }`}
                                        >
                                          {STATUS_CONFIG[s].icon}
                                          {STATUS_CONFIG[s].label}
                                          {order.status === s && <Check className="w-3 h-3 ml-auto" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-5">

                {/* ── Branding ── */}
                <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
                  <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" /> Branding
                  </h3>
                  <div className="space-y-4">

                    {/* Store Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Store Name</label>
                      <input
                        type="text"
                        value={siteForm.storeName}
                        onChange={(e) => setSiteForm((f) => ({ ...f, storeName: e.target.value }))}
                        placeholder="e.g. AGS"
                        className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-14 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-center overflow-hidden shrink-0">
                          {siteForm.logoUrl
                            ? <img src={siteForm.logoUrl} alt="logo" className="w-full h-full object-contain p-1" />
                            : <span className="text-purple-300 text-xs">No logo</span>
                          }
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-3 py-2 text-sm text-purple-700 font-medium transition-colors w-fit">
                            <Upload className="w-4 h-4" />
                            Upload Logo
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => setSiteForm((f) => ({ ...f, logoUrl: ev.target?.result as string }));
                              reader.readAsDataURL(file);
                              e.target.value = '';
                            }} />
                          </label>
                          {siteForm.logoUrl && (
                            <button type="button" onClick={() => setSiteForm((f) => ({ ...f, logoUrl: '' }))} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                              Remove logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Color Theme */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color Theme</label>
                      <div className="flex gap-3 flex-wrap">
                        {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
                          const t = THEMES[key];
                          const isSelected = siteForm.themeColor === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { setSiteForm((f) => ({ ...f, themeColor: key })); applyTheme(key, siteForm.bgMode); }}
                              className={`flex flex-col items-center gap-1.5 group transition-all`}
                            >
                              <div className={`w-9 h-9 rounded-full border-[3px] transition-all ${isSelected ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: t.swatch }} />
                              <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{t.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Background Style</label>
                      <div className="flex gap-3 flex-wrap">
                        {(Object.keys(BG_MODES) as BgMode[]).map((key) => {
                          const b = BG_MODES[key];
                          const isSelected = siteForm.bgMode === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { setSiteForm((f) => ({ ...f, bgMode: key })); applyTheme(siteForm.themeColor, key); }}
                              className="flex flex-col items-center gap-1.5 transition-all"
                            >
                              <div className={`w-9 h-9 rounded-full border-[3px] shadow-sm transition-all ${isSelected ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`} style={{ backgroundColor: b.swatch }} />
                              <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{b.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tagline</label>
                      <input
                        type="text"
                        value={siteForm.storeTagline}
                        onChange={(e) => setSiteForm((f) => ({ ...f, storeTagline: e.target.value }))}
                        placeholder="e.g. Luxury Gifting, Redefined."
                        className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Announcement Bar ── */}
                <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6">
                  <h3 className="font-bold text-purple-900 text-base mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" /> Announcement Bar
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteForm.announcementEnabled}
                        onChange={(e) => setSiteForm((f) => ({ ...f, announcementEnabled: e.target.checked }))}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Announcement bar dikhao</span>
                    </label>
                    <input
                      type="text"
                      value={siteForm.announcementText}
                      onChange={(e) => setSiteForm((f) => ({ ...f, announcementText: e.target.value }))}
                      placeholder="Announcement text likho..."
                      className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                {/* ── Hero Slides ── */}
                <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-purple-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wider">Main Screen Slides</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {siteForm.heroSlides.map((slide, i) => (
                      <div key={i} className="rounded-xl border border-purple-100 overflow-hidden">
                        {/* Image preview + upload */}
                        <div className="relative h-28 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
                          {slide.imageUrl ? (
                            <img src={slide.imageUrl} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-1 text-purple-300">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-xs">Default image (Slide {i+1})</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer flex items-center gap-2 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              {slide.imageUrl ? 'Change Photo' : 'Upload Photo'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const slides = [...siteForm.heroSlides];
                                  slides[i] = { ...slides[i], imageUrl: ev.target?.result as string };
                                  setSiteForm((f) => ({ ...f, heroSlides: slides }));
                                };
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }} />
                            </label>
                          </div>
                          {slide.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const slides = [...siteForm.heroSlides];
                                slides[i] = { ...slides[i], imageUrl: undefined };
                                setSiteForm((f) => ({ ...f, heroSlides: slides }));
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Slide {i + 1}
                          </span>
                        </div>
                        {/* Text fields */}
                        <div className="p-3 space-y-2 bg-white">
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const slides = [...siteForm.heroSlides];
                              slides[i] = { ...slides[i], title: e.target.value };
                              setSiteForm((f) => ({ ...f, heroSlides: slides }));
                            }}
                            placeholder="Big heading text..."
                            className="w-full border border-purple-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                          />
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => {
                              const slides = [...siteForm.heroSlides];
                              slides[i] = { ...slides[i], subtitle: e.target.value };
                              setSiteForm((f) => ({ ...f, heroSlides: slides }));
                            }}
                            placeholder="Small subtitle text..."
                            className="w-full border border-purple-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Button Text</label>
                      <input
                        type="text"
                        value={siteForm.heroButtonText}
                        onChange={(e) => setSiteForm((f) => ({ ...f, heroButtonText: e.target.value }))}
                        placeholder="e.g. Shop Now"
                        className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Style & Typography ── */}
                <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-purple-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Settings className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wider">Style & Typography</h3>
                  </div>
                  <div className="p-5 space-y-5">

                    {/* Font Style */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Heading Font</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(FONT_STYLES) as FontStyle[]).map((key) => {
                          const f = FONT_STYLES[key];
                          const isSelected = (siteForm.fontStyle ?? 'luxury') === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSiteForm((s) => ({ ...s, fontStyle: key }))}
                              className={`rounded-xl border-2 p-3 text-left transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
                            >
                              <p className={`text-base mb-1 ${isSelected ? 'text-purple-800' : 'text-gray-700'} ${f.headingClass}`}>Aa</p>
                              <p className={`text-[11px] font-semibold ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}>{f.label}</p>
                              <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{f.desc.split('—')[0].trim()}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Button Style */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Button Shape</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(BUTTON_STYLES) as ButtonStyle[]).map((key) => {
                          const b = BUTTON_STYLES[key];
                          const isSelected = (siteForm.buttonStyle ?? 'sharp') === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSiteForm((s) => ({ ...s, buttonStyle: key }))}
                              className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
                            >
                              <span className={`text-xs px-3 py-1 bg-purple-600 text-white font-semibold ${b.className}`}>{b.label}</span>
                              <p className="text-[9px] text-gray-400 text-center leading-tight">{b.desc.split('—')[1]?.trim()}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hero Overlay */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Photo Darkness</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(HERO_OVERLAYS) as HeroOverlay[]).map((key) => {
                          const isSelected = (siteForm.heroOverlay ?? 'medium') === key;
                          const darknessPct = key === 'light' ? '40%' : key === 'medium' ? '65%' : '85%';
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSiteForm((s) => ({ ...s, heroOverlay: key }))}
                              className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
                            >
                              <div className="w-full h-8 rounded-lg overflow-hidden relative bg-gradient-to-r from-purple-300 to-pink-300">
                                <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: `rgba(0,0,0,${key === 'light' ? 0.25 : key === 'medium' ? 0.5 : 0.72})` }} />
                              </div>
                              <p className={`text-[11px] font-semibold capitalize ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}>{key} ({darknessPct})</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6">
                  <h3 className="font-bold text-purple-900 text-base mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" /> Contact & Social
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', icon: <Phone className="w-4 h-4" /> },
                      { key: 'whatsapp', label: 'WhatsApp Number (country code + number)', placeholder: '919876543210', icon: <MessageSquare className="w-4 h-4" /> },
                      { key: 'email', label: 'Email Address', placeholder: 'hello@example.com', icon: <Globe className="w-4 h-4" /> },
                      { key: 'instagram', label: 'Instagram Link', placeholder: 'https://instagram.com/...', icon: <Instagram className="w-4 h-4" /> },
                    ].map(({ key, label, placeholder, icon }) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                          {icon} {label}
                        </label>
                        <input
                          type="text"
                          value={(siteForm as Record<string, unknown>)[key] as string}
                          onChange={(e) => setSiteForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Address
                      </label>
                      <input
                        type="text"
                        value={siteForm.address}
                        onChange={(e) => setSiteForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="Full address..."
                        className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Footer Description</label>
                      <textarea
                        value={siteForm.footerDescription}
                        onChange={(e) => setSiteForm((f) => ({ ...f, footerDescription: e.target.value }))}
                        rows={2}
                        className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Save / Reset Buttons */}
                <div className="flex gap-3 pb-8">
                  <button
                    onClick={() => {
                      updateSettings(siteForm);
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 2500);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3.5 font-bold text-sm transition-colors shadow-lg"
                  >
                    {settingsSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {settingsSaved ? 'Saved!' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => { resetSettings(); setSiteForm({ ...settings }); showSuccess('Settings reset ho gayi!'); }}
                    className="flex items-center gap-2 border border-purple-200 text-gray-500 hover:text-purple-700 hover:border-purple-400 rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Add/Edit Product Modal ─── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-50">
                <h3 className="font-bold text-purple-900 text-lg">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Main Product Image</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-full h-40 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
                  >
                    {form.image ? (
                      <>
                        <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Click to change image</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-purple-300 mb-2" />
                        <p className="text-sm text-purple-500 font-medium">Click to upload main image</p>
                        <p className="text-xs text-purple-300 mt-1">JPG, PNG, WEBP supported</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {form.image && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, image: null }))} className="mt-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                      Remove image
                    </button>
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Additional Images <span className="text-gray-400 font-normal">(upto 4)</span></label>
                    {form.images.length < 4 && (
                      <button
                        type="button"
                        onClick={() => extraFileRef.current?.click()}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Photos
                      </button>
                    )}
                  </div>
                  <input ref={extraFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
                  {form.images.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-200 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExtraImage(i)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                      {form.images.length < 4 && (
                        <button
                          type="button"
                          onClick={() => extraFileRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-purple-200 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-purple-500 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => extraFileRef.current?.click()}
                      className="w-full h-16 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:border-purple-400 transition-colors flex items-center justify-center gap-2 text-purple-400 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" /> Add more product photos
                    </button>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rose Gold Bracelet Set"
                    required
                    className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                {/* Category + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white transition-all"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. 1499"
                      required
                      min={1}
                      className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your product..."
                    rows={3}
                    className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Badge Label</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, badge: b }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          form.badge === b ? 'bg-purple-600 text-white border-purple-600' : 'border-purple-200 text-gray-500 hover:border-purple-400 hover:text-purple-600'
                        }`}
                      >
                        {b === '' ? 'None' : b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-purple-200 text-gray-600 rounded-lg py-3 text-sm font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 text-sm font-bold transition-colors shadow-md"
                  >
                    {editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────── Exports ─────── */
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  if (!isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setIsLoggedIn(false); }} />;
}
