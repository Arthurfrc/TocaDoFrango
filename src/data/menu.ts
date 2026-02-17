// src/data/menu.ts

import { Product } from '@/types';

export const MENU_DATA: Product[] = [
    // Frangos
    {
        id: '1',
        name: 'Frango Assado Inteiro',
        description: 'Frango temperado especial, assado lentamente',
        price: 35.00,
        category: 'Frangos',
        available: true
    },
    {
        id: '2',
        name: 'Meio Frango Assado',
        description: 'Porção individual de nosso frango especial',
        price: 20.00,
        category: 'Frangos',
        available: true
    },

    // Acompanhamentos
    {
        id: '3',
        name: 'Batata Frita',
        description: 'Porção de batata frita crocante',
        price: 12.00,
        category: 'Acompanhamentos',
        available: true
    },
    {
        id: '4',
        name: 'Farofa Especial',
        description: 'Farofa com bacon e ovos',
        price: 8.00,
        category: 'Acompanhamentos',
        available: true
    },
    {
        id: '5',
        name: 'Salada de Alface',
        description: 'Folhas frescas com tomate e cebola',
        price: 6.00,
        category: 'Acompanhamentos',
        available: true
    },

    // Bebidas
    {
        id: '6',
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná ou Fanta',
        price: 5.00,
        category: 'Bebidas',
        available: true
    },
    {
        id: '7',
        name: 'Suco Natural',
        description: 'Laranja, Limão ou Maracujá',
        price: 7.00,
        category: 'Bebidas',
        available: true
    }
];

export const getMenuByCategory = () => {
    const categories: { [key: string]: Product[] } = {};

    MENU_DATA.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });

    return categories;
};

// Função para buscar produto por ID
export const getProductById = (id: string): Product | undefined => {
    return MENU_DATA.find(product => product.id === id);
};
