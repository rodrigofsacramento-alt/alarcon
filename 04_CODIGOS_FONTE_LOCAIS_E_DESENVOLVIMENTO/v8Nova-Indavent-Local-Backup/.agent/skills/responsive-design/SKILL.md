---
name: responsive-design
description: Mathematical logic and best practices for creating mobile-first responsive layouts. Guides the agent on breakpoint calculation, fluid typography, and grid stacking.
type: layout
version: "1.0.0"
categories: [design, layout, mobile-first]
---
# Responsive Design Calculus
This skill enforces mobile-first design practices and mathematically sound breakpoint usage.
## Breakpoint Strategy (Mobile First)
Always code for mobile dimensions by default, then use `min-width` media queries to adapt for larger screens.
### Standard Breakpoints
- **Mobile (Default):** Base styles applied outside media queries.
- **Tablet (sm/md):** `@media (min-width: 768px)`
- **Laptop (lg):** `@media (min-width: 1024px)`
- **Desktop (xl):** `@media (min-width: 1280px)`
- **Ultra-wide (2xl):** `@media (min-width: 1536px)`
## Layout Patterns
### Grid Stacking
1. **Mobile:** 1 column (`grid-template-columns: 1fr`).
2. **Tablet:** 2 columns for lists/features (`grid-template-columns: repeat(2, 1fr)`).
3. **Desktop:** 3-4 columns based on content.
### Fluid Typography
Avoid hardcoding massive font sizes on mobile. Use clamp() for fluid scaling where appropriate, or step down font sizes in smaller breakpoints.
Example: `font-size: clamp(2rem, 5vw, 4.5rem);`
### Touch Targets
Ensure all clickable elements (buttons, links) are at least `44px` by `44px` on mobile devices for accessibility and usability.
### Spacing & Padding
Reduce section padding on mobile. 
- Desktop: `padding: 100px 0;`
- Mobile: `padding: 60px 0;`
