# PortPilot Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based + Code-First Aesthetic

Drawing inspiration from:
- **GitHub**: Clean developer-focused UI, code blocks, syntax highlighting
- **Linear**: Sharp typography, precise spacing, minimal color usage
- **Vercel**: Dark mode excellence, gradient accents, modern SaaS feel
- **VS Code**: Terminal aesthetics, monospace fonts, developer comfort

**Core Design Principles**:
1. Developer-first aesthetics that feel technical yet polished
2. Content-forward layouts that showcase projects, not chrome
3. Theme flexibility while maintaining consistent core UX
4. Performance-conscious with fast, snappy interactions

## Color Palette

**Dark Mode (Primary)**:
- Background: 222 14% 9% (deep charcoal)
- Surface: 222 14% 12% (elevated panels)
- Surface Hover: 222 14% 15%
- Border: 222 14% 18%
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 71%
- Text Muted: 0 0% 50%
- Primary Brand: 220 91% 62% (vibrant blue - trust, tech)
- Primary Hover: 220 91% 55%
- Accent: 142 76% 56% (GitHub-inspired green for success states)
- Destructive: 0 72% 51%

**Light Mode**:
- Background: 0 0% 100%
- Surface: 0 0% 98%
- Surface Hover: 0 0% 96%
- Border: 220 13% 91%
- Text Primary: 222 14% 9%
- Text Secondary: 215 16% 47%
- Text Muted: 215 20% 65%
- Primary Brand: 220 91% 45%
- Primary Hover: 220 91% 38%

## Typography

**Font Stack**:
- **Headings**: Inter (600-700 weight) - modern, tech-forward
- **Body**: Inter (400-500 weight)
- **Code/Mono**: JetBrains Mono - used in Terminal theme and code snippets

**Scale**:
- Mega Heading: text-6xl (60px) - portfolio hero names
- Page Title: text-4xl (36px) - dashboard headers
- Section Heading: text-2xl (24px)
- Card Title: text-xl (20px)
- Body Large: text-base (16px)
- Body: text-sm (14px)
- Caption: text-xs (12px)

**Line Heights**: Tight for headings (leading-tight), relaxed for body (leading-relaxed)

## Layout System

**Spacing Primitives**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24
- Micro spacing: gap-1, p-2 (badges, chips)
- Component internal: p-4, gap-4 (cards, buttons)
- Section spacing: py-12, py-16, py-24 (page sections)
- Container max-width: max-w-7xl with px-6

**Grid System**:
- Dashboard: 12-column responsive grid
- Portfolio themes: Flexible based on template
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)

## Component Library

### Dashboard Components

**Navigation**:
- Top nav: Sticky, blur background (backdrop-blur-sm), height h-16
- Logo + main tabs (Overview, Repos, Appearance, Billing, Publishing)
- Right: User avatar dropdown + theme toggle
- Mobile: Hamburger menu with slide-in drawer

**Repo Selection Cards**:
- Compact horizontal cards with: repo icon, name, description (truncated), language badge, star count, last updated
- Right side: Toggle switch (Add to portfolio)
- Hover: Subtle lift (shadow-md), background shift
- Language badge: Small pill with color dot (GitHub language colors)

**Project Reorder Interface**:
- Drag handles (6 dots icon) on left
- Thumbnail preview (if available)
- Project name + repo link
- Drag state: opacity-50, shadow-2xl, blue border

**Theme Selector**:
- 4 preview cards in 2x2 grid (lg:grid-cols-4)
- Live preview thumbnail with gradient overlay
- Selected state: blue border, checkmark badge
- Accent color picker: Color swatches grid below theme

**Sync Button**:
- Prominent CTA with loading spinner state
- Show last sync timestamp below
- Success: Green checkmark animation
- Error: Red with retry option

### Portfolio Theme Components

**Theme 1: Sleek** (Default, Professional)
- Hero: Full-width with gradient overlay (from primary/50 to transparent), height 60vh
- Profile: Centered avatar (128px), name (text-5xl), bio (text-xl text-muted)
- Projects: 3-column grid (md:grid-cols-2 lg:grid-cols-3)
- Cards: Cover image (aspect-video), gradient overlay on hover, title, description, language badges row, stats (stars/forks)
- Footer: Social links, copyright, minimal

**Theme 2: CardGrid** (Creative, Visual)
- Masonry layout using CSS columns (md:columns-2 lg:columns-3)
- No hero, immediate grid after compact header (avatar + name inline)
- Cards: Variable height based on content, rounded-2xl, shadow-lg
- Rich cards: Large image, full description, tech stack badges, all metadata visible
- Hover: Slight scale (scale-105), deeper shadow

**Theme 3: Terminal** (Developer, Playful)
- Simulated terminal window with title bar (red/yellow/green dots)
- Monospace font (JetBrains Mono) throughout
- ASCII art avatar or pixel art style
- Command prompt aesthetic: `> ls projects/`
- Projects listed as file tree or command outputs
- Green text on black background (matrix-style option)
- Typing animation on initial load (subtle, one-time)

**Theme 4: Magazine** (Editorial, Story-driven)
- Large hero: Featured project with full-bleed image (80vh)
- Overlay: Project name, description, CTA "View Project"
- Article-style layout: alternating left/right image-text blocks
- Wide images (aspect-video or aspect-[21/9])
- Pull quotes for repo descriptions
- Generous whitespace, max-w-4xl content width
- Typography-heavy with large headings

### Shared Portfolio Elements

**Project Cards** (all themes use variations):
- Image: aspect-video with object-cover, fallback gradient
- Language pills: Inline flex with gap-2, text-xs, px-2 py-1, rounded-full
- Stats row: Star icon + count, Fork icon + count, Last updated
- Links: View Project (external), View Code (GitHub)

**Navigation** (portfolio pages):
- Minimal sticky header: Logo/Name left, Theme switcher right (if enabled)
- No dashboard chrome on public views

**Footer**:
- Social icons (GitHub required, X/LinkedIn/Website optional)
- "Powered by PortPilot" badge for Free tier
- Theme switcher if not in header

## Images

**Dashboard**:
- No hero image needed, focus on functionality
- Repo thumbnails: Use opengraph images or fallback to gradient

**Portfolio Themes**:

**Sleek**: 
- Hero background: Abstract gradient mesh or geometric pattern (not photo)
- Project covers: Fetch from README or use generated placeholder with project name overlay

**CardGrid**: 
- Each card needs strong image - priority on README screenshots
- No hero image

**Terminal**: 
- No traditional images, ASCII art or pixel art for profile
- Code screenshots as project "previews"

**Magazine**: 
- Large hero image from featured project (first project)
- Each project needs compelling wide image (aspect-[21/9])
- Use README images or generated covers with project titles

## Animation Guidelines

**Use Sparingly**:
- Page transitions: Subtle fade (150ms)
- Card hovers: Scale and shadow (200ms ease-out)
- Toggle switches: Smooth slide (150ms)
- Loading states: Spinner or skeleton, no elaborate animations
- Terminal theme only: Single typing animation on mount (can be disabled)

**No Animations**:
- Parallax scrolling
- Scroll-triggered reveals
- Continuous animations

## Accessibility & Quality

- Maintain WCAG AA contrast (4.5:1 text, 3:1 UI elements)
- Focus rings: 2px offset, primary color
- All interactive elements keyboard accessible
- Skip links on portfolio pages
- Alt text required for all project images
- Responsive at all breakpoints, mobile-first
- Dark mode as default, light mode fully supported with same attention to detail