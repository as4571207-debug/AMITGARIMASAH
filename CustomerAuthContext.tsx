import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface CustomerAuthCtx {
  customer: Customer | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, phone: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const CUSTOMERS_KEY = 'ags_customers';
const SESSION_KEY = 'ags_customer_session';

function getCustomers(): Array<Customer & { password: string }> {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]'); } catch { return []; }
}
function saveCustomers(list: Array<Customer & { password: string }>) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
}
function loadSession(): Customer | null {
  try { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

const CustomerAuthContext = createContext<CustomerAuthCtx | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(loadSession);

  const login = useCallback((email: string, password: string) => {
    const all = getCustomers();
    const found = all.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (!found) return { ok: false, error: 'Email ya password galat hai' };
    const { password: _p, ...c } = found;
    setCustomer(c);
    localStorage.setItem(SESSION_KEY, JSON.stringify(c));
    return { ok: true };
  }, []);

  const register = useCallback((name: string, email: string, phone: string, password: string) => {
    const all = getCustomers();
    if (all.find(c => c.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Yeh email pehle se registered hai' };
    }
    const newCustomer: Customer & { password: string } = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
      password,
    };
    saveCustomers([...all, newCustomer]);
    const { password: _p, ...c } = newCustomer;
    setCustomer(c);
    localStorage.setItem(SESSION_KEY, JSON.stringify(c));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
