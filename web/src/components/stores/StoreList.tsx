import { StoreCard } from './StoreCard';
import { EmptyState } from '../ui/EmptyState';
import type { Store } from '../../types/store.types';

interface StoreListProps {
  stores: Store[];
}

export function StoreList({ stores }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <EmptyState
        title="No stores found"
        description="There are no stores in the system yet."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
