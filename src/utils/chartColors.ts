/**
 * Chart Color Utilities
 * 
 * Centralized color system for all visualizations
 * Ensures brand consistency with London Bus Red theme
 */

/**
 * Brand Color Palette
 * Based on London Bus Red (--primary: 353 96% 60%)
 */
export const BRAND_COLORS = {
  // Primary London Bus Red
  primary: 'hsl(353, 96%, 60%)',
  primaryDark: 'hsl(353, 90%, 45%)',
  primaryLight: 'hsl(353, 96%, 70%)',
  
  // Complementary warm colors for multi-category charts
  accent1: 'hsl(30, 90%, 60%)',   // Orange
  accent2: 'hsl(340, 70%, 60%)',  // Pink
  accent3: 'hsl(280, 70%, 60%)',  // Purple
  accent4: 'hsl(10, 85%, 55%)',   // Red-Orange
  accent5: 'hsl(320, 75%, 58%)',  // Magenta
  accent6: 'hsl(50, 90%, 60%)',   // Yellow
  accent7: 'hsl(0, 70%, 60%)',    // Deep Red
  accent8: 'hsl(200, 80%, 55%)',  // Cyan (for contrast)
} as const;

/**
 * Get brand color palette for multi-category visualizations
 * Returns array of colors starting with London Bus Red
 */
export function getBrandColorPalette(): string[] {
  return [
    BRAND_COLORS.primary,
    BRAND_COLORS.accent1,
    BRAND_COLORS.accent2,
    BRAND_COLORS.accent3,
    BRAND_COLORS.accent4,
    BRAND_COLORS.accent5,
    BRAND_COLORS.accent6,
    BRAND_COLORS.accent7,
    BRAND_COLORS.accent8,
  ];
}

/**
 * Generate gradient colors for sequential data
 * Creates a gradient from light to dark based on London Bus Red
 * 
 * @param count Number of colors needed
 * @param reverse If true, goes from dark to light
 */
export function getBrandGradient(count: number, reverse: boolean = false): string[] {
  const colors: string[] = [];
  const baseHue = 353; // London Bus Red hue
  const baseSaturation = 96;
  
  for (let i = 0; i < count; i++) {
    const progress = i / Math.max(count - 1, 1);
    const lightness = reverse 
      ? 40 + (progress * 30)  // 40% to 70%
      : 70 - (progress * 30); // 70% to 40%
    
    colors.push(`hsl(${baseHue}, ${baseSaturation}%, ${lightness}%)`);
  }
  
  return colors;
}

/**
 * Get color by index with wrapping
 * Useful for charts with unknown number of categories
 */
export function getColorByIndex(index: number): string {
  const palette = getBrandColorPalette();
  return palette[index % palette.length];
}

/**
 * Get primary color with custom opacity
 * Useful for scatter plots and overlays
 */
export function getPrimaryWithOpacity(opacity: number): string {
  return `hsl(353, 96%, 60%, ${opacity})`;
}

/**
 * Chart-specific color configurations
 */
export const CHART_COLORS = {
  // For line/area charts - pure primary with gradient fill
  line: {
    stroke: BRAND_COLORS.primary,
    fill: 'url(#colorValue)', // Gradient defined in component
  },
  
  // For bar charts - gradient effect
  bar: {
    getColor: (index: number, total: number) => {
      if (total <= 1) return BRAND_COLORS.primary;
      return getBrandGradient(total)[index];
    },
  },
  
  // For pie charts - full palette
  pie: {
    palette: getBrandColorPalette(),
  },
  
  // For scatter plots - primary with opacity
  scatter: {
    fill: BRAND_COLORS.primary,
    fillOpacity: 0.6,
  },
} as const;
