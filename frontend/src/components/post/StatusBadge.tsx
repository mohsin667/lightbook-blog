import { FileText, Flag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Post } from '../../data/mockData';

export interface StatusBadgeProps {
  status: Post['status'];
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
  if (status === 'flagged') {
    return (
      <Badge variant="danger">
        <Flag size={12} strokeWidth={1.75} />
        flagged
      </Badge>
    );
  }
  return null;
}
