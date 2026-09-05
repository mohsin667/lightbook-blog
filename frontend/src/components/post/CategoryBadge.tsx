import { Laptop, Palette, Plane, Soup, Sun, Tag, type LucideIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getCategory } from '../../data/mockData';

const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  Soup,
  Palette,
  Sun,
  Laptop,
  Tag,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Tag;
}

export interface CategoryBadgeProps {
  category_name?: string | null;
}

export function CategoryBadge({ category_name }: CategoryBadgeProps) {
  const cat = category_name ? getCategory(category_name) : null;
  const Icon = getCategoryIcon(cat?.icon || 'Tag');
  return (
    <Badge variant="neutral">
      <Icon size={13} strokeWidth={1.75} className="text-coral" />
      {cat?.name || category_name}
    </Badge>
  );
}
