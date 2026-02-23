import React from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';
import type {
  NotificationChannel,
  NotificationEventChannelRule,
  NotificationPriority,
} from '../../../shared/types.ts';

const channelLabels: Record<NotificationChannel, string> = {
  IN_APP: 'In‑App',
  EMAIL: 'Email',
  SMS: 'SMS',
  BROWSER_PUSH: 'Browser Push',
  MOBILE_PUSH: 'Mobile Push',
  TELEGRAM: 'Telegram',
  WHATSAPP: 'WhatsApp',
};

const priorityBadgeClasses: Record<NotificationPriority, string> = {
  HIGH: 'bg-[#450a0a] text-[#fca5a5] border border-[#b91c1c]',
  MEDIUM: 'bg-[#451a03] text-[#fed7aa] border border-[#d97706]',
  LOW: 'bg-[#022c22] text-[#6ee7b7] border border-[#10b981]',
};

const NotificationSettingsPanel: React.FC<SystemSettingsPanelProps> = ({ settings, onUpdate }) => {
  const { notifications } = settings;

  const updateNotifications = (next: Partial<typeof notifications>) => {
    onUpdate({ ...settings, notifications: { ...notifications, ...next } });
  };

  const toggleMaster = (key: keyof typeof notifications.master) => {
    updateNotifications({
      master: { ...notifications.master, [key]: !notifications.master[key] },
    });
  };

  const toggleChannelConfig = (key: keyof typeof notifications.channels) => {
    updateNotifications({
      channels: { ...notifications.channels, [key]: !notifications.channels[key] },
    });
  };

  const toggleEventChannel = (index: number, channel: NotificationChannel) => {
    const rules = [...notifications.eventRules];
    const rule = rules[index];
    const has = rule.channels.includes(channel);
    const nextChannels = has
      ? rule.channels.filter((c) => c !== channel)
      : [...rule.channels, channel];
    rules[index] = { ...rule, channels: nextChannels };
    updateNotifications({ eventRules: rules });
  };

  const toggleEventEnabled = (index: number) => {
    const rules = [...notifications.eventRules];
    rules[index] = { ...rules[index], enabled: !rules[index].enabled };
    updateNotifications({ eventRules: rules });
  };

  const changeEventPriority = (index: number, priority: NotificationPriority) => {
    const rules = [...notifications.eventRules];
    rules[index] = { ...rules[index], priority };
    updateNotifications({ eventRules: rules });
  };

  const handleInAppUxChange = <K extends keyof typeof notifications.inAppUx>(
    key: K,
    value: (typeof notifications.inAppUx)[K],
  ) => {
    updateNotifications({ inAppUx: { ...notifications.inAppUx, [key]: value } });
  };

  return (
    <div className="flex h-full flex-col bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#111827] px-5 py-3">
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-semibold text-white">Notification & Alert Control</h3>
          <p className="text-[11px] text-[#6b7280]">
            Central hub to automate alerts, delivery channels and notification UX.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3 py-1 text-[10px] text-[#9ca3af] border border-[#1f2937]">
          <i className="fa-solid fa-bolt text-[#facc15] text-[10px]" />
          <span>Automation ready</span>
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
        {/* Row 1: Master + Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 items-start">
          {/* Global master control */}
          <section className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[12px] font-semibold text-white">Global notification master</h4>
                <p className="text-[10px] text-[#6b7280]">
                  One switch to govern system, financial, security and marketing alerts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                {
                  key: 'systemNotificationsEnabled' as const,
                  label: 'System notifications',
                  desc: 'Routine platform‑level updates and status messages.',
                },
                {
                  key: 'userAlertsEnabled' as const,
                  label: 'User alerts',
                  desc: 'End‑user messages such as welcome, profile or login.',
                },
                {
                  key: 'financialAlertsEnabled' as const,
                  label: 'Financial alerts',
                  desc: 'Deposit, withdrawal and balance‑critical alerts.',
                },
                {
                  key: 'securityAlertsEnabled' as const,
                  label: 'Security alerts',
                  desc: 'Suspicious login, password and lock‑out events.',
                },
                {
                  key: 'marketingAnnouncementsEnabled' as const,
                  label: 'Marketing & announcements',
                  desc: 'Campaigns, offers and broadcast messages.',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleMaster(item.key)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors bg-[#020617] hover:border-[#4f46e5] ${
                    notifications.master[item.key]
                      ? 'border-[#4f46e5]/70 shadow-[0_0_0_1px_rgba(79,70,229,0.4)]'
                      : 'border-[#1f2937]'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-[#e5e7eb]">{item.label}</span>
                    <span className="text-[10px] text-[#6b7280]">{item.desc}</span>
                  </div>
                  <div
                    className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 text-[10px] transition-colors ${
                      notifications.master[item.key] ? 'bg-[#22c55e]' : 'bg-[#374151]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        notifications.master[item.key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#111827] px-3 py-2 border border-dashed border-[#4b5563]">
              <div className="flex items-center gap-2 text-[10px] text-[#e5e7eb]">
                <i className="fa-solid fa-triangle-exclamation text-[#f97316]" />
                <span>Emergency override immediately forces all critical security alerts ON.</span>
              </div>
              <button
                type="button"
                onClick={() => toggleMaster('emergencyOverrideActive')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold border ${
                  notifications.master.emergencyOverrideActive
                    ? 'border-[#ef4444] text-[#fecaca] bg-[#450a0a]'
                    : 'border-[#4b5563] text-[#e5e7eb] bg-[#020617]'
                }`}
              >
                <i className="fa-solid fa-bolt" />
                {notifications.master.emergencyOverrideActive ? 'Override active' : 'Activate override'}
              </button>
            </div>
          </section>

          {/* Multi-channel delivery control */}
          <section className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[12px] font-semibold text-white">Delivery channels</h4>
                <p className="text-[10px] text-[#6b7280]">
                  Decide which pipes are available for each event and template.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {[ 
                { key: 'inAppEnabled' as const, label: 'In‑app alerts', icon: 'fa-window-maximize' },
                { key: 'emailEnabled' as const, label: 'Email', icon: 'fa-envelope' },
                { key: 'smsEnabled' as const, label: 'SMS', icon: 'fa-comment-dots' },
                { key: 'browserPushEnabled' as const, label: 'Browser push', icon: 'fa-bell' },
                { key: 'mobilePushEnabled' as const, label: 'Mobile push', icon: 'fa-mobile-screen' },
                { key: 'telegramEnabled' as const, label: 'Telegram / WhatsApp', icon: 'fa-paper-plane' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleChannelConfig(item.key)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] transition-colors bg-[#020617] hover:border-[#4f46e5] ${
                    notifications.channels[item.key]
                      ? 'border-[#22c55e]/70 shadow-[0_0_0_1px_rgba(34,197,94,0.4)]'
                      : 'border-[#1f2937]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#111827] flex items-center justify-center text-[#e5e7eb]">
                      <i className={`fa-solid ${item.icon} text-[12px]`} />
                    </div>
                    <span className="text-[11px] text-[#e5e7eb]">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      notifications.channels[item.key] ? 'text-[#22c55e]' : 'text-[#6b7280]'
                    }`}
                  >
                    {notifications.channels[item.key] ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Row 2: Smart event triggers + UX controls */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
          {/* Smart event trigger automation */}
          <section className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[12px] font-semibold text-white">Smart event automation</h4>
                <p className="text-[10px] text-[#6b7280]">
                  Configure which events fire notifications, on which channels and with what priority.
                </p>
              </div>
              <span className="text-[10px] text-[#6b7280]">Critical alerts are always instant.</span>
            </div>

            <div className="space-y-2 mt-1">
              {notifications.eventRules.map((rule, index) => (
                <div
                  key={rule.eventKey}
                  className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleEventEnabled(index)}
                        className={`inline-flex h-4 w-7 items-center rounded-full p-0.5 text-[10px] transition-colors ${
                          rule.enabled ? 'bg-[#22c55e]' : 'bg-[#374151]'
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
                            rule.enabled ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-[11px] font-semibold text-[#e5e7eb]">
                        {rule.eventKey.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>

                    <select
                      value={rule.priority}
                      onChange={(e) => changeEventPriority(index, e.target.value as NotificationPriority)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        priorityBadgeClasses[rule.priority]
                      }`}
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Object.keys(channelLabels) as NotificationChannel[]).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleEventChannel(index, ch)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                          rule.channels.includes(ch)
                            ? 'border-[#22c55e] bg-[#022c22] text-[#bbf7d0]'
                            : 'border-[#374151] bg-[#020617] text-[#9ca3af]'
                        }`}
                      >
                        <span>{channelLabels[ch]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* In-app experience controls + live preview */}
          <section className="space-y-3">
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
              <h4 className="text-[12px] font-semibold text-white">In‑app notification UX</h4>
              <p className="text-[10px] text-[#6b7280]">
                Tweak how toasts behave, where they appear and sound behaviour.
              </p>

              <div className="space-y-3 text-[11px] text-[#e5e7eb]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span>Toast position</span>
                    <span className="text-[10px] text-[#6b7280]">
                      Controls the corner where in‑app alerts slide in.
                    </span>
                  </div>
                  <select
                    value={notifications.inAppUx.toastPosition}
                    onChange={(e) =>
                      handleInAppUxChange('toastPosition', e.target.value as typeof notifications.inAppUx.toastPosition)
                    }
                    className="rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="TOP_RIGHT">Top right</option>
                    <option value="TOP_LEFT">Top left</option>
                    <option value="BOTTOM_RIGHT">Bottom right</option>
                    <option value="BOTTOM_LEFT">Bottom left</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span>Auto dismiss</span>
                    <span className="text-[10px] text-[#6b7280]">
                      Time before toasts hide automatically.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={notifications.inAppUx.autoDismissSeconds}
                      onChange={(e) =>
                        handleInAppUxChange('autoDismissSeconds', Number(e.target.value) || 0)
                      }
                      className="w-16 rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                    />
                    <span className="text-[10px] text-[#6b7280]">sec</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span>Unread badge counter</span>
                    <span className="text-[10px] text-[#6b7280]">
                      Shows count on bell icon when alerts are unread.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleInAppUxChange('unreadBadgeEnabled', !notifications.inAppUx.unreadBadgeEnabled)
                    }
                    className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 text-[10px] transition-colors ${
                      notifications.inAppUx.unreadBadgeEnabled ? 'bg-[#22c55e]' : 'bg-[#374151]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        notifications.inAppUx.unreadBadgeEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span>Sound</span>
                    <span className="text-[10px] text-[#6b7280]">
                      Play a subtle chime when high priority alerts arrive.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInAppUxChange('soundEnabled', !notifications.inAppUx.soundEnabled)}
                    className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 text-[10px] transition-colors ${
                      notifications.inAppUx.soundEnabled ? 'bg-[#22c55e]' : 'bg-[#374151]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        notifications.inAppUx.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Live preview (simple mock) */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
              <h4 className="text-[12px] font-semibold text-white">Live preview</h4>
              <p className="text-[10px] text-[#6b7280]">
                Visual preview of in‑app toast, email subject and push style.
              </p>

              <div className="space-y-3 text-[11px]">
                <div className="rounded-xl bg-[#111827] border border-[#1f2937] p-3 flex items-start gap-2">
                  <div className="mt-0.5">
                    <i className="fa-solid fa-bell text-[#22c55e] text-[10px]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Deposit successful</span>
                      <span className="text-[9px] text-[#6b7280]">Now</span>
                    </div>
                    <p className="text-[10px] text-[#9ca3af]">
                      $250 has been added to your SMBinary.COM wallet.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#020617] border border-dashed border-[#374151] p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6b7280]">Email subject example</span>
                    <span className="text-[11px] text-[#e5e7eb] font-medium">
                      [SMBinary.COM] Withdrawal request received
                    </span>
                  </div>
                  <i className="fa-solid fa-envelope text-[#9ca3af] text-xs" />
                </div>

                <div className="rounded-xl bg-[#020617] border border-dashed border-[#374151] p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6b7280]">Push preview</span>
                    <span className="text-[11px] text-[#e5e7eb] font-medium">SMBinary.COM • Trade result ready</span>
                  </div>
                  <i className="fa-solid fa-mobile-screen text-[#9ca3af] text-xs" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPanel;
