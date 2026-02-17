# PASSO 1: CONFIGURAÇÃO INICIAL

## 1. Criar Projeto
```bash
npx create-expo-app TocaDoFrango --template blank-typescript
cd TocaDoFrango
```

## 2. Instalar Dependências Essenciais
```bash
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-vector-icons
npx expo install expo-linear-gradient
```

## 3. Estrutura de Pastas
```
TocaDoFrango/
├── assets/
│   ├── icon.png (seu frango)
│   ├── logo.png (texto "Toca do Frango")
│   └── splash.png
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── types/
│   ├── data/
│   ├── utils/
│   └── constants/
├── App.tsx
└── package.json
```

## 4. Cores e Constantes
Criar `src/constants/colors.ts`:
```typescript
export const COLORS = {
  primary: '#FF0000',      // Vermelho
  secondary: '#FFD700',    // Amarelo
  background: '#FFFFFF',   // Branco
  text: '#333333',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800'
};
```

## 5. Tipos TypeScript
Criar `src/types/index.ts`:
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
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
  customerAddress: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
}
```
