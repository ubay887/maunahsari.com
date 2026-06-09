# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the official website for **PPTQ Ma'unah Sari**, a Tahfidhul Qur'an boarding school (pesantren) in Kediri, Indonesia. The site is a single-page application built with React 19 and Vite 8, featuring custom client-side routing and a design system focused on Islamic educational institution branding.

**Tech Stack:**
- React 19.2.6 (with React DOM)
- Vite 8 (build tool and dev server)
- Tailwind CSS v4 with custom design tokens
- lucide-react for icons
- ESLint with flat config (ESM-based)

**Language:** Indonesian (Bahasa Indonesia) - all content, UI text, and comments are in Indonesian.

## Development Commands

```bash
# Start development server (typically runs on http://localhost:5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

## Architecture

### Custom Client-Side Routing

This project **does not use React Router**. Instead, it implements custom client-side routing using the browser's History API:

- **Route Management:** `App.jsx` manages routing via `window.history.pushState()` and state hooks
- **URL Sync:** `getPageFromPath()` parses `window.location.pathname` to determine active page
- **Navigation Handler:** `setActivePage(pageId)` updates both URL and component state
- **Browser History:** `popstate` event listener syncs state with back/forward buttons
- **Special Route:** `/pendaftaran-santri-baru-20262027` maps to the `pendaftaran` page ID

**Key Files:**
- `src/App.jsx` - Main routing logic and page rendering
- `src/components/Header.jsx` - Navigation menu that calls `setActivePage`

When adding new pages:
1. Add the page component import in `App.jsx`
2. Add navigation item to `Header.jsx`'s `navigation` array
3. Add case to `renderPageContent()` switch statement
4. Add SEO metadata case to the `useEffect` that updates title/description

### Dynamic SEO Management

Each page dynamically updates `document.title` and `<meta name="description">` via a `useEffect` hook in `App.jsx`. When `activePage` changes, the corresponding title and meta description are set for that page. This is critical for SEO since this is a single-page application.

### Design System (Tailwind v4)

The project uses Tailwind CSS v4's `@theme` directive for custom design tokens defined in `src/index.css`:

**Color Palette:**
- `--color-primary: #0c3e26` (Deep Forest Emerald) - main brand color
- `--color-secondary: #cfa152` (Warm Champagne Gold) - accent highlights
- `--color-accent: #10b981` (Bright Mint Green)
- Background shades: `bg-base`, `bg-surface`, `bg-elevated`
- Text hierarchy: `text-primary`, `text-muted`, `text-disabled`

**Custom Utilities:**
- `.container-custom` - Max-width container (1280px) with responsive padding
- `.glossy-gold` - Premium gradient button style with gold tones
- `.glossy-emerald` - Premium gradient button style with emerald tones
- `.glass-panel` - Glassmorphism effect with backdrop blur

**Typography:**
- `--font-display` - Playfair Display (serif, for headings)
- `--font-body` - Plus Jakarta Sans / Inter (sans-serif, for body text)
- `--font-mono` - JetBrains Mono

When styling components, prefer using the semantic color tokens (`text-primary`, `bg-surface`) over direct Tailwind colors. Use the custom utilities for branded buttons and containers.

### Component Structure

**Layout Components:**
- `Header.jsx` - Sticky/absolute header with responsive navigation (desktop horizontal menu + mobile drawer)
- `Hero.jsx` - Full-screen hero section (only rendered on `beranda` page)
- `Footer.jsx` - Site footer with links and social media

**Page Components:**
- `Beranda.jsx` - Homepage with featured content sections
- `Profil.jsx` - School profile and history
- `Pendaftaran.jsx` - New student registration information
- `PondokPutra.jsx` - Boys' boarding program details
- `PondokPutri.jsx` - Girls' boarding program details
- `Narahubung.jsx` - Contact information
- `Alumni.jsx` - Alumni association information
- `DailyCompass.jsx` - Daily schedule/activities widget

All page components receive an `onNavigate` prop (function) to programmatically navigate to other pages.

### Accessibility

The site follows WCAG accessibility guidelines:

- **Skip to Content Link:** Focus-visible link at the top for keyboard users (`#main-content`)
- **ARIA Labels:** All interactive elements have `aria-label` or `aria-expanded` attributes
- **Semantic HTML:** Proper use of `<header>`, `<nav>`, `<main>`, `<footer>` landmarks
- **Focus States:** Custom focus-visible outlines using `--color-secondary` (gold)
- **Reduced Motion:** Respects `prefers-reduced-motion` media query
- **Keyboard Navigation:** All interactive elements are keyboard-accessible

When adding new interactive elements, ensure they have proper ARIA attributes and focus states.

### Responsive Design

Breakpoints follow Tailwind's default:
- `sm:` 640px
- `md:` 768px (main desktop breakpoint)
- `lg:` 1024px

The Header component switches from horizontal desktop navigation to a mobile drawer menu at the `md` breakpoint.

### Asset Management

- **Images:** Stored in `src/assets/` and imported directly in components
- **Icons:** All icons use `lucide-react` components (e.g., `<BookOpen />`, `<Menu />`)
- **Public Assets:** Static assets in `public/` are served at root (e.g., `public/favicon.svg` → `/favicon.svg`)

### ESLint Configuration

Uses ESLint v10 with flat config format (`eslint.config.js`):
- `@eslint/js` recommended rules
- `eslint-plugin-react-hooks` (flat config)
- `eslint-plugin-react-refresh` (Vite-specific)
- Ignores `dist/` directory

## Common Patterns

### Navigation Between Pages

To navigate from one page to another:
```jsx
// In a component that receives onNavigate prop
<button onClick={() => onNavigate('profil')}>Go to Profile</button>
```

Valid page IDs: `beranda`, `profil`, `pendaftaran`, `putra`, `putri`, `narahubung`, `alumni`

### Adding New Sections to Homepage

The `Beranda.jsx` component is structured with multiple sections. Follow the existing pattern:
1. Use `container-custom` for proper max-width and padding
2. Include section headers with centered text and decorative underline
3. Use responsive grid layouts (`grid grid-cols-1 md:grid-cols-2`)
4. Apply consistent card styling (`bg-bg-surface border border-primary/10 rounded-2xl`)

### Styling Interactive Elements

Use the custom glossy utilities for primary actions:
```jsx
// Gold call-to-action button
<button className="glossy-gold text-primary font-bold px-6 py-3 rounded-lg">
  Daftar Sekarang
</button>

// Emerald secondary button
<button className="glossy-emerald text-white font-bold px-6 py-3 rounded-lg">
  Hubungi Kami
</button>
```

## Project Context

This is a static informational website with no backend, authentication, or database. All content is hardcoded in the React components. The site serves as:

1. **Marketing/Information Portal** - Introducing the school to prospective students and parents
2. **Registration Gateway** - Providing links and information for student registration
3. **Community Hub** - Connecting with alumni and current students' families

**Content Updates:** To update text, images, or information, directly edit the corresponding component files. There is no CMS or content management system.

## Git Status Note

The current repository has one modified file (`src/components/Hero.jsx`) on the `main` branch. The repository was recently initialized with a first commit (hash: `5a82889`).
