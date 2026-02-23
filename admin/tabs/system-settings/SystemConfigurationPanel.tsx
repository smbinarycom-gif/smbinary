import React, { useState } from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';

interface ConfigModule {
  id: string;
  title: string;
  description: string;
  note?: string;
  linkLabel?: string;
}

const INITIAL_MODULES: ConfigModule[] = [
  {
    id: 'balanceTransfer',
    title: 'Balance Transfer',
    description:
      'If you enable this module, users will be able to transfer the balance to each other. A fixed and percent charge can be configured from the General Setting module.',
    linkLabel: 'General Setting',
  },
  {
    id: 'userRegistration',
    title: 'User Registration',
    description: 'If you disable this module, no one can register on this system.',
  },
  {
    id: 'forceSsl',
    title: 'Force SSL',
    description:
      'By enabling Force SSL (Secure Sockets Layer) the system will force a visitor to access the site in secure mode. Otherwise, the site will be loaded in insecure mode.',
  },
  {
    id: 'agreePolicy',
    title: 'Agree Policy',
    description:
      'If you enable this module, that means a user must have to agree with your system policies during registration.',
    linkLabel: 'policies',
  },
  {
    id: 'forceSecurePassword',
    title: 'Force Secure Password',
    description:
      'By enabling this module, a user must set a secure password while signing up or changing the password.',
  },
  {
    id: 'kycVerification',
    title: 'KYC Verification',
    description:
      'If you enable KYC (Know Your Client) module, users must have to submit the required data. Otherwise, any money-out transaction will be prevented by the system.',
  },
  {
    id: 'emailVerification',
    title: 'Email Verification',
    description:
      'If you enable Email Verification, users have to verify their email to access the dashboard. A 6-digit verification code will be sent to their email to be verified.',
    note: 'Make sure that the Email Notification module is enabled.',
  },
  {
    id: 'emailNotification',
    title: 'Email Notification',
    description:
      'If you enable this module, the system will send emails to users where needed. Otherwise, no email will be sent.',
    note: 'Be sure before disabling this module that the system does not need to send any emails.',
  },
  {
    id: 'mobileVerification',
    title: 'Mobile Verification',
    description:
      'If you enable Mobile Verification, users have to verify their mobile to access the dashboard. A 6-digit verification code will be sent to their mobile to be verified.',
    note: 'Make sure that the SMS Notification module is enabled.',
  },
  {
    id: 'smsNotification',
    title: 'SMS Notification',
    description:
      'If you enable this module, the system will send SMS to users where needed. Otherwise, no SMS will be sent.',
    note: 'Be sure before disabling this module that the system does not need to send any SMS.',
  },
  {
    id: 'pushNotification',
    title: 'Push Notification',
    description:
      'If you enable this module, the system will send push notifications to users. Otherwise, no push notification will be sent.',
  },
  {
    id: 'languageOption',
    title: 'Language Option',
    description:
      'If you enable this module, users can change the language according to their needs.',
  },
  {
    id: 'coupon',
    title: 'Coupon',
    description:
      'If you enable this module, users can use coupons to get discounts on their orders.',
  },
];

const SystemConfigurationPanel: React.FC<SystemSettingsPanelProps> = () => {
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({
    balanceTransfer: true,
    userRegistration: true,
    forceSsl: true,
    agreePolicy: true,
    forceSecurePassword: true,
    kycVerification: false,
    emailVerification: false,
    emailNotification: true,
    mobileVerification: false,
    smsNotification: false,
    pushNotification: true,
    languageOption: true,
    coupon: true,
  });

  const handleToggle = (id: string) => {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would persist configuration; for now we keep it local.
    // console.log('System configuration:', enabledMap);
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#020617] border border-[#111827] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111827] flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">System Configuration</h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">
            Enable or disable core system modules that control security, verification and notifications.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-[#111827]">
          {INITIAL_MODULES.map((mod) => {
            const enabled = !!enabledMap[mod.id];
            return (
              <div
                key={mod.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 bg-[#020617] hover:bg-[#020617]/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">
                    {mod.title}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9ca3af] leading-snug">
                    {mod.description}{' '}
                    {mod.linkLabel && (
                      <span className="text-[#4f46e5] cursor-default font-semibold">
                        {mod.linkLabel}
                      </span>
                    )}
                  </p>
                  {mod.note && (
                    <p className="mt-1 text-[10px] text-[#f97316] leading-snug">
                      Note: {mod.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center md:justify-end gap-3">
                  <div
                    className={`flex items-center justify-between w-28 h-9 rounded-full px-3 text-[11px] font-semibold shadow-inner border transition-colors ${
                      enabled
                        ? 'bg-[#16a34a]/90 border-[#16a34a] text-white'
                        : 'bg-[#b91c1c]/90 border-[#b91c1c] text-white'
                    }`}
                  >
                    <span>{enabled ? 'Enable' : 'Disable'}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(mod.id)}
                      className={`relative w-9 h-5 rounded-full border border-black/40 bg-black/40 transition-colors flex items-center ${
                        enabled ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-[#111827]">
          <button
            type="submit"
            className="w-full rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-[12px] font-semibold text-white py-2.5 shadow-md shadow-[#4f46e5]/40 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfigurationPanel;
