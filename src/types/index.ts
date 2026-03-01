// src/types/index.ts

export interface Category {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    category?: string;
    image?: string;
    available: boolean;
    hasStockControl: boolean;
    stock?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    customerName: string;
    customerPhone: string;
    customerPaymentMethod: string;
    status: 'pendente' | 'preparando' | 'pronto' | 'entregue';
    createdAt: Date;
}