import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { CategoryBadge } from '../post/CategoryBadge';
import type { Category } from '../../types';

export interface CategoryRowProps {
  category: Category;
  inUse: boolean;
  onDelete: (id: string) => void;
}

export function CategoryRow({ category, inUse, onDelete }: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0">
      <CategoryBadge category_name={category.name} />
      <div className="flex-1" />
      <Button
        size="sm"
        variant="danger"
        disabled={inUse}
        title={inUse ? 'In use by a post' : undefined}
        onClick={() => onDelete(category.id)}
      >
        <Trash2 size={13} strokeWidth={1.75} />
        Remove
      </Button>
    </div>
  );
}
