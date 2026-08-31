import type { ComponentType } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-[22px]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-[9px] rounded-lg font-display font-semibold text-sm border transition-colors ${
              active
                ? 'bg-coral border-coral text-coral-deep'
                : 'bg-surface border-border-strong text-ink-soft hover:text-ink'
            }`}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
