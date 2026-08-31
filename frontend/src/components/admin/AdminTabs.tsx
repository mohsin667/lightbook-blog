import { BarChart3, Flag, Settings, Star, Users } from 'lucide-react';
import { Tabs, type TabItem } from '../ui/Tabs';

export type AdminTabId = 'overview' | 'users' | 'moderation' | 'analytics' | 'settings';

const ADMIN_TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'moderation', label: 'Moderation', icon: Flag },
  { id: 'analytics', label: 'Analytics', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export interface AdminTabsProps {
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return <Tabs tabs={ADMIN_TABS} activeTab={activeTab} onTabChange={(id) => onTabChange(id as AdminTabId)} />;
}
