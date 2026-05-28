# 🎨 Design System - ADVGD CRM

## Baseado na Logo Diego Patrício Advogado

### Cores Principais

#### Azul Marinho (Profissional)
```
Principal Dark: #003f7f
Principal Main: #0d47a1
Principal Light: #1565c0
Principal Lighter: #e3f2fd (Fundo claro)
```

#### Ouro/Dourado (Acento)
```
Gold: #c9a961
Gold Light: #e8d7b5
Gold Dark: #a68039
```

#### Neutros
```
Branco: #ffffff
Cinza Claro: #f5f5f5
Cinza 100: #f0f0f0
Cinza 200: #e8e8e8
Cinza 300: #d0d0d0
Cinza 400: #999999
Cinza 500: #666666
Cinza 600: #444444
Preto: #1a1a1a
```

#### Status
```
Sucesso: #27ae60
Erro: #c0392b
Aviso: #e67e22
Informação: #3498db
```

---

## Componentes

### Logo

#### ADVGDLogo
Componente responsivo com 4 tamanhos:

```tsx
<ADVGDLogo 
  size="small" | "medium" | "large" | "xlarge"
  variant="full" | "icon" | "text"
  showText={true|false}
/>
```

#### ADVGDLogoDiego
Versão com nome completo:

```tsx
<ADVGDLogoDiego size="medium" />
```

### TopBar

Barra superior com título e ações:

```tsx
<TopBar 
  title="Dashboard"
  subtitle="Bem-vindo"
  actions={<button>Ação</button>}
/>
```

### Card

Componente de cartão:

```tsx
<Card 
  title="Meu Card"
  subtitle="Subtítulo"
  icon="📊"
  hoverable
>
  Conteúdo aqui
</Card>
```

### Button

Componente de botão com variantes:

```tsx
<Button 
  variant="primary" | "secondary" | "success" | "error" | "outline"
  size="sm" | "md" | "lg"
  onClick={handleClick}
  disabled={false}
>
  Clique aqui
</Button>
```

### Badge

Componente de badge/label:

```tsx
<Badge variant="primary" | "success" | "warning" | "error" | "info">
  Label
</Badge>
```

---

## Tipografia

### Fontes
```
Primária: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
Secundária: Georgia, serif (para destaques)
```

### Tamanhos
```
xs: 12px
sm: 14px
base: 16px
lg: 18px
xl: 20px
xxl: 24px
xxxl: 32px
title: 40px
```

### Weights
```
light: 300
regular: 400
medium: 500
semibold: 600
bold: 700
extrabold: 800
```

---

## Espaçamento

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

---

## Shadows (Sombras)

```
sm: 0 1px 2px rgba(0, 63, 127, 0.05)
md: 0 4px 8px rgba(0, 63, 127, 0.1)
lg: 0 12px 24px rgba(0, 63, 127, 0.15)
xl: 0 20px 40px rgba(0, 63, 127, 0.2)
gold: 0 4px 16px rgba(201, 169, 97, 0.3)
```

---

## Border Radius

```
none: 0px
sm: 4px
md: 8px
lg: 12px
xl: 16px
full: 9999px
```

---

## Transições

```
fast: 0.15s ease-in-out
normal: 0.3s ease-in-out
slow: 0.5s ease-in-out
```

---

## Uso no Design System

### Importar
```tsx
import { designSystem } from '@/theme/designSystem';
import { ADVGDLogo } from '@/components/Logo';
import { TopBar, Card, Button, Badge } from '@/components/TopBar';
```

### Exemplos

#### Usando Cores
```tsx
<div style={{ backgroundColor: designSystem.colors.primary.dark }}>
  Fundo azul marinho
</div>
```

#### Usando Gradientes
```tsx
<div style={{ background: designSystem.gradients.primary }}>
  Gradiente azul
</div>
```

#### Usando Shadows
```tsx
<div style={{ boxShadow: designSystem.shadows.lg }}>
  Sombra grande
</div>
```

---

## Paleta de Cores

### Modo Claro (Light Mode)
```
Background Primary: #ffffff
Background Secondary: #f5f5f5
Background Tertiary: #e3f2fd
Text Primary: #1a1a1a
Text Secondary: #666666
Border: #d0d0d0
```

### Modo Escuro (Dark Mode) - Em desenvolvimento
```
Background Primary: #1a1a1a
Background Secondary: #444444
Background Tertiary: #003f7f
Text Primary: #ffffff
Text Secondary: #d0d0d0
Border: #666666
```

---

## Breakpoints (Responsividade)

```
mobile: 480px
tablet: 768px
desktop: 1024px
wide: 1280px
```

---

## Guia de Uso

### Sidebar (Layout Primário)
- Cor: #003f7f (Azul Marinho)
- Borda: #c9a961 (Ouro)
- Texto: #ffffff
- Hover: rgba(201, 169, 97, 0.15)

### Header/TopBar
- Cor: #ffffff
- Borda inferior: #c9a961
- Título: #003f7f
- Usuário: #0d47a1 background

### Cards/Conteúdo
- Fundo: #ffffff
- Sombra: md
- Borda: #d0d0d0
- Hover: Elevar com sombra lg

### Botões
- Primário: #003f7f
- Secundário: #c9a961
- Sucesso: #27ae60
- Erro: #c0392b

### Inputs/Forms
- Borda padrão: #d0d0d0
- Borda foco: #003f7f
- Ring foco: #e3f2fd
- Placeholder: #999999

---

## Componentes Prontos

### ✅ Logo (Logo.tsx)
- ADVGDLogo: Logo icônica
- ADVGDLogoDiego: Logo com nome completo

### ✅ Layout (Layout.tsx)
- Sidebar com navegação
- Cores do design system aplicadas
- Responsivo

### ✅ TopBar (TopBar.tsx)
- Barra superior profissional
- Card component
- Button component
- Badge component

### ✅ Global Styles (global.css)
- Reset CSS
- Estilos base
- Utility classes
- Dark mode support

### ✅ Design System (designSystem.ts)
- Todas as cores
- Tipografia
- Espaçamento
- Sombras e transições

---

## Próximas Atualizações

1. ✅ Login Page com novo design
2. ⏳ Dashboard com Cards
3. ⏳ Leads Page estilizada
4. ⏳ Kanban com novo design
5. ⏳ Automações Page
6. ⏳ Reports com Charts estilizados
7. ⏳ Modal/Dialog components
8. ⏳ Tabs components
9. ⏳ Toast notifications com design system
10. ⏳ Dark mode completo

---

## Arquivos do Design System

```
frontend/src/
├── theme/
│   └── designSystem.ts          # Sistema de design completo
├── components/
│   ├── Logo.tsx                 # Componentes de logo
│   ├── Layout.tsx               # Layout principal
│   └── TopBar.tsx               # TopBar e componentes auxiliares
├── styles/
│   └── global.css               # Estilos globais
└── pages/
    └── LoginPage.tsx            # Login com novo design
```

---

## Integração

Para usar o design system em qualquer página:

```tsx
import { designSystem } from '@/theme/designSystem';
import { Card, Button, Badge } from '@/components/TopBar';
import { ADVGDLogo } from '@/components/Logo';

export function MinhaPage() {
  return (
    <div style={{ backgroundColor: designSystem.colors.neutral.light }}>
      <Card title="Título" icon="📊">
        <p style={{ color: designSystem.colors.neutral.gray500 }}>
          Conteúdo aqui
        </p>
        <Button variant="primary">Ação</Button>
      </Card>
    </div>
  );
}
```

---

**Status:** ✅ Design System Completo e Pronto para Uso

Versão: 1.0  
Data: 28/05/2026  
Baseado em: Logo Diego Patrício Advogado
