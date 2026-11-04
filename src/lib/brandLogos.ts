// ==============================================================================
// ELNIX POWERZONE - BRAND LOGO UTILITIES & AUTHENTIC ASSET DEFINITIONS
// Provides authentic vector logos matching Reference Image 2 for partner brands,
// and detects unrelated product stock images / broken hotlinks.
// ==============================================================================

/**
 * Checks whether an image URL is an unrelated stock photo (e.g., Unsplash seed images)
 * or a broken external hotlink that fails in browsers.
 */
export function isUnrelatedBrandImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed || trimmed.includes('placeholder')) return true;
  // Unsplash photos seeded initially were generic product/hardware pictures, not brand logos
  if (trimmed.includes('images.unsplash.com')) return true;
  // Wikimedia Commons hotlinks return HTTP 400/403 due to CORS / anti-hotlink policies
  if (trimmed.includes('upload.wikimedia.org')) return true;
  return false;
}

/**
 * Helper to encode an SVG string into a robust data URI.
 */
function svgToDataUri(svg: string): string {
  // Use clean URI encoding for maximum browser compatibility without base64 bloat
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

/**
 * High-fidelity vector SVG definitions matching the authentic branding in Reference Image 2.
 */
export const AUTHENTIC_BRAND_SVGS: Record<string, string> = {
  amaron: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <rect width="160" height="52" rx="8" fill="#74b433"/>
      <text x="80" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2">AMARON</text>
    </svg>
  `),

  exide: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <circle cx="28" cy="26" r="14" fill="#1d4ed8"/>
      <path d="M29 17 L23 26 L27 26 L26 35 L34 25 L29 25 Z" fill="#ffffff"/>
      <text x="48" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#dc2626" letter-spacing="1">EXIDE</text>
    </svg>
  `),

  luminous: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <rect width="160" height="52" rx="8" fill="#0b3b82"/>
      <text x="80" y="33" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">LUMINOUS</text>
    </svg>
  `),

  'v-guard': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <rect width="160" height="52" rx="8" fill="#0b0f19" stroke="#1e293b" stroke-width="2"/>
      <text x="80" y="33" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#eab308" text-anchor="middle" letter-spacing="2">V-GUARD</text>
    </svg>
  `),

  racold: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <rect width="160" height="52" rx="8" fill="#dc2626"/>
      <path d="M28 20 Q31 23 28 26 Q25 29 28 32 M34 18 Q37 22 34 26 Q31 30 34 34" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <text x="96" y="33" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">Racold</text>
    </svg>
  `),

  bosch: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <circle cx="26" cy="26" r="14" fill="none" stroke="#dc2626" stroke-width="3"/>
      <rect x="24" y="16" width="4" height="20" fill="#dc2626"/>
      <text x="48" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#dc2626" letter-spacing="1.5">BOSCH</text>
    </svg>
  `),

  'sf sonic': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <path d="M22 17 L15 28 L21 28 L19 36 L29 25 L23 25 Z" fill="#1d4ed8"/>
      <text x="88" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#1d4ed8" text-anchor="middle" letter-spacing="1">SF SONIC</text>
    </svg>
  `),

  livguard: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <polygon points="18,17 32,26 18,35" fill="#ea580c"/>
      <text x="90" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ea580c" text-anchor="middle" letter-spacing="1">Livguard</text>
    </svg>
  `),

  finolex: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <circle cx="24" cy="26" r="10" fill="#dc2626"/>
      <text x="90" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="0.5">Finolex</text>
    </svg>
  `),

  'rr kabel': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <text x="80" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#1e40af" text-anchor="middle" letter-spacing="1">RR KABEL</text>
    </svg>
  `),

  polycab: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <polygon points="24,16 34,26 24,36 14,26" fill="#b91c1c"/>
      <text x="90" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#b91c1c" text-anchor="middle" letter-spacing="1">POLYCAB</text>
    </svg>
  `),

  cera: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <text x="80" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#0891b2" text-anchor="middle" letter-spacing="2">CERA</text>
    </svg>
  `),

  somany: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <text x="80" y="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="1.5">SOMANY</text>
    </svg>
  `),

  jaquar: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
      <text x="80" y="34" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#065f46" text-anchor="middle" letter-spacing="1">Jaquar</text>
    </svg>
  `),
};

/**
 * Returns an authentic vector SVG data URI for a given brand name or slug.
 */
export function getAuthenticBrandSvg(nameOrSlug: string = ''): string | null {
  const norm = nameOrSlug.toLowerCase().trim().replace(/_/g, '-');
  if (AUTHENTIC_BRAND_SVGS[norm]) return AUTHENTIC_BRAND_SVGS[norm];

  // Partial matches
  for (const [key, svg] of Object.entries(AUTHENTIC_BRAND_SVGS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return svg;
    }
  }

  return null;
}

/**
 * Returns the effective display URL for a brand logo.
 * If the brand already has a valid Cloudinary/custom image, returns that.
 * If the brand has an unrelated stock photo or broken hotlink, returns the authentic vector SVG.
 */
export function getEffectiveBrandLogoUrl(brand: { name?: string; slug?: string; logo_url?: string }): string {
  const currentUrl = brand.logo_url?.trim() || '';
  if (currentUrl && !isUnrelatedBrandImage(currentUrl)) {
    return currentUrl;
  }
  const authenticSvg = getAuthenticBrandSvg(brand.slug || brand.name || '');
  if (authenticSvg) {
    return authenticSvg;
  }
  return currentUrl;
}

