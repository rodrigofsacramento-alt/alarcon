---
name: developer-handoff
description: Guidelines for documenting generated code, organizing assets, and providing clear instructions for human developers who will maintain or integrate the AI-generated UI.
type: devops
version: "1.0.0"
categories: [documentation, handoff, devops]
---
# Developer Handoff Standards
This skill ensures that AI-generated code is easy for human developers to understand, maintain, and integrate into larger systems.
## Documentation Requirements
### 1. File Headers
Every main HTML, CSS, or JS file should start with a comment block explaining:
- Purpose of the file.
- Key design patterns used (e.g., "Uses BEM methodology", "Tailwind CSS v4").
- Any external dependencies (e.g., "Requires Lucide Icons").
### 2. Code Comments
- **Structural Comments:** Use comments to denote major sections of HTML (e.g., `<!-- Hero Section -->`, `<!-- Footer -->`).
- **Complex Logic:** Explain *why* complex CSS or JS was written, not just *what* it does. (e.g., "/* Calculating dynamic height to account for mobile address bars */").
## Asset Organization
- **Images/Icons:** Ensure all external assets are organized in an `/assets` or `/public` directory.
- **Paths:** Use relative paths consistently.
- **Optimization:** Note if any images need to be swapped for optimized versions in production.
## Readme Files
When generating a full project or a complex component, always generate a `README.md` that includes:
- **Project Overview:** What the code does.
- **Setup Instructions:** How to run the code locally (e.g., "Open index.html in a browser" or "Run `npm install`").
- **Design Tokens Summary:** A quick reference of the primary colors and fonts used.
- **Known Limitations:** Document anything that needs human intervention (e.g., "Form submission logic needs to be connected to the backend API").
