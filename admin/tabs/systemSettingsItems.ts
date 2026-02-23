export type SystemSettingsSectionId =
  | 'GENERAL_SETTING'
  | 'SYSTEM_CONFIGURATION'
  | 'LOGO_FAVICON'
  | 'APPEARANCE_THEME'
  | 'NOTIFICATION_SETTING'
  | 'PAYMENT_GATEWAYS'
  | 'WITHDRAWALS_METHODS'
  | 'SEO_CONFIGURATION'
  | 'MANAGE_FRONTEND'
  | 'MANAGE_PAGES'
  | 'MANAGE_TEMPLATES'
  | 'KYC_SETTING'
  | 'ADS_SETTING'
  | 'SOCIAL_LOGIN_SETTING'
  | 'LANGUAGE'
  | 'POLICY_PAGES'
  | 'MAINTENANCE_MODE'
  | 'GDPR_COOKIE'
  | 'CUSTOM_CSS'
  | 'SITEMAP_XML'
  | 'ROBOTS_TXT';

export interface SystemSettingsItem {
  id: SystemSettingsSectionId;
  title: string;
  subtitle: string;
  iconClass: string;
  accentClass: string;
}

export const SYSTEM_SETTINGS_ITEMS: SystemSettingsItem[] = [
  {
    id: 'GENERAL_SETTING',
    title: 'General Setting',
    subtitle: 'Core identity and basic profile of the platform.',
    iconClass: 'fa-solid fa-gear',
    accentClass: 'from-[#4f46e5] to-[#6366f1]',
  },
  {
    id: 'SYSTEM_CONFIGURATION',
    title: 'System Configuration',
    subtitle: 'Control global behaviour, time, and security defaults.',
    iconClass: 'fa-solid fa-sliders',
    accentClass: 'from-[#0ea5e9] to-[#22c55e]',
  },
  {
    id: 'APPEARANCE_THEME',
    title: 'Appearance & Theme',
    subtitle: 'Switch between dark, light and custom admin modes.',
    iconClass: 'fa-solid fa-moon',
    accentClass: 'from-[#fcd535] to-[#22c55e]',
  },
  {
    id: 'LOGO_FAVICON',
    title: 'Logo & Favicon',
    subtitle: 'Upload and manage primary brand assets.',
    iconClass: 'fa-solid fa-image',
    accentClass: 'from-[#f97316] to-[#facc15]',
  },
  {
    id: 'NOTIFICATION_SETTING',
    title: 'Notification Setting',
    subtitle: 'Configure email, push and in‑app alerts.',
    iconClass: 'fa-solid fa-bell',
    accentClass: 'from-[#ec4899] to-[#a855f7]',
  },
  {
    id: 'PAYMENT_GATEWAYS',
    title: 'Payment Gateways',
    subtitle: 'Connect Binance Pay and future providers.',
    iconClass: 'fa-solid fa-credit-card',
    accentClass: 'from-[#22c55e] to-[#0f766e]',
  },
  {
    id: 'WITHDRAWALS_METHODS',
    title: 'Withdrawals Methods',
    subtitle: 'Define cash‑out channels and rules.',
    iconClass: 'fa-solid fa-building-columns',
    accentClass: 'from-[#f97316] to-[#ef4444]',
  },
  {
    id: 'SEO_CONFIGURATION',
    title: 'SEO Configuration',
    subtitle: 'Meta tags, OG data and search optimisation.',
    iconClass: 'fa-solid fa-magnifying-glass-chart',
    accentClass: 'from-[#22c55e] to-[#84cc16]',
  },
  {
    id: 'MANAGE_FRONTEND',
    title: 'Manage Frontend',
    subtitle: 'Homepage banners, call‑to‑actions and sections.',
    iconClass: 'fa-solid fa-display',
    accentClass: 'from-[#0ea5e9] to-[#6366f1]',
  },
  {
    id: 'MANAGE_PAGES',
    title: 'Manage Pages',
    subtitle: 'Static CMS pages and content blocks.',
    iconClass: 'fa-solid fa-file-lines',
    accentClass: 'from-[#a855f7] to-[#6366f1]',
  },
  {
    id: 'MANAGE_TEMPLATES',
    title: 'Manage Templates',
    subtitle: 'Dynamic email and notification templates.',
    iconClass: 'fa-solid fa-envelopes-bulk',
    accentClass: 'from-[#f97316] to-[#ec4899]',
  },
  {
    id: 'KYC_SETTING',
    title: 'KYC Setting',
    subtitle: 'Control identity verification and documents.',
    iconClass: 'fa-solid fa-user-shield',
    accentClass: 'from-[#22c55e] to-[#0ea5e9]',
  },
  {
    id: 'ADS_SETTING',
    title: 'Ads Setting',
    subtitle: 'Promotional banners and tracking pixels.',
    iconClass: 'fa-solid fa-rectangle-ad',
    accentClass: 'from-[#facc15] to-[#f97316]',
  },
  {
    id: 'SOCIAL_LOGIN_SETTING',
    title: 'Social Login Setting',
    subtitle: 'Google, Facebook and other OAuth providers.',
    iconClass: 'fa-brands fa-google',
    accentClass: 'from-[#0ea5e9] to-[#6366f1]',
  },
  {
    id: 'LANGUAGE',
    title: 'Language',
    subtitle: 'Localisation and multi‑language keywords.',
    iconClass: 'fa-solid fa-language',
    accentClass: 'from-[#22c55e] to-[#14b8a6]',
  },
  {
    id: 'POLICY_PAGES',
    title: 'Policy Pages',
    subtitle: 'Terms, privacy and legal documents.',
    iconClass: 'fa-solid fa-scale-balanced',
    accentClass: 'from-[#6366f1] to-[#22c55e]',
  },
  {
    id: 'MAINTENANCE_MODE',
    title: 'Maintenance Mode',
    subtitle: 'Safely pause trading and show banners.',
    iconClass: 'fa-solid fa-screwdriver-wrench',
    accentClass: 'from-[#f97316] to-[#ef4444]',
  },
  {
    id: 'GDPR_COOKIE',
    title: 'GDPR Cookie',
    subtitle: 'Cookie banner and consent preferences.',
    iconClass: 'fa-solid fa-cookie-bite',
    accentClass: 'from-[#ec4899] to-[#6366f1]',
  },
  {
    id: 'CUSTOM_CSS',
    title: 'Custom CSS',
    subtitle: 'Fine‑tune branding with custom styles.',
    iconClass: 'fa-solid fa-code',
    accentClass: 'from-[#0ea5e9] to-[#22c55e]',
  },
  {
    id: 'SITEMAP_XML',
    title: 'Sitemap XML',
    subtitle: 'Keep search engines perfectly indexed.',
    iconClass: 'fa-solid fa-network-wired',
    accentClass: 'from-[#22c55e] to-[#84cc16]',
  },
  {
    id: 'ROBOTS_TXT',
    title: 'Robots txt',
    subtitle: 'Control crawler access per environment.',
    iconClass: 'fa-solid fa-robot',
    accentClass: 'from-[#6366f1] to-[#0ea5e9]',
  },
];
