import React from 'react';
import type { AdminThemeSettings } from '../../../shared/types.ts';

interface PlaceholderTabProps {
  title: string;
  description: string;
  theme?: AdminThemeSettings;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title, description, theme }) => {
  const isLight = theme?.mode === 'LIGHT';

  return (
    <div className="space-y-3">
      <h1 className={`text-sm font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>{title}</h1>
      <p className="text-xs text-[#6b7280] max-w-2xl">{description}</p>
    </div>
  );
};

export default PlaceholderTab;
