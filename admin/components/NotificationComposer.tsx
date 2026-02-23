import React, { useMemo, useState } from 'react';
import type { User, AdminThemeSettings } from '../../shared/types.ts';
import type { UserFilterType } from '../userFilters.ts';
import { filterUsersByType } from '../userFilters.ts';

interface NotificationComposerProps {
  users: User[];
  initialSegment: UserFilterType;
  onSend: (payload: { segment: UserFilterType; subject: string; message: string }) => void;
  theme?: AdminThemeSettings;
}

const SEGMENT_OPTIONS: { key: UserFilterType; label: string }[] = [
  { key: 'ALL', label: 'All Users' },
  { key: 'ACTIVE', label: 'Active Users' },
  { key: 'WITH_BALANCE', label: 'With Balance' },
  { key: 'KYC_VERIFIED', label: 'Verified Users' },
  { key: 'KYC_PENDING', label: 'KYC Pending' },
  { key: 'KYC_REJECTED', label: 'KYC Rejected' },
  { key: 'KYC_UNVERIFIED', label: 'KYC Unverified' },
  { key: 'EMAIL_UNVERIFIED', label: 'Email Unverified' },
  { key: 'MOBILE_UNVERIFIED', label: 'Mobile Unverified' },
  { key: 'BANNED', label: 'Banned / Blocked' },
  { key: 'VPN_DETECTED', label: 'VPN Detected' },
];

const NotificationComposer: React.FC<NotificationComposerProps> = (props) => {
  const { users, initialSegment, onSend, theme } = props;

  const [segment, setSegment] = useState<UserFilterType>(initialSegment || 'ALL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const recipients = useMemo(() => filterUsersByType(users, segment), [users, segment]);

  const isLight = theme?.mode === 'LIGHT';
  const cardBg = isLight ? '#ffffff' : '#020617';
  const headerBg = isLight ? '#f9fafb' : '#14181c';
  const borderColor = isLight ? '#e5e7eb' : '#2b3139';
  const textPrimary = theme?.textColor || (isLight ? '#111827' : '#EAECEF');
  const textMuted = isLight ? '#6b7280' : '#848e9c';
  const inputBg = isLight ? '#f9fafb' : '#14181c';
  const fromBg = isLight ? '#f3f4f6' : '#14181c';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      onSend({ segment, subject: subject.trim(), message: message.trim() });
      setIsSending(false);
      setSubject('');
      setMessage('');
    }, 300);
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setSegment(initialSegment || 'ALL');
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: cardBg }}>
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ backgroundColor: headerBg, borderColor }}
      >
        <div className="flex items-center space-x-3">
          <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f69d35] flex items-center justify-center text-[#1e2329] shadow-lg">
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wide" style={{ color: textPrimary }}>
              Send Notification Email
            </span>
            <span className="text-[11px]" style={{ color: textMuted }}>
              Broadcast important updates directly to user inboxes
            </span>
          </div>
        </div>
        <span className="text-[11px] uppercase tracking-[1.5px]" style={{ color: textMuted }}>
          Admin Broadcast Center
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
          <div className="flex-1">
            <label
              className="text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: textMuted }}
            >
              Recipient Segment
            </label>
            <div className="mt-1 relative">
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as UserFilterType)}
                className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#fcd535] appearance-none pr-8"
                style={{
                  backgroundColor: inputBg,
                  borderColor,
                  color: textPrimary,
                }}
              >
                {SEGMENT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <i
                className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
                style={{ color: textMuted }}
              ></i>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: textMuted }}>
              Targeting <span className="text-[#fcd535] font-semibold">{recipients.length}</span> users
            </p>
          </div>
          <div className="sm:w-40 w-full">
            <div className="text-[11px] mb-1" style={{ color: textMuted }}>
              From
            </div>
            <div
              className="px-3 py-2 rounded-lg text-[11px] flex items-center space-x-2 border"
              style={{ backgroundColor: fromBg, borderColor, color: textPrimary }}
            >
              <i className="fa-solid fa-envelope text-[11px] text-[#fcd535]"></i>
              <span className="truncate">no-reply@geminix.admin</span>
            </div>
          </div>
        </div>

        <div>
          <label
            className="text-[11px] font-semibold uppercase tracking-[1.5px]"
            style={{ color: textMuted }}
          >
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Write a clear, short subject line..."
            className="mt-1 w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#fcd535]"
            style={{ backgroundColor: inputBg, borderColor, color: textPrimary }}
          />
        </div>

        <div>
          <label
            className="text-[11px] font-semibold uppercase tracking-[1.5px]"
            style={{ color: textMuted }}
          >
            Message
          </label>
          <div
            className="mt-1 rounded-lg border overflow-hidden"
            style={{ backgroundColor: inputBg, borderColor }}
          >
            <div
              className="flex items-center justify-between px-3 py-1.5 border-b text-[11px]"
              style={{ borderColor, color: textMuted }}
            >
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-align-left"></i>
                <span>Compose</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-regular fa-face-smile cursor-pointer hover:text-[#111827]"></i>
                <i className="fa-solid fa-paperclip cursor-pointer hover:text-[#111827]"></i>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message like an email..."
              className="w-full h-56 bg-transparent px-3 py-2 text-xs resize-none focus:outline-none custom-scrollbar"
              style={{ color: textPrimary }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-2 border-t mt-2"
          style={{ borderColor }}
        >
          <p className="text-[11px]" style={{ color: textMuted }}>
            This will send an email-style notification to the selected segment.
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[11px] hover:bg-opacity-80 border"
              style={{ borderColor, color: textPrimary, backgroundColor: isLight ? '#f9fafb' : '#14181c' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !subject.trim() || !message.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#fcd535] text-[11px] font-semibold text-[#111] hover:bg-[#f7b500] disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSending ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-[11px]"></i>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-[11px]"></i>
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NotificationComposer;
