export function normalizeHexColor(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = hex[0] ?? "0";
    const g = hex[1] ?? "0";
    const b = hex[2] ?? "0";
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex}`.toLowerCase();
  }
  return null;
}

export function hexToRgb(hexColor: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return null;
  const hex = normalized.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const to2 = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`;
}

export function mixHexColors(colorA: string, colorB: string, amountB: number): string {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a || !b) return normalizeHexColor(colorA) ?? "#4f46e5";
  const t = Math.max(0, Math.min(1, amountB));
  return rgbToHex({
    r: a.r * (1 - t) + b.r * t,
    g: a.g * (1 - t) + b.g * t,
    b: a.b * (1 - t) + b.b * t,
  });
}

export function hexToRgba(color: string, alpha: number): string {
  const rgb = hexToRgb(color) ?? { r: 79, g: 70, b: 229 }; // indigo-600 fallback
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

export function buildTintPalette(baseColor: string): string[] {
  const base = normalizeHexColor(baseColor) ?? "#4f46e5";
  return [
    base,
    mixHexColors(base, "#ffffff", 0.22),
    mixHexColors(base, "#ffffff", 0.42),
    mixHexColors(base, "#000000", 0.14),
    mixHexColors(base, "#000000", 0.26),
    "#06b6d4", // cyan-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#ec4899", // pink-500
  ];
}

