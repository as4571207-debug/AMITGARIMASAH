import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Lock, ShoppingBag, LogOut, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatPrice } from '@/lib/utils';

type Tab = 'login' | 'register';

export default function CustomerAuthPage() {
  const { customer, login, register, logout } = useCustomerAuth();
  const { orders } = useOrders();
  const { settings } = useSiteSettings();

  const [tab, setTab] = useState<Tab>('login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });

  const myOrders = orders.filter(o => o.customerEmail?.toLowerCase() === customer?.email.toLowerCase());

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = login(loginForm.email, loginForm.password);
    if (!res.ok) setError(res.error || 'Login failed');
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!regForm.name.trim()) return setError('Naam zaroori hai');
    if (!regForm.email.includes('@')) return setError('Valid email daalo');
    if (regForm.password.length < 6) return setError('Password kam se kam 6 characters ka hona chahiye');
    if (regForm.password !== regForm.confirm) return setError('Password match nahi kar raha');
    const res = register(regForm.name, regForm.email, regForm.phone, regForm.password);
    if (!res.ok) setError(res.error || 'Registration failed');
    else setSuccess('Account ban gaya! Welcome ' + regForm.name.split(' ')[0]);
  }

  const statusColor: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  };

  /* ─── LOGGED IN VIEW ─── */
  if (customer) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur border-b border-border sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </a>
            <div className="flex items-center gap-2">
              {settings.logoUrl
                ? <img src={settings.logoUrl} alt={settings.storeName} className="h-8 w-auto object-contain" />
                : <span className="font-bold text-primary">{settings.storeName}</span>
              }
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
                <p className="text-muted-foreground text-sm">{customer.email}</p>
                {customer.phone && <p className="text-muted-foreground text-sm">{customer.phone}</p>}
              </div>
              <button onClick={logout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>

          {/* Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Mere Orders ({myOrders.length})
            </h3>

            {myOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-10 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Abhi tak koi order nahi hai</p>
                <a href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Shop karo</a>
              </div>
            ) : (
              <div className="space-y-3">
                {[...myOrders].reverse().map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{formatPrice(order.total)}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.name} × {item.qty}</span>
                          <span>{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && <p className="text-primary text-[11px]">+{order.items.length - 3} aur items</p>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── AUTH FORM ─── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </a>
          <div className="flex items-center gap-2">
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt={settings.storeName} className="h-8 w-auto object-contain" />
              : <span className="font-bold text-primary">{settings.storeName}</span>
            }
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="flex border-b border-border">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t === 'login' ? 'Login Karo' : 'New Account'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Welcome text */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {tab === 'login' ? 'Welcome Back!' : 'Account Banao'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tab === 'login' ? 'Apne account mein login karo' : 'Free mein register karo'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {/* ─── LOGIN ─── */}
                {tab === 'login' && (
                  <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
                      Login Karo
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      Account nahi hai?{' '}
                      <button type="button" onClick={() => setTab('register')} className="text-primary font-semibold hover:underline">
                        Register karo
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* ─── REGISTER ─── */}
                {tab === 'register' && (
                  <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister} className="space-y-4">
                    {success && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" /> {success}
                      </div>
                    )}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Pura Naam"
                        value={regForm.name}
                        onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={regForm.email}
                        onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Mobile Number (optional)"
                        value={regForm.phone}
                        onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Password (6+ characters)"
                        value={regForm.password}
                        onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Password confirm karo"
                        value={regForm.confirm}
                        onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                      />
                    </div>

                    {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
                      Account Banao — Free!
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already account hai?{' '}
                      <button type="button" onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">
                        Login karo
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
