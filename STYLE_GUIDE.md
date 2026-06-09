# Style Guide - PTQ Ma'unah Sari Website

> Panduan konsistensi desain dan implementasi untuk website PTQ Ma'unah Sari

---

## 📐 Typography Scale

Typography hierarchy yang konsisten untuk semua halaman:

### Heading Levels

| Class | Usage | Font Size | Example |
|-------|-------|-----------|---------|
| `text-display-lg` | Page Hero Titles | 2.25rem → 3rem (md) | Hero section main title |
| `text-display-md` | Page Titles, Major Sections | 1.5rem → 1.875rem (md) | "Pendaftaran Santri Baru TA 2026/2027" |
| `text-heading-lg` | Section Headings | 1.25rem → 1.5rem (md) | "Program Pembelajaran", "Kegiatan Harian" |
| `text-heading-md` | Subsection Headings | 1.125rem | Card titles, minor sections |

### Body Text

- **Default body:** `text-sm` (0.875rem)
- **Small text/captions:** `text-xs` (0.75rem)
- **Tiny labels:** `text-[10px]` or `text-[11px]` (for metadata/footnotes)

### Font Families

- **Display (Headings):** `font-display` → Playfair Display (serif)
- **Body (Paragraph):** `font-body` → Plus Jakarta Sans / Inter (sans-serif)
- **Monospace:** `font-mono` → JetBrains Mono (for time labels, code)

---

## 🎨 Color System

### Primary Palette

```css
--color-primary: #0c3e26       /* Deep Forest Emerald - main brand */
--color-secondary: #cfa152     /* Warm Champagne Gold - accents */
--color-accent: #10b981        /* Bright Mint Green - highlights */
```

### Background Hierarchy

```css
--color-bg-base: #f4f6f5       /* Page background */
--color-bg-surface: #ffffff    /* Cards, panels */
--color-bg-elevated: #fbfdfc   /* Elevated surfaces */
```

### Text Hierarchy

```css
--color-text-primary: #111827  /* Dark headings, main text */
--color-text-muted: #4b5563    /* Secondary text */
--color-text-disabled: #9ca3af /* Disabled states */
```

### Semantic Colors

- **Success:** `text-emerald-600`, `bg-emerald-50`, `border-emerald-200`
- **Warning:** `text-amber-700`, `bg-amber-50`, `border-amber-500`
- **Error:** `text-red-700`, `bg-red-50`, `border-red-500`

---

## 🔘 Button Hierarchy

### Primary Action (Most Important)

```jsx
<button className="btn-primary focus-ring">
  Daftar Santri Baru
  <ArrowRight className="icon-xs" />
</button>
```

**Usage:** Main CTAs, form submissions, primary navigation actions
**Visual:** Glossy gold gradient background, primary text color

### Secondary Action (Important but not primary)

```jsx
<button className="btn-secondary focus-ring">
  Unduh Biaya Administrasi
  <Download className="icon-xs" />
</button>
```

**Usage:** Supporting actions, alternative paths, downloads
**Visual:** Glossy emerald gradient background, white text

### Tertiary Action (Text links)

```jsx
<button className="btn-tertiary focus-ring">
  Kunjungi Laman
  <ChevronRight className="icon-xs" />
</button>
```

**Usage:** Navigation links, "Learn more" actions, inline links
**Visual:** Text-only with secondary color, underline on hover

---

## 🎯 Icon Size Standards

Consistent icon sizing across all components:

| Class | Size | Usage |
|-------|------|-------|
| `icon-xs` | 16px (1rem) | Inline with small text, button icons |
| `icon-sm` | 20px (1.25rem) | Section headers, card titles |
| `icon-md` | 24px (1.5rem) | Page headers, feature icons |
| `icon-lg` | 40px (2.5rem) | Decorative icons, large features |

**Example:**
```jsx
{/* Section heading */}
<h3 className="text-heading-lg">
  <BookOpen className="icon-sm text-secondary" /> Program Pembelajaran
</h3>

{/* Button */}
<button className="btn-primary">
  Kirim Data
  <Send className="icon-xs" />
</button>
```

---

## 📏 Spacing System

### Page Containers

```css
.page-container {
  max-width: 80rem;        /* 1280px */
  padding: 2rem 1rem;      /* py-8 px-4 */
  padding-md: 3rem 1rem;   /* md:py-12 */
}
```

**Usage:** Wrap all page content in `.page-container` or manual equivalent

### Section Spacing

- **Between major sections:** `space-y-12` (3rem)
- **Between subsections:** `space-y-8` (2rem)
- **Between related items:** `space-y-6` (1.5rem)
- **Between tight elements:** `space-y-4` (1rem)

### Card Padding

- **Standard cards:** `p-6 md:p-8`
- **Compact cards:** `p-4 md:p-6`
- **List items:** `p-3` to `p-5`

---

## 🏗️ Component Patterns

### Page Header Pattern

```jsx
<div className="text-center space-y-2">
  <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
    Label Atas
  </span>
  <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
    Judul Halaman
  </h2>
  <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
</div>
```

### Card Pattern

```jsx
<div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm">
  {/* Card content */}
</div>
```

**Variants:**
- Hover effect: `hover:border-secondary hover:shadow-md transition-standard`
- With icon: Add icon before title with `icon-sm text-secondary`

---

## 🎭 Interactive States

### Transitions

- **Standard:** `transition-standard` (0.3s ease for all properties)
- **Fast:** `transition-fast` (0.2s ease for quick feedback)

### Focus States

Always include `focus-ring` class on interactive elements:
```jsx
<button className="btn-primary focus-ring">Click Me</button>
```

This provides a consistent secondary-colored outline for keyboard navigation.

### Hover Effects

- **Buttons:** Scale, shadow, or color change (handled by utility classes)
- **Cards:** `hover:border-secondary hover:shadow-md`
- **Links:** `hover:text-primary hover:underline`

---

## 📝 Terminology Glossary

### Official Names (Use Consistently)

| Term | Usage | Notes |
|------|-------|-------|
| **PPTQ Ma'unah Sari** | Official abbreviated name | Most common usage |
| **Pesantren Tahfidhul Qur'an Ma'unah Sari** | Full formal name | Use in formal contexts |
| **Ma'unah Sari** | Short informal name | Use in casual/familiar contexts |
| **PTQ Ma'unah Sari** | ❌ AVOID | Inconsistent abbreviation |

### Academic Terms

- **Tahun Ajaran (TA):** Academic Year - use "TA 2026/2027" format
- **PSB:** Penerimaan Santri Baru (New Student Registration)
- **Bil-Hifdhi:** Memorization program
- **Bin-Nadhor:** Reading program
- **Muroja'ah:** Revision/review of memorization
- **Sorogan:** One-on-one teaching method
- **Riyadloh:** Spiritual retreat program

### Honorifics

- **KH.** - Kyai Haji (male Islamic scholar)
- **Nyai Hj.** - Nyai Hajjah (female Islamic scholar)
- **Simbah** - Respected elder (grandfather/grandmother)
- **Agus/Gus** - Respected young scholar (son of Kyai)
- **Ustadz/Ustadzah** - Teacher (male/female)

---

## ♿ Accessibility Standards

### Semantic HTML

Always use proper semantic elements:
- `<header>`, `<nav>`, `<main>`, `<footer>` for layout
- `<article>`, `<section>` for content grouping
- `<h1>` through `<h6>` in proper hierarchy

### ARIA Labels

Add descriptive labels to interactive elements:
```jsx
<button
  onClick={handleClick}
  aria-label="Kembali ke Beranda"
  className="btn-primary focus-ring"
>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use `focus-ring` class for visible focus indicators
- Ensure logical tab order

### Screen Reader Support

- Include skip-to-content link: `<a href="#main-content">Skip to main content</a>`
- Use `alt` text for all images
- Provide context for icon-only buttons

---

## 🚀 Implementation Checklist

When adding new features, ensure:

- [ ] Typography uses standardized classes (`text-display-md`, `text-heading-lg`, etc.)
- [ ] Icons use size classes (`icon-xs`, `icon-sm`, `icon-md`, `icon-lg`)
- [ ] Buttons use hierarchy classes (`btn-primary`, `btn-secondary`, `btn-tertiary`)
- [ ] All interactive elements have `focus-ring` class
- [ ] Transitions use `transition-standard` or `transition-fast`
- [ ] Cards follow standard pattern with `rounded-2xl p-6 md:p-8`
- [ ] Spacing follows `space-y-*` system (4, 6, 8, 12)
- [ ] Colors use semantic tokens (`text-primary`, `bg-surface`, etc.)
- [ ] Terminology matches glossary standards
- [ ] ARIA labels present on interactive elements
- [ ] Responsive breakpoints at `md:` (768px) primarily

---

## 📚 Quick Reference

### Most Common Patterns

```jsx
// Page wrapper
<div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-12">

// Section heading
<h3 className="text-heading-lg text-primary flex items-center gap-2">
  <Icon className="icon-sm text-secondary" /> Title
</h3>

// Card
<div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm">

// Primary CTA
<button className="btn-primary focus-ring">
  Action <Icon className="icon-xs" />
</button>
```

---

**Last Updated:** 2026-06-09  
**Maintained by:** Development Team  
**Version:** 1.0.0
