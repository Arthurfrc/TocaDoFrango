// src/context/MenuContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types';
import { MENU_DATA } from '@/data/menu';

interface MenuContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MENU_DATA);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (productId: string, updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === productId ? updatedProduct : p)
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, available: !p.available } : p
      )
    );
  };

  return (
    <MenuContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductAvailability
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}