import { getStoredSalon } from "./salon-storage";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastForeground(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  return luminance(...rgb) > 0.4 ? "#000000" : "#ffffff";
}

/**
 * Apply salon theme colors as CSS custom properties on :root
 * so every Tailwind/shadcn utility picks them up globally.
 */
export function applySalonTheme(): void {
  const salon = getStoredSalon();
  if (!salon) return;

  const primary = (salon.theme_primary_color as string)?.trim();
  const accent = (salon.theme_accent_color as string)?.trim();
  const bg = (salon.theme_bg_color as string)?.trim();

  if (!primary && !accent && !bg) return;

  const root = document.documentElement;

  if (primary) {
    const fg = contrastForeground(primary);
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-foreground", fg);
    root.style.setProperty("--ring", primary);
    root.style.setProperty("--sidebar-primary", primary);
    root.style.setProperty("--sidebar-primary-foreground", fg);
  }

  if (accent) {
    const fg = contrastForeground(accent);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-foreground", fg);
    root.style.setProperty("--sidebar-accent", accent);
    root.style.setProperty("--sidebar-accent-foreground", fg);
  }

  if (bg) {
    root.style.setProperty("--chart-1", primary || bg);
  }
}
