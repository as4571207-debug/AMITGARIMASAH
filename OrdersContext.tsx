import React, { createContext, useContext, useState, useCallback } from 'react';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

export interface Order {
  id: string;
  productId: number;
  productName: string;
  productImage: string | null;
  productCategory: string;
  price: number;
  quantity: number;
  customer: OrderCustomer;
  status: OrderStatus;
  createdAt: string;
}

interface OrdersContextType {
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

const ORDERS_KEY = 'velvetora_orders';

function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const placeOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveOrders(updated);
      return updated;
    });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
      saveOrders(updated);
      return updated;
    });
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
