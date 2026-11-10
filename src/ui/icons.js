/**
 * icons.js - Crisp, Bespoke Human-Crafted SVG Icon System
 * Replaces generic AI emoji placeholders with authentic vector iconography.
 */

export const Icons = {
  building: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
    </svg>`,

  washroom: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h4v16h-4M4 4h4v16H4M4 10h4M16 10h4M10 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0m2 3v11"/>
    </svg>`,

  photo: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>`,

  layers: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>`,

  sun: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>`,

  moon: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,

  rotate: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>`,

  roof: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,

  dashboard: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>`,

  clipboard: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M9 12h6M9 16h6"/>
    </svg>`,

  users: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,

  power: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,

  search: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" x2="16.65" y1="21" y2="16.65"/>
    </svg>`,

  check: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

  alert: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,

  shield: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,

  lock: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,

  key: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21 2-2 2m-1.5 1.5L16 7l-2-2m-4.5 4.5a5 5 0 1 0 7.07 7.07 5 5 0 0 0-7.07-7.07z"/>
    </svg>`,

  graduate: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>`,

  idCard: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="14" x="3" y="5" rx="2"/>
      <line x1="7" x2="11" y1="10" y2="10"/>
      <line x1="7" x2="13" y1="14" y2="14"/>
      <circle cx="16" cy="11" r="2"/>
    </svg>`,

  info: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,

  mouse: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="3" width="12" height="18" rx="6"/>
      <line x1="12" y1="7" x2="12" y2="11"/>
    </svg>`,

  target: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`,

  plus: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

  arrowRight: (cls = '', size = 16) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>`,

  arrowLeft: (cls = '', size = 16) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>`,

  close: (cls = '', size = 16) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

  eye: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,

  fan: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 9c3.5 0 6.5-1.2 6.5-3.5S15.5 2 12 2s-6.5 1.2-6.5 3.5S8.5 9 12 9z"/>
      <path d="M9 12c0 3.5-1.2 6.5-3.5 6.5S2 15.5 2 12s1.2-6.5 3.5-6.5S9 8.5 9 12z"/>
      <path d="M12 15c-3.5 0-6.5 1.2-6.5 3.5S8.5 22 12 22s6.5-1.2 6.5-3.5-1.2-3.5-6.5-3.5z"/>
      <path d="M15 12c0-3.5 1.2-6.5 3.5-6.5S22 8.5 22 12s-1.2 6.5-3.5 6.5-3.5-1.2-3.5-6.5z"/>
    </svg>`,

  lightbulb: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6M10 22h4"/>
    </svg>`,

  zap: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,

  droplet: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>`,

  wrench: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>`,

  sparkles: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>
    </svg>`,

  map: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>`,

  mapPin: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,

  filter: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>`,

  refresh: (cls = '', size = 18) => `
    <svg class="ui-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>`
};

/**
 * Returns structured metadata & SVG generator for a complaint category
 */
export function getCategoryIconInfo(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('fan')) {
    return { name: 'Fan', icon: (cls, size) => Icons.fan(cls, size), color: '#38bdf8', badgeClass: 'badge-fan' };
  }
  if (cat.includes('light') || cat.includes('lamp') || cat.includes('bulb')) {
    return { name: 'Light', icon: (cls, size) => Icons.lightbulb(cls, size), color: '#facc15', badgeClass: 'badge-light' };
  }
  if (cat.includes('water') || cat.includes('leak')) {
    return { name: 'Water Leakage', icon: (cls, size) => Icons.droplet(cls, size), color: '#06b6d4', badgeClass: 'badge-water' };
  }
  if (cat.includes('plumb') || cat.includes('drain') || cat.includes('pipe') || cat.includes('tap') || cat.includes('sewer')) {
    return { name: 'Plumbing', icon: (cls, size) => Icons.wrench(cls, size), color: '#0ea5e9', badgeClass: 'badge-plumbing' };
  }
  if (cat.includes('electric') || cat.includes('switch') || cat.includes('breaker') || cat.includes('power') || cat.includes('wire')) {
    return { name: 'Electrical', icon: (cls, size) => Icons.zap(cls, size), color: '#f59e0b', badgeClass: 'badge-electrical' };
  }
  if (cat.includes('clean') || cat.includes('waste') || cat.includes('trash') || cat.includes('refuse') || cat.includes('sanit')) {
    return { name: 'Cleaning', icon: (cls, size) => Icons.sparkles(cls, size), color: '#10b981', badgeClass: 'badge-cleaning' };
  }
  return { name: 'Other', icon: (cls, size) => Icons.alert(cls, size), color: '#ef4444', badgeClass: 'badge-other' };
}
