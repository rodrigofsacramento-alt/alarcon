---
name: component-library
description: Guidelines for generating and structuring reusable UI components (buttons, cards, forms, navs, modals). Use to ensure semantic HTML, proper accessibility (a11y), and consistent styling architectures.
type: framework
version: "1.0.0"
categories: [design, components, ui-ux]
---
# Component Library Standards
This skill instructs the agent on how to build robust, reusable UI components.
## Core Principles
1. **Semantic HTML:** Always use the correct HTML5 tags (`<button>` for actions, `<a>` for navigation, `<article>` for self-contained content, etc.).
2. **Accessibility (a11y) First:**
   - Include `aria-labels` when text context is missing (e.g., icon-only buttons).
   - Ensure sufficient color contrast.
   - Support keyboard navigation (`:focus-visible` states).
3. **State Management in CSS:**
   - Always define `:hover`, `:focus`, `:active`, and `:disabled` states for interactive elements.
   - Use smooth transitions (e.g., `transition: all 0.2s ease`).
4. **Modularity:** Components must not rely on external layout wrappers for their internal styling. They should expand to fill their container or have defined max-widths.
## Common Component Blueprints
### Buttons
- **Primary:** High contrast background, bold text, clear hover state (e.g., slight lift or shadow).
- **Secondary:** Transparent background, visible border, matches text color.
- **Ghost/Tertiary:** No background, no border, subtle hover background.
### Cards (Bento/Feature)
- Soft rounded corners (e.g., `border-radius: 12px` or `16px`).
- Subtle border for definition (`1px solid rgba(255,255,255,0.1)` in dark mode).
- Internal padding using the spacing scale (e.g., 24px or 32px).
- Optional glassmorphism: `backdrop-filter: blur(12px)`.
### Forms
- Clear labels associated with inputs via `id` and `for`.
- Visible focus rings for accessibility.
- Error states clearly marked with color (red) and helper text.
