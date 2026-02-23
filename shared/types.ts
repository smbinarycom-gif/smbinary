
export enum AssetType {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  STOCKS = 'Stocks'
}

export interface PayoutSchedule {
  id: string;
  startHour: number; // 0-23
  endHour: number;   // 0-23
  payout: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  price: number;
  change24h: number;
  payout: number;
  isActive?: boolean;
  forceOTC?: boolean;
  iconUrl?: string;
  payoutSchedule?: PayoutSchedule[];
}

export interface Trade {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  startTime: number; 
  expiryTime: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'TIE';
  payoutAtTrade: number;
  userId?: string;
  accountType: 'DEMO' | 'LIVE';
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: 'BINANCE_PAY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: number;
  proofUrl?: string;
  transactionId?: string;
  targetWallet?: string;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
}

export interface AiAnalystSettings {
  isEnabled: boolean;
  status: 'ACTIVE' | 'MAINTENANCE';
  maintenanceMessage: string;
  minConfidence: number;
  targetDevices: ('MOBILE' | 'DESKTOP')[];
  targetUsers: string[];
  targetIps: string[];
  activeUntil: number | null;
}

export interface LeaderboardConfig {
  minTradeCount: number;
  minTradeVolume: number;
  rankingBasis: 'NET_PROFIT' | 'ROI' | 'TOTAL_VOLUME';
  excludedUserIds: string[];
  autoRefreshEnabled: boolean;
  refreshInterval: number; // in seconds
}

export type AdminThemeMode = 'DARK' | 'LIGHT' | 'CUSTOM';

export type DeviceCategory = 'DESKTOP' | 'LAPTOP' | 'TABLET' | 'MOBILE';

export type DeviceOrientation = 'PORTRAIT' | 'LANDSCAPE';

export type DevicePresetStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';

export interface DeviceViewPreset {
  id: string;
  name: string;
  category: DeviceCategory;
  width: number;
  height: number;
  note?: string;
  orientation?: DeviceOrientation;
  status?: DevicePresetStatus;
}

export interface AdminThemeSettings {
  mode: AdminThemeMode;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  sidebarBackground: string;
  headerBackground: string;
  surfaceBackground: string;
  textColor: string;
}

export type LogoUsageType =
  | 'MAIN_WEBSITE'
  | 'ADMIN_PANEL'
  | 'MOBILE'
  | 'DARK_MODE'
  | 'LIGHT_MODE'
  | 'EMAIL'
  | 'FOOTER';

export interface BrandingLogos {
  MAIN_WEBSITE?: string;
  ADMIN_PANEL?: string;
  MOBILE?: string;
  DARK_MODE?: string;
  LIGHT_MODE?: string;
  EMAIL?: string;
  FOOTER?: string;
}

export interface BrandingFavicons {
  favicon16?: string;
  favicon32?: string;
  favicon48?: string;
  appleTouchIcon?: string;
  androidChrome192?: string;
  pwa512?: string;
  windowsTile?: string;
}

export interface BrandingSizing {
  desktopLogoHeight: number;
  mobileLogoHeight: number;
  sidebarLogoScale: number; // 0.5 - 2.0
  retinaScale: number; // 1x, 1.5x, 2x
}

export interface BrandingSnapshot {
  id: string;
  label: string;
  createdAt: number;
  logos: BrandingLogos;
  favicons: BrandingFavicons;
  sizing: BrandingSizing;
  primaryBrandColor: string;
}

export interface BrandingSettings {
  logos: BrandingLogos;
  favicons: BrandingFavicons;
  sizing: BrandingSizing;
  primaryBrandColor: string;
  brandingHistory: BrandingSnapshot[];
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'BROWSER_PUSH' | 'MOBILE_PUSH' | 'TELEGRAM' | 'WHATSAPP';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificationMasterToggles {
  systemNotificationsEnabled: boolean;
  userAlertsEnabled: boolean;
  financialAlertsEnabled: boolean;
  securityAlertsEnabled: boolean;
  marketingAnnouncementsEnabled: boolean;
  emergencyOverrideActive: boolean;
}

export interface NotificationChannelConfig {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  browserPushEnabled: boolean;
  mobilePushEnabled: boolean;
  telegramEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface NotificationEventChannelRule {
  eventKey:
    | 'REGISTRATION_WELCOME'
    | 'DEPOSIT_UPDATE'
    | 'WITHDRAWAL_UPDATE'
    | 'KYC_STATUS_CHANGE'
    | 'TRADE_RESULT'
    | 'BIG_PROFIT_ALERT'
    | 'SUSPICIOUS_LOGIN'
    | 'PASSWORD_CHANGE'
    | 'ACCOUNT_LOCKED';
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type:
    | 'WELCOME'
    | 'DEPOSIT_CONFIRMATION'
    | 'WITHDRAWAL_APPROVAL'
    | 'SECURITY_ALERT';
  language: string;
  subject?: string;
  body: string;
  channels: NotificationChannel[];
}

export interface UserNotificationDefaults {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  marketingOptIn: boolean;
  quietHoursEnabled: boolean;
  quietHoursFrom?: string; // HH:mm
  quietHoursTo?: string; // HH:mm
}

export interface NotificationSchedulingSettings {
  allowScheduledAnnouncements: boolean;
  allowMaintenanceScheduling: boolean;
  timezoneAwareDelivery: boolean;
  defaultSendDelaySeconds: number;
}

export interface InAppNotificationUxSettings {
  toastPosition: 'TOP_RIGHT' | 'TOP_LEFT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT';
  autoDismissSeconds: number;
  soundEnabled: boolean;
  unreadBadgeEnabled: boolean;
}

export interface NotificationLoggingSettings {
  keepHistoryDays: number;
  trackOpens: boolean;
  trackClicks: boolean;
  enableResend: boolean;
}

export interface PushNotificationSettings {
  browserPushEnabled: boolean;
  mobilePushEnabled: boolean;
  requireExplicitOptIn: boolean;
}

export interface NotificationLanguageSettings {
  enabledLanguages: string[];
  defaultLanguage: string;
}

export interface NotificationQueueSettings {
  preventDuplicates: boolean;
  rateLimitPerMinute: number;
  enableQueue: boolean;
  maxRetries: number;
}

export interface NotificationSettings {
  master: NotificationMasterToggles;
  channels: NotificationChannelConfig;
  eventRules: NotificationEventChannelRule[];
  templates: NotificationTemplate[];
  userDefaults: UserNotificationDefaults;
  scheduling: NotificationSchedulingSettings;
  inAppUx: InAppNotificationUxSettings;
  logging: NotificationLoggingSettings;
  push: PushNotificationSettings;
  language: NotificationLanguageSettings;
  queueing: NotificationQueueSettings;
}

export interface MarketSettings {
  marketMode: 'REAL' | 'OTC';
  payoutMultiplier: number;
  marketTrend: 'RANDOM' | 'PUMP' | 'DUMP';
  otcLossPercentage: number;
  manipulationTarget: ('DEMO' | 'LIVE')[];
  forceLoss: boolean;
  isKillSwitchActive: boolean;
  maintenanceMode: boolean;
  globalAnnouncement: string;
  activeSymbols: string[];
  investmentShortcuts: number[];
  minInvestment: number;
  maxInvestment: number;
  activeTimeFrames: string[];
  activeTradeDurations: number[];
  aiAnalyst: AiAnalystSettings;
  adminBinancePayId: string;
  isLeaderboardEnabled: boolean;
  leaderboardConfig: LeaderboardConfig; // New integrated config
  adminTheme: AdminThemeSettings;
  branding: BrandingSettings;
  notifications: NotificationSettings;
  deviceViewPresets: DeviceViewPreset[];
  activeDeviceCategory: DeviceCategory;
}

export interface AdminNote {
  id: string;
  content: string;
  date: number;
  author: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: number;
  ip: string;
  details: string;
  type: 'INFO' | 'WARNING' | 'DANGER';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  balance: number;
  bonusBalance: number; 
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  forceResult: 'NONE' | 'WIN' | 'LOSS';
  maxBetSize: number; 
  dailyProfitLimit: number; 
  payoutOverride: number; 
  tradeDelayMs: number; 
  joinedAt: number;
  ipAddress: string;
  country: string;
  device: string;
  lastLogin: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTurnover: number; 
  netPnL: number; 
  isBalanceFrozen: boolean;
  forcePasswordReset: boolean;
  twoFactorEnabled: boolean; 
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  kycDocs?: { front: string; back: string; selfie: string }; 
  riskScore: number; 
  riskLabel: 'VIP' | 'HIGH_RISK' | 'REGULAR' | 'WHALE';
  tags: string[];
  activityLogs: ActivityLog[];
  adminNotes: AdminNote[];
  referralCode?: string;
  uplineId?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}
