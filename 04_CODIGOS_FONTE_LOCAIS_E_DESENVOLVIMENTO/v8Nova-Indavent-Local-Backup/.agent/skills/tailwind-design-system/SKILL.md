---
name: tailwind-design-system
description: Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
type: framework
version: "1.0.0"
categories: [design-system, responsive, css, react]
---
# Tailwind Design System (v4)
Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, responsive patterns, and accessibility.
> **Note**: This skill targets Tailwind CSS v4 (2024+). For v3 projects, refer to the [upgrade guide](https://tailwindcss.com/docs/upgrade-guide).
## When to Use This Skill
- Creating a component library with Tailwind v4
- Implementing design tokens and theming with CSS-first configuration
- Building responsive and accessible components
- Standardizing UI patterns across a codebase
- Migrating from Tailwind v3 to v4
- Setting up dark mode with native CSS features
## Key v4 Changes
| v3 Pattern                            | v4 Pattern                                                            |
| ------------------------------------- | --------------------------------------------------------------------- |
| `tailwind.config.ts`                  | `@theme` in CSS                                                       |
| `@tailwind base/components/utilities` | `@import "tailwindcss"`                                               |
| `darkMode: "class"`                   | `@custom-variant dark (&:where(.dark, .dark *))`                      |
| `theme.extend.colors`                 | `@theme { --color-*: value }`                                         |
## Design Token Implementation in CSS
Tailwind CSS v4 replaces the traditional JS-based config with a CSS-first approach using standard `@theme` declarations:
```css
@import "tailwindcss";
@theme {
  --color-primary-50: #f0fdf4;
  --color-primary-500: #22c55e;
  --color-primary-900: #14532d;
  
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Playfair Display', serif;
  
  --animate-float: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
}
```
