# Rocketium Design System

## Color Palette

This design system uses a visually harmonious and accessible color palette that follows WCAG 2.1 AA contrast guidelines. It supports both light and dark modes based on the user's system preferences.

### Core Colors (Light Theme)

| Variable | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | Indigo | `#4f46e5` | Primary actions, highlights |
| `--primary-hover` | Dark Indigo | `#4338ca` | Hover states for primary actions |
| `--bg-main` | Off-white | `#fcfcfd` | Main application background |
| `--bg-card` | White | `#ffffff` | Cards, panels, headers |
| `--text-main` | Dark Gray | `#111827` | Primary text, high contrast |
| `--text-muted` | Medium Gray | `#4b5563` | Secondary text, labels |
| `--success` | Emerald | `#059669` | Success messages, positive actions |
| `--danger` | Red | `#dc2626` | Error messages, destructive actions |

### Core Colors (Dark Theme)

| Variable | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | Light Indigo | `#818cf8` | Primary actions, highlights |
| `--bg-main` | Navy | `#0f172a` | Main application background |
| `--bg-card` | Slate | `#1e293b` | Cards, panels, headers |
| `--text-main` | White/Slate | `#f8fafc` | Primary text, high contrast |
| `--text-muted` | Slate Gray | `#94a3b8` | Secondary text, labels |

## Accessibility Standards

### Contrast Ratios
- **Primary Text**: Main text on backgrounds maintains a contrast ratio of at least **7:1** (exceeding WCAG AAA).
- **Muted Text**: Secondary text maintains a contrast ratio of at least **4.5:1** (meeting WCAG AA).
- **Interactive Elements**: All buttons and inputs have clear focus states (`--ring`) and hover transitions.

### Visual Cues
- Color is never used as the sole indicator of information.
- Interactive elements have distinct hover and active states.
- Inputs have clearly defined borders and focus rings.

## Implementation

The color system is implemented using CSS custom properties (variables) in `src/App.css`.

```css
:root {
  --primary: #4f46e5;
  /* ... other variables ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #818cf8;
    /* ... override variables for dark mode ... */
  }
}
```

To use a color in a component:
```css
.my-component {
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border);
}
```
