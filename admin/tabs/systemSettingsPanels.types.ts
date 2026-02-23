import { MarketSettings } from '../../shared/types.ts';
import { SystemSettingsSectionId } from './systemSettingsItems.ts';

export interface SystemSettingsPanelProps {
  sectionId: SystemSettingsSectionId;
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
}
