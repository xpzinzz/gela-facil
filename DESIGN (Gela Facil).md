---
name: Gela Fácil
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414754'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc0'
  primary: '#0059bb'
  on-primary: '#ffffff'
  primary-container: '#0070ea'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc7ff'
  secondary: '#2559bd'
  on-secondary: '#ffffff'
  secondary-container: '#6c98ff'
  on-secondary-container: '#002f76'
  tertiary: '#006387'
  on-tertiary: '#ffffff'
  tertiary-container: '#007da9'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#b1c5ff'
  on-secondary-fixed: '#001946'
  on-secondary-fixed-variant: '#00419e'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  space-4xl: 6rem
  container-max: 1280px
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

The design system embodies the sensations of pure alpine airflow, instantaneous cooling, and clinical technical precision. It addresses residential consumers needing rapid climate relief and commercial operators requiring enterprise-grade refrigeration and ice generation. 

The emotional signature is clean, brisk, dependable, and revitalizing. It merges high-velocity thermal performance with user-friendly accessibility.

The aesthetic blends **Modern Tech Minimalism** with subtle **Sub-Zero Glassmorphism**:
- Crisp, airy white backgrounds anchored by vibrant electric cyan and deep ocean blues.
- Delicate frost-like translucent layers that mimic chilled glass and condensed vapor.
- Sharp aerodynamic geometry softened by rounded corners that communicate fluid airflow and comfort.

## Colors

The palette is derived directly from thermal dynamics—capturing the gradient from absolute frost to dense, deep oceanic cold.

- **Primary (`#007BFF`)**: Electric Glacial Blue. Serves as the key action driver, focal point, and primary identifier.
- **Secondary (`#0047AB`)**: Deep Ocean Marine. Provides high-contrast grounding, structural stability, and depth for headers and key navigation elements.
- **Tertiary (`#38BDF8`)**: Chilled Sky / Cyan Frost. Used for active indicators, status highlights, hover states, and cooling telemetry graphs.
- **Neutral (`#0F172A`)**: Arctic Night Slate. An ultra-deep navy tone chosen over flat black to keep text soft, readable, and tonally harmonized with cold hues.
- **Surface Accents**:
  - `surface-ice`: `#F0F9FF` (ultra-soft cyan wash for container backings and cards).
  - `surface-frost`: `rgba(255, 255, 255, 0.85)` with a 12px backdrop blur for frosted floating cards and navigation bars.
  - `border-chill`: `rgba(56, 189, 248, 0.22)` for subtle ice-edge component borders.

## Typography

Typography matches high-performance airflow mechanics:

- **Display & Headlines (`Outfit`)**: Geometric, energetic, and open. The circular letterforms reflect the circular vortex iconography of the brand mark, providing high visual impact for thermal ratings, product names, and conversion statements.
- **Body & Data (`Inter`)**: A benchmark utilitarian typeface designed for screens. Offers high legibility for technical service sheets, BTU calculators, scheduling modules, and invoice tables.

Ensure header copy retains negative letter-spacing for tight, confident branding, while UI labels under 13px utilize slight positive letter-spacing for glanceability under direct sunlight or industrial environments.

## Layout & Spacing

The layout philosophy mirrors unimpeded airflow—expansive, structured, and free of visual clutter.

- **System Grid**: 12-column adaptive layout on desktop (`1280px` max-width container), reflowing to 6 columns on tablet and 4 columns on mobile.
- **Rhythm**: Anchored strictly to an 8px vertical grid (with 4px half-steps for compact UI controls).
- **Whitespace Intent**: Generous section spacing (`space-3xl` to `space-4xl`) provides a breathable, high-end feel. Components within service cards pack tighter (`space-md` to `space-lg`) to maintain clear relational grouping.

## Elevation & Depth

Visual hierarchy uses cool, translucent light refractions rather than muddy dark shadows.

- **Level 1 (Subtle Chill / Flat Cards)**: Surface `#FFFFFF` over `#F0F9FF` canvas. Border: `1px solid rgba(56, 189, 248, 0.2)`. Shadow: `0 2px 8px -2px rgba(0, 71, 171, 0.05)`.
- **Level 2 (Hover & Active Panels)**: Shadow: `0 8px 24px -4px rgba(0, 123, 255, 0.12), 0 2px 6px -1px rgba(0, 71, 171, 0.04)`.
- **Level 3 (Modal & Floating Navigation)**: Backdrop blur: `16px`. Background: `rgba(255, 255, 255, 0.82)`. Shadow: `0 20px 40px -8px rgba(0, 35, 102, 0.18)`.
- **Atmospheric Glow**: Primary CTAs carry an ambient, electric blue under-glow (`0 8px 20px rgba(0, 123, 255, 0.35)`) that intensifies on user interaction.

## Shapes

The shape system adopts smooth, refined curvature (`roundedness: 2` / base `0.5rem`, leading to `1rem` on cards and larger interactive tiles).

- Interactive triggers, status badges, and chip filters borrow circular cues from the brand logo, often employing full-pill radii to denote agility and ease.
- Containers and functional dashboard panels maintain balanced `16px` (`rounded-lg`) borders to sustain technical authority without appearing brittle.

## Components

### Buttons
- **Primary**: Gradient fill `linear-gradient(135deg, #007BFF 0%, #0056C6 100%)`, text pure white (`#FFFFFF`), `font-weight: 600`, radius `0.75rem` to `full-pill`. Subtle rim highlight: `inset 0 1px 1px rgba(255, 255, 255, 0.35)`. Drop shadow tinted with primary electric cyan.
- **Secondary**: Translucent surface (`rgba(0, 123, 255, 0.08)`), text `#0047AB`, border `1px solid rgba(0, 123, 255, 0.25)`.
- **Tertiary / Ghost**: Transparent base with text `#007BFF`, hover background `rgba(56, 189, 248, 0.1)`.

### Cards & Service Tiles
- Crisp white or frosted backing (`rgba(255, 255, 255, 0.9)`), corner radius `1rem`.
- Micro-border: `1px solid rgba(0, 123, 255, 0.1)`.
- Accent banner or icon bucket carrying the dual-tone blue gradient found in the logo.

### Input Fields
- Background: `#FFFFFF` with inset border `1px solid #CBD5E1`.
- Focus State: Border color `#007BFF` with an electric outer halo: `0 0 0 4px rgba(56, 189, 248, 0.2)`.
- Text color `#0F172A`, placeholder `#94A3B8`.

### Chips & Badges
- Temperature / Efficiency status pills: Frosted cyan background (`#E0F2FE`), text `#0369A1`, dot indicator in active glowing `#007BFF`.
- Fully rounded pills (`border-radius: 9999px`) with padding `4px 12px`.

### Checkboxes & Radios
- Size `20px` with `4px` radius for checkboxes; full round for radios.
- Unchecked: White fill with `1.5px solid #94A3B8`.
- Checked: Electric blue `#007BFF` fill with a white checkmark or center pip, accompanied by a subtle ambient blue shadow.

### Domain-Specific Components
- **BTU / Climate Calculator Slider**: Cyan-to-electric-blue gradient track with a frosted white thumb button emitting a soft cold halo.
- **Ice Speed Metric Gauge**: Circular progress visualizer echoing the primary brand emblem, with dual-tone blue sweep paths and crisp digital readouts.