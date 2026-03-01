import { Product, Category } from "../types";

export const getCategoryName = (product: Product, categories: Category[]): string => {
    const category = categories.find(c => c.id === product.categoryId);
    return category?.name || product.category || 'Sem categoria';
};
