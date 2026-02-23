import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { MarketSettings, AdminThemeSettings, DeviceCategory, DeviceViewPreset } from '../../shared/types.ts';

interface DeviceViewControlTabProps {
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
  theme?: AdminThemeSettings;
  searchQuery?: string;
}

const DEVICE_CATEGORIES: { id: DeviceCategory; label: string }[] = [
  { id: 'DESKTOP', label: 'Desktop' },
  { id: 'LAPTOP', label: 'Laptop' },
  { id: 'TABLET', label: 'Tablet' },
  { id: 'MOBILE', label: 'Mobile' },
];

const getDefaultsForCategory = (category: DeviceCategory): { width: number; height: number } => {
  switch (category) {
    case 'DESKTOP':
      return { width: 1920, height: 1080 };
    case 'LAPTOP':
      return { width: 1366, height: 768 };
    case 'TABLET':
      return { width: 1024, height: 768 };
    case 'MOBILE':
    default:
      return { width: 390, height: 844 };
  }
};

const DeviceViewControlTab: React.FC<DeviceViewControlTabProps> = ({ settings, onUpdate, theme, searchQuery }) => {
  const [activeHelpKey, setActiveHelpKey] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const hoverTimerRef = useRef<number | undefined>();

  const effectiveTheme: AdminThemeSettings = theme || settings.adminTheme;
  const isLight = effectiveTheme.mode === 'LIGHT';

  const cardBg = effectiveTheme.surfaceBackground || (isLight ? '#ffffff' : '#1e2329');
  const borderColor = isLight ? 'rgba(226,232,240,1)' : '#2b3139';
  const headerBg = effectiveTheme.headerBackground || (isLight ? '#f9fafb' : '#1e2329');
  const subtleBg = isLight ? '#f3f4f6' : '#111827';
  const textPrimary = effectiveTheme.textColor || (isLight ? '#020617' : '#EAECEF');
  const textMuted = isLight ? '#6b7280' : '#848e9c';
  const accentColor = effectiveTheme.primaryColor || '#fcd535';

  const HELP_MESSAGES: Record<string, string> = {
    name:
      'এখানে ডিভাইসের নাম লিখুন। যেমন: "iPhone 14 Pro", "Desktop 1920×1080" ইত্যাদি। এই নামটি শুধু অ্যাডমিন প্যানেলে রেফারেন্সের জন্য ব্যবহার হবে।',
    width:
      'এই ঘরে ডিভাইসের প্রস্থ (Width) পিক্সেলে লিখুন। উদাহরণ: Desktop → 1920, Mobile → 390। এটি প্রিভিউ ফ্রেমের প্রস্থ নির্ধারণ করবে।',
    height:
      'এই ঘরে ডিভাইসের উচ্চতা (Height) পিক্সেলে লিখুন। উদাহরণ: Desktop → 1080, Mobile → 844। এটি প্রিভিউ ফ্রেমের উচ্চতা নির্ধারণ করবে।',
    orientation:
      'ডিভাইসটি উলম্ব (Portrait) নাকি আড়াআড়ি (Landscape) সেই মোড নির্বাচন করুন। সাধারণত মোবাইল → Portrait, Desktop/Tablet → Landscape রাখা হয়।',
    note:
      'এই ঘরে ঐ ডিভাইস সম্পর্কে যে কোনো বাড়তি তথ্য লিখতে পারেন। যেমন: “Safe area 44px top”, “Notch device”, “Tablet landscape only” ইত্যাদি।',
    status:
      'এখানে ডিভাইস প্রিসেটের অবস্থা নির্বাচন করুন। ACTIVE মানে এখন ব্যবহার হচ্ছে, PENDING মানে পরবর্তীতে রিভিউ/টেস্ট করার জন্য রাখা, REJECTED মানে এই সাইজ আর ব্যবহার করা হবে না।',
  };

  const startHelpTimer = (key: string) => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setActiveHelpKey(key);
    }, 5000);
  };

  const clearHelpTimer = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = undefined;
    }
    setActiveHelpKey(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Debounce external search query (from top global search bar)
  useEffect(() => {
    const raw = (searchQuery || '').trim();
    const handle = window.setTimeout(() => {
      setDebouncedSearch(raw);
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [searchQuery]);

  const selectedCategory: DeviceCategory = settings.activeDeviceCategory || 'DESKTOP';

  const presetsForCategory = useMemo(
    () => {
      const base = settings.deviceViewPresets.filter((p) => p.category === selectedCategory);

      const query = debouncedSearch.trim().toLowerCase();
      if (!query) return base;

      return base.filter((preset) => {
        const name = (preset.name || '').toLowerCase();
        const widthStr = String(preset.width ?? '');
        const heightStr = String(preset.height ?? '');
        const orientation = (
          preset.orientation ||
          (preset.height >= preset.width ? 'PORTRAIT' : 'LANDSCAPE')
        ).toLowerCase();
        const note = (preset.note || '').toLowerCase();
        const statusRaw = (preset.status || 'ACTIVE').toLowerCase();
        // Treat non-ACTIVE as a kind of "inactive" for search purposes
        const statusAlias = statusRaw === 'active' ? 'active' : 'inactive';

        const haystack = [
          name,
          widthStr,
          heightStr,
          orientation,
          note,
          statusRaw,
          statusAlias,
        ].join(' ');

        return haystack.includes(query);
      });
    },
    [settings.deviceViewPresets, selectedCategory, debouncedSearch]
  );

  const handleCategoryChange = (category: DeviceCategory) => {
    if (category === settings.activeDeviceCategory) return;
    onUpdate({ ...settings, activeDeviceCategory: category });
  };

  const handleAddPreset = () => {
    const base = getDefaultsForCategory(selectedCategory);
    const newPreset: DeviceViewPreset = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      category: selectedCategory,
      width: base.width,
      height: base.height,
      note: '',
    };

    onUpdate({
      ...settings,
      deviceViewPresets: [...settings.deviceViewPresets, newPreset],
    });
  };

  const updatePreset = (id: string, updates: Partial<DeviceViewPreset>) => {
    const updated = settings.deviceViewPresets.map((p) => (p.id === id ? { ...p, ...updates } : p));
    onUpdate({ ...settings, deviceViewPresets: updated });
  };

  const removePreset = (id: string) => {
    const updated = settings.deviceViewPresets.filter((p) => p.id !== id);
    onUpdate({ ...settings, deviceViewPresets: updated });
  };

  const getStatusStyles = (status: 'ACTIVE' | 'PENDING' | 'REJECTED' | undefined) => {
    // Stronger solid badge-style colors for a more professional, readable look
    if (status === 'ACTIVE') {
      return {
        bg: '#16a34a', // green-600
        text: '#ffffff',
      };
    }
    if (status === 'PENDING') {
      return {
        bg: '#d97706', // amber-600
        text: '#ffffff',
      };
    }
    if (status === 'REJECTED') {
      return {
        bg: '#dc2626', // red-600
        text: '#ffffff',
      };
    }
    return {
      bg: isLight ? '#ffffff' : '#111827',
      text: textPrimary,
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 px-2 pb-3">
        <div
          className="w-full rounded-xl border shadow-lg flex flex-col p-2 space-y-2"
          style={{ backgroundColor: cardBg, borderColor }}
        >
          {/* Presets table */}
          <div className="rounded-lg border overflow-hidden flex flex-col" style={{ borderColor }}>
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ backgroundColor: headerBg, borderColor }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-[10px] text-muted-foreground">
                    <i className="fa-solid fa-display" style={{ color: textMuted }}></i>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold" style={{ color: textPrimary }}>
                      Device Type
                    </span>
                    <span className="text-[10px]" style={{ color: textMuted }}>
                      Choose which device presets you are managing
                    </span>
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as DeviceCategory)}
                  className="border rounded-lg px-3 py-1.5 text-[11px] outline-none transition-colors duration-150 focus:border-[#fcd535] hover:border-[#fcd535]"
                  style={{ backgroundColor: subtleBg, borderColor, color: textPrimary }}
                >
                  {DEVICE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddPreset}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold hover:brightness-105 border shadow-sm"
                  style={{ backgroundColor: '#fcd535', color: isLight ? '#111827' : '#000000', borderColor: '#fbbf24' }}
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  Add Device
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[880px] text-left border-collapse text-xs">
                <thead style={{ backgroundColor: subtleBg, color: textMuted }}>
                  <tr>
                    <th className="px-4 py-2 align-middle">Device Name</th>
                    <th className="px-4 py-2 align-middle">Width (px)</th>
                    <th className="px-4 py-2 align-middle">Height (px)</th>
                    <th className="px-4 py-2 align-middle">Orientation</th>
                    <th className="px-4 py-2 align-middle">Note</th>
                    <th className="px-4 py-2 align-middle">Status</th>
                    <th className="px-4 py-2 align-middle text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presetsForCategory.length > 0 ? (
                    presetsForCategory.map((preset) => {
                      const isEditing = editingRowId === preset.id;
                      const statusStyles = getStatusStyles(
                        (preset.status || 'ACTIVE') as 'ACTIVE' | 'PENDING' | 'REJECTED'
                      );
                      return (
                      <tr
                        key={preset.id}
                        className={`border-t transition-colors ${
                          isLight ? 'hover:bg-gray-50' : 'hover:bg-[#111827]'
                        }`}
                        style={{ borderColor }}
                      >
                        <td className="px-4 py-2 align-middle">
                          <input
                            type="text"
                            placeholder="e.g. iPhone 14 Pro"
                            value={preset.name}
                            onChange={(e) => updatePreset(preset.id, { name: e.target.value })}
                            className="w-full border rounded px-2 py-1 text-xs outline-none focus:border-[#fcd535] disabled:opacity-60"
                            style={{
                              backgroundColor: isLight ? '#ffffff' : '#111827',
                              borderColor,
                              color: textPrimary,
                            }}
                            disabled={!isEditing}
                            onMouseEnter={() => startHelpTimer('name')}
                            onMouseLeave={clearHelpTimer}
                          />
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <input
                            type="number"
                            value={preset.width}
                            onChange={(e) =>
                              updatePreset(preset.id, { width: Number(e.target.value) || 0 })
                            }
                            className="w-24 border rounded px-2 py-1 text-xs outline-none text-right focus:border-[#fcd535] disabled:opacity-60"
                            style={{
                              backgroundColor: isLight ? '#ffffff' : '#111827',
                              borderColor,
                              color: textPrimary,
                            }}
                            disabled={!isEditing}
                            onMouseEnter={() => startHelpTimer('width')}
                            onMouseLeave={clearHelpTimer}
                          />
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <input
                            type="number"
                            value={preset.height}
                            onChange={(e) =>
                              updatePreset(preset.id, { height: Number(e.target.value) || 0 })
                            }
                            className="w-24 border rounded px-2 py-1 text-xs outline-none text-right focus:border-[#fcd535] disabled:opacity-60"
                            style={{
                              backgroundColor: isLight ? '#ffffff' : '#111827',
                              borderColor,
                              color: textPrimary,
                            }}
                            disabled={!isEditing}
                          />
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <select
                            value={
                              preset.orientation ||
                              (preset.height >= preset.width ? 'PORTRAIT' : 'LANDSCAPE')
                            }
                            onChange={(e) =>
                              updatePreset(preset.id, {
                                orientation: e.target.value as 'PORTRAIT' | 'LANDSCAPE',
                              })
                            }
                            className="border rounded px-2 py-1 text-[11px] outline-none focus:border-[#fcd535] disabled:opacity-60"
                            style={{
                              backgroundColor: isLight ? '#ffffff' : '#111827',
                              borderColor,
                              color: textPrimary,
                            }}
                            disabled={!isEditing}
                            onMouseEnter={() => startHelpTimer('orientation')}
                            onMouseLeave={clearHelpTimer}
                          >
                            <option value="LANDSCAPE">Landscape</option>
                            <option value="PORTRAIT">Portrait</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 align-middle max-w-xs">
                          <input
                            type="text"
                            placeholder="Optional note (e.g. safe area)"
                            value={preset.note || ''}
                            onChange={(e) => updatePreset(preset.id, { note: e.target.value })}
                            className="w-full border rounded px-2 py-1 text-xs outline-none focus:border-[#fcd535] disabled:opacity-60 truncate"
                            style={{
                              backgroundColor: isLight ? '#ffffff' : '#111827',
                              borderColor,
                              color: textPrimary,
                            }}
                            disabled={!isEditing}
                            onMouseEnter={() => startHelpTimer('note')}
                            onMouseLeave={clearHelpTimer}
                          />
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <select
                            value={preset.status || 'ACTIVE'}
                            onChange={(e) =>
                              updatePreset(preset.id, {
                                status: e.target.value as 'ACTIVE' | 'PENDING' | 'REJECTED',
                              })
                            }
                            className="border rounded px-2 py-1 text-[11px] outline-none focus:border-[#fcd535] disabled:opacity-60"
                            style={{
                              backgroundColor: statusStyles.bg,
                              borderColor,
                              color: statusStyles.text,
                              fontWeight: 500,
                            }}
                            onMouseEnter={() => startHelpTimer('status')}
                            onMouseLeave={clearHelpTimer}
                            disabled={!isEditing}
                          >
                            <option
                              value="ACTIVE"
                              style={{
                                color: '#ffffff',
                                backgroundColor: '#16a34a',
                              }}
                            >
                              Active
                            </option>
                            <option
                              value="PENDING"
                              style={{
                                color: '#ffffff',
                                backgroundColor: '#d97706',
                              }}
                            >
                              Pending
                            </option>
                            <option
                              value="REJECTED"
                              style={{
                                color: '#ffffff',
                                backgroundColor: '#dc2626',
                              }}
                            >
                              Rejected
                            </option>
                          </select>
                        </td>
                        <td className="px-4 py-2 align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 pr-1">
                            <button
                              type="button"
                              className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ${
                                isEditing
                                  ? 'bg-sky-700 text-white hover:bg-sky-600'
                                  : 'bg-sky-600 text-white hover:bg-sky-500'
                              }`}
                              title={isEditing ? 'Lock row (stop editing)' : 'Enable editing for this row'}
                              onClick={() => setEditingRowId(isEditing ? null : preset.id)}
                            >
                              <i className="fa-solid fa-pen mr-1"></i>
                              <span>{isEditing ? 'Done' : 'Edit'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removePreset(preset.id)}
                              className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium bg-rose-600 text-white hover:bg-rose-500 transition-colors duration-150"
                              title="Delete device"
                            >
                              <i className="fa-solid fa-trash mr-1"></i>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : debouncedSearch.trim() ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[11px] uppercase tracking-widest"
                        style={{ color: textMuted }}
                      >
                        No devices found for this search.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[11px] uppercase tracking-widest"
                        style={{ color: textMuted }}
                      >
                        এই ক্যাটাগরির জন্য এখনো কোনো ডিভাইস প্রিসেট তৈরি করা হয়নি। উপরে "Add Device" বাটনে ক্লিক করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Help panel */}
            <div
              className="border-t px-4 py-3 text-[11px]"
              style={{ borderColor, backgroundColor: isLight ? '#f9fafb' : '#020617' }}
            >
              <span className="font-semibold" style={{ color: textMuted }}>
                সাহায্য:
              </span>{' '}
              <span style={{ color: textPrimary }}>
                {activeHelpKey
                  ? HELP_MESSAGES[activeHelpKey] ||
                    'ইনপুট বক্সের উপর মাউস রাখলে সেই ঘরের ব্যাখ্যা দেখা যাবে।'
                  : 'যেকোনো ইনপুট বক্সের উপর মাউস নিয়ে প্রায় ৫ সেকেন্ড রাখলে, এখানে সেই ঘরে কি লিখতে হবে তার বাংলা ব্যাখ্যা দেখা যাবে।'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceViewControlTab;
