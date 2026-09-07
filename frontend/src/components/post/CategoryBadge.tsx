import { Laptop, Palette, Plane, Soup, Sun, Tag, type LucideIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';

const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  Soup,
  Palette,
  Sun,
  Laptop,
  Tag,
};

// The backend's Category table has no icon column, so categories are matched to
// an icon by name here, falling back to a generic tag for anything unlisted.
const ICON_BY_CATEGORY_NAME: Record<string, LucideIcon> = {
  travel: Plane,
  food: Soup,
  design: Palette,
  life: Sun,
  tech: Laptop,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Tag;
}

export function getIconForCategoryName(name?: string | null): LucideIcon {
  if (!name) return Tag;
  return ICON_BY_CATEGORY_NAME[name.trim().toLowerCase()] ?? Tag;
}

export interface CategoryBadgeProps {
  category_name?: string | null;
}

export function CategoryBadge({ category_name }: CategoryBadgeProps) {
  const Icon = getIconForCategoryName(category_name);
  return (
    <Badge variant="neutral">
      <Icon size={13} strokeWidth={1.75} className="text-coral" />
      {category_name || 'Uncategorized'}
    </Badge>
  );
}
