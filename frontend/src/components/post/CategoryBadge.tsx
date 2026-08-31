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
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const cat = getCategory(category);
  const Icon = getCategoryIcon(cat.icon);
  return (
    <Badge variant="neutral">
      <Icon size={13} strokeWidth={1.75} className="text-coral" />
      {cat.name}
    </Badge>
  );
}
