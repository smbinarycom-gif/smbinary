import React, { useMemo, useState, useEffect } from 'react';
import { MarketSettings, PaymentRequest, User, AdminThemeSettings } from '../../shared/types.ts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  pendingDeposits: PaymentRequest[];
  pendingWithdrawals: PaymentRequest[];
  pendingKycUsers: User[];
  settings: MarketSettings;
  paymentRequests: PaymentRequest[];
  users: User[];
  theme?: AdminThemeSettings;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  pendingDeposits,
  pendingWithdrawals,
  pendingKycUsers,
  settings,
  paymentRequests,
  users,
  theme,
}) => {
  if (!isOpen) return null;
  
  type NotificationCategory = 'FINANCE' | 'KYC' | 'SECURITY' | 'SYSTEM' | 'USER';
  type NotificationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

  interface NotificationItem {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    severity: NotificationSeverity;
    createdAt: number;
    meta?: string;
  }

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const now = Date.now();

  const isLight = theme?.mode === 'LIGHT';
  const panelBg = isLight ? '#ffffff' : '#020617';
  const panelBorder = isLight ? '#e5e7eb' : '#111827';
  const headerBg = isLight ? '#f9fafb' : '#020617';
  const headerBorder = isLight ? '#e5e7eb' : '#111827';
  const titleColor = isLight ? '#111827' : '#ffffff';
  const subtitleColor = '#6b7280';

  const allNotifications: NotificationItem[] = useMemo(() => {
    const items: NotificationItem[] = [];

    // Finance: deposits & withdrawals (all requests)
    for (const req of paymentRequests) {
      const base: NotificationItem = {
        id: `${req.type.toLowerCase()}-${req.id}`,
        title: `${req.userName} ${req.type === 'DEPOSIT' ? 'deposit' : 'withdrawal'}`,
        message: `${req.amount.toFixed(2)} via ${req.method} • ${req.status}`,
        category: 'FINANCE',
        severity: 'INFO',
        createdAt: req.date,
      };

      const highAmount = req.amount >= 1000;
      if (req.status === 'PENDING') base.severity = highAmount ? 'CRITICAL' : 'WARNING';
      if (req.status === 'REJECTED') base.severity = 'WARNING';

      items.push(base);
    }

    // KYC pending users
    for (const user of pendingKycUsers) {
      items.push({
        id: `kyc-${user.id}`,
        title: user.name || 'KYC review',
        message: `${user.email} • Pending verification`,
        category: 'KYC',
        severity: 'WARNING',
        createdAt: user.joinedAt,
      });
    }

    // Security alerts from user activity logs and risk
    for (const user of users) {
      if (user.riskLabel === 'HIGH_RISK' || user.riskScore >= 80) {
        items.push({
          id: `risk-${user.id}`,
          title: 'High risk account detected',
          message: `${user.name} • Risk score ${user.riskScore}`,
          category: 'SECURITY',
          severity: 'CRITICAL',
          createdAt: user.lastLogin,
        });
      }

      const dangerLogs = user.activityLogs?.filter((log) => log.type === 'DANGER') || [];
      for (const log of dangerLogs.slice(0, 3)) {
        items.push({
          id: `sec-${user.id}-${log.id}`,
          title: 'Suspicious activity detected',
          message: `${log.action} • ${log.ip}`,
          category: 'SECURITY',
          severity: 'CRITICAL',
          createdAt: log.timestamp,
        });
      }
    }

    // System maintenance / announcement
    if (settings.maintenanceMode || settings.globalAnnouncement) {
      items.push({
        id: 'system-status',
        title: settings.maintenanceMode ? 'System in maintenance' : 'Global announcement',
        message: settings.globalAnnouncement || 'System live with no active announcement.',
        category: 'SYSTEM',
        severity: settings.maintenanceMode ? 'WARNING' : 'INFO',
        createdAt: now,
      });
    }

    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [paymentRequests, pendingKycUsers, users, settings.maintenanceMode, settings.globalAnnouncement, now]);

  const notifications = allNotifications.slice(0, 40);

  const handleMarkRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const getVisualFor = (n: NotificationItem) => {
    if (n.category === 'FINANCE') {
      const isDeposit = n.title.toLowerCase().includes('deposit');
      return {
        icon: isDeposit ? 'fa-solid fa-arrow-down-long' : 'fa-solid fa-arrow-up-long',
        bg: isDeposit ? 'bg-[#022c22] text-[#4ade80]' : 'bg-[#451a03] text-[#fdba74]',
      };
    }
    if (n.category === 'KYC') {
      return {
        icon: 'fa-solid fa-id-card-clip',
        bg: 'bg-[#0f172a] text-[#93c5fd]',
      };
    }
    if (n.category === 'SECURITY') {
      return {
        icon: 'fa-solid fa-shield-halved',
        bg: 'bg-[#450a0a] text-[#fecaca]',
      };
    }
    if (n.category === 'SYSTEM') {
      return {
        icon: 'fa-solid fa-server',
        bg: 'bg-[#020617] text-[#fcd535]',
      };
    }
    return {
      icon: 'fa-regular fa-bell',
      bg: 'bg-[#111827] text-[#e5e7eb]',
    };
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end items-start pointer-events-none" onClick={onClose}>
      {/* Panel - compact Quotex-style notification dropdown */}
      <aside
        className="pointer-events-auto w-full max-w-md border shadow-2xl rounded-2xl mt-16 mr-4 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
        style={{ backgroundColor: panelBg, borderColor: panelBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ backgroundColor: headerBg, borderColor: headerBorder }}
        >
          <div>
            <h3 className="text-sm font-semibold tracking-tight" style={{ color: titleColor }}>
              Notifications
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: subtitleColor }}>
              Recent finance, KYC & security activity.
            </p>
          </div>
        </header>

        {/* Main list */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1.5">
          {notifications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#022c22] text-[#22c55e]">
                <i className="fa-solid fa-circle-check" />
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: titleColor }}
              >
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-[11px] max-w-xs" style={{ color: subtitleColor }}>
                No recent notifications. New deposits, withdrawals or alerts will appear here.
              </p>
            </div>
          )}
          {notifications.length > 0 && (
            <ul className="space-y-1">
              {notifications.map((n) => {
                const isUnread = !readIds.has(n.id);
                const visual = getVisualFor(n);
                const time = new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const severityLabel =
                  n.severity === 'CRITICAL' ? 'Critical' : n.severity === 'WARNING' ? 'Warning' : 'Info';
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all border border-transparent hover:shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${visual.bg}`}>
                      <i className={`${visual.icon} text-[10px]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="text-[11px] font-semibold truncate"
                          style={{ color: titleColor }}
                        >
                          {n.title}
                        </p>
                        <span className="text-[9px] text-[#6b7280] whitespace-nowrap">{time}</span>
                      </div>
                      <p className="text-[10px] truncate" style={{ color: subtitleColor }}>
                        {n.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[9px]">
                        <span className="inline-flex items-center gap-1 text-[#6b7280] capitalize">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              n.severity === 'CRITICAL'
                                ? 'bg-[#f97316]'
                                : n.severity === 'WARNING'
                                ? 'bg-[#eab308]'
                                : 'bg-[#4b5563]'
                            }`}
                          />
                          {n.category.toLowerCase()} • {severityLabel}
                        </span>
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#fcd535] text-[#111827] text-[9px] font-semibold">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationCenter;
