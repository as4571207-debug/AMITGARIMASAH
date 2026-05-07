import React, { createContext, useContext, useState, useCallback } from 'react';
import { PRODUCTS, Product } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
}

const STORAGE_KEY = 'velvetora_products';

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return PRODUCTS;
}

function saveProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts((prev) => {
      const maxId = prev.reduce((m, p) => Math.max(m, p.id), 0);
      const newProduct: Product = { ...product, id: maxId + 1 };
      const updated = [...prev, newProduct];
      saveProducts(updated);
      return updated;
    });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === product.id ? product : p));
      saveProducts(updated);
      return updated;
    });
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      return updated;
    });
  }, []);

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
