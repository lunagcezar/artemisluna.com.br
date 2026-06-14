# Frameworks used

- Astro
- React

# UI Libraries used

- shadcn/ui
- Phosphor icons

# Code quality

- Always use SOLID and DRY;
- Always check for skills already installed to improve the workflow;

# Tooling

- Always use pnpm instead of npm

# Components

- The UI components must be organized in three folders, like an atomic design:
  - core: Primitive components, like an input field, button, etc;
  - features: combination of primitive components reserved for one page only;
  - shared: combination of primitive components reserved for more than one page, like a navbar;
- Astro components **must** be in \_astro subfolders inside of core, features or shared;
- React components uses snake-case.tsx and Astro components uses AstroTitleCase.astro, with Astro as prefix to avoid naming conflicts;
