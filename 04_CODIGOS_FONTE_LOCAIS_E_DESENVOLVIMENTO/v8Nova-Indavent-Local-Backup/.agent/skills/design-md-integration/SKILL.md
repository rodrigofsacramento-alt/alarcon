---
name: design-md-integration
description: Framework to ensure AI agents read and adhere to DESIGN.md constraints before writing any UI code. Use this to maintain strict brand consistency across multiple pages and components.
type: framework
version: "1.0.0"
categories: [design, branding, workflow]
---
# DESIGN.md Integration
This skill forces the AI agent to respect a central source of truth for design patterns.
## The Problem
When generating UI code across multiple sessions, AI agents often hallucinate new colors, drift from the original spacing system, or invent new font families.
## The Solution
Always maintain a `DESIGN.md` file at the root of your project or component directory.
## Instructions for the Agent
When this skill is active, you MUST:
1. **Locate the File:** Search for `DESIGN.md` in the current working directory or the project root.
2. **Read Before Writing:** If `DESIGN.md` exists, read its contents entirely before writing or modifying any HTML, CSS, or JS (if UI-related).
3. **Strict Adherence:**
   - **Colors:** Use ONLY the exact hex codes or color variables defined in `DESIGN.md`. Do not invent intermediate shades unless explicitly permitted.
   - **Typography:** Apply only the font families and weight scales specified.
   - **Spacing/Grid:** If an 8pt grid is specified, ensure all margins, paddings, and gaps are multiples of 8 (4, 8, 16, 24, 32, etc.).
   - **Components:** Reuse the exact markup structure for buttons, cards, and inputs as defined.
4. **No Deviation:** If a user requests a design change that violates `DESIGN.md`, politely warn them of the violation before proceeding.
