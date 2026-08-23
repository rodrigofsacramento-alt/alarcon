# DESIGN.md - Indavent CRM Design System

## Core Aesthetics
O design é moderno, usando predominantemente um "Dark Mode" com tons de Slate para fundos neutros e gradientes de Blue/Indigo para ações principais.

## Typography Scale
Utilizando a fonte Inter (sans-serif) para legibilidade geral.
- **Display 1 (Hero)**: 72px / 4.5rem, line-height: 1.1, font-weight: 800
- **Display 2 (Section Title)**: 48px / 3.0rem, line-height: 1.2, font-weight: 700
- **Heading 1**: 32px / 2.0rem, line-height: 1.3, font-weight: 600
- **Heading 2**: 24px / 1.5rem, line-height: 1.4, font-weight: 600
- **Heading 3**: 20px / 1.25rem, line-height: 1.4, font-weight: 600
- **Body Lead**: 20px / 1.25rem, line-height: 1.6, font-weight: 300
- **Body Main**: 16px / 1.0rem, line-height: 1.6, font-weight: 400
- **Body Small**: 14px / 0.875rem, line-height: 1.6, font-weight: 400
- **Caption / Label**: 12px / 0.75rem, line-height: 1.5, font-weight: 500, letter-spacing: 1.5px

## Spacing Grid (8pt System)
Sempre utilize múltiplos de 8 para `margin`, `padding` e `gap`:
- **xs**: 4px (`1` no Tailwind) - Usado para pequenos espaçamentos de ícones.
- **sm**: 8px (`2` no Tailwind)
- **md**: 16px (`4` no Tailwind)
- **lg**: 24px (`6` no Tailwind)
- **xl**: 32px (`8` no Tailwind)
- **xxl**: 48px (`12` no Tailwind)
- **xxxl**: 64px (`16` no Tailwind)

## Colors (Tailwind Reference)
- **Backgrounds**: Slate 950 (`#020617`), Slate 900 (`#0f172a`)
- **Primary Actions**: Blue 600 (`#2563eb`), hover Blue 500 (`#3b82f6`)
- **Secondary Accents**: Indigo 600 (`#4f46e5`)
- **Text Primary**: White / Slate 200 (`#e2e8f0`)
- **Text Secondary**: Slate 400 (`#94a3b8`), Slate 500 (`#64748b`)
- **Error States**: Rose 500 (`#f43f5e`)

## Components Blueprint
1. **Buttons**: Utilizar cantos arredondados (`rounded-2xl` ou `rounded-lg`), sombras quando primary, e transições de transform no hover.
2. **Cards**: Utilizar `rounded-2xl` ou `rounded-[32px]`, bordas sutis (`border-white/5`), fundo semitransparente com blur (`backdrop-blur-2xl` ou similar) e padding baseado no grid de 8pt (ex: `p-6` ou `p-8`).
3. **Forms**: Labels pequenas e maiúsculas (Caption/Label), inputs com `focus-visible:ring-2`, cantos arredondados, fundo escuro (`bg-slate-950/50`).

## Responsive Strategy (Mobile-First)
- O padrão base é para mobile (1 coluna).
- Usar prefixos `md:` (>=768px), `lg:` (>=1024px) para adaptações como Grid Stacking (ex: `grid-cols-2`, `grid-cols-4`).
- Reduzir margens em telas menores.
