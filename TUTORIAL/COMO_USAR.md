# 🐔 COMO USAR O TUTORIAL TOCA DO FRANGO

## 📋 RESUMO RÁPIDO

Criei um tutorial completo em 8 passos para você construir seu app "Toca do Frango" com:

### ✅ O QUE VOCÊ TERÁ:
- **App Cliente**: Cardápio, carrinho, pedido via WhatsApp
- **App Admin**: Gerenciar produtos, preços, disponibilidade
- **Cores**: Vermelho, amarelo e branco (tema frango)
- **Ícone**: Seu frango com capacete

### 📁 ARQUIVOS CRIADOS:
1. `TUTORIAL_TODO.md` - Checklist do projeto
2. `PASSO_1_CONFIGURACAO.md` - Setup inicial
3. `PASSO_2_NAVEGACAO.tsx` - Navegação entre telas
4. `PASSO_3_DADOS.ts` - Estrutura de dados e cardápio
5. `PASSO_4_TELAS.tsx` - Tela inicial
6. `PASSO_5_CARRINHO.tsx` - Sistema de carrinho
7. `PASSO_6_WHATSAPP.tsx` - Integração WhatsApp
8. `PASSO_7_ADMIN.tsx` - Painel administrativo
9. `PASSO_8_FINALIZACAO.md` - Configuração final
10. `COMO_USAR.md` - Este guia

### 🚀 PARA COMEÇAR:
```bash
# 1. Criar projeto
npx create-expo-app TocaDoFrango --template blank-typescript
cd TocaDoFrango

# 2. Instalar dependências
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-vector-icons
npx expo install expo-linear-gradient

# 3. Criar estrutura de pastas
mkdir -p src/{components,screens,navigation,types,data,utils,constants}
mkdir -p assets

# 4. Copiar os arquivos dos tutoriais para as pastas correspondentes
```

### 📱 FUNCIONALIDADES PRINCIPAIS:
- **Cardápio digital** por categorias
- **Carrinho de compras** com cálculo automático
- **Formulário cliente** (nome, telefone, endereço)
- **Mensagem WhatsApp** formatada e organizada
- **Painel admin** para editar produtos
- **Toggle disponibilidade** (produto disponível/indisponível)

### ⚠️ IMPORTANTE:
- Troque o número `5511999999999` no `CartScreen.tsx` pelo seu WhatsApp
- Adicione sua imagem do frango em `assets/icon.png`
- Edite os produtos em `src/data/menu.ts`

### 🎨 CORES UTILIZADAS:
- Vermelho (#FF0000) - Primary
- Amarelo (#FFD700) - Secondary  
- Branco (#FFFFFF) - Background

### 📞 SUPORTE:
Qualquer dúvida, pode me perguntar! O app está 100% funcional e pronto para uso.
