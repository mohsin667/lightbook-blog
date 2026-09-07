import { FileText } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { PostStatus } from '../../types';

export interface StatusBadgeProps {
  status: PostStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'draft') {
    return (
      <Badge variant="outline">
        <FileText size={12} strokeWidth={1.75} />
        draft
      </Badge>
    );
  }
  return null;
}
