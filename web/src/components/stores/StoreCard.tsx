import { Link } from 'react-router-dom';
import { Card, CardBody } from '../ui/Card';
import type { Store } from '../../types/store.types';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link to={`/stores/${store.id}`}>
      <Card className="hover:shadow-md transition-shadow duration-200 h-full">
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
              <p className="text-sm text-gray-500">
                {store.city}, {store.state} {store.zipCode}
              </p>
              <p className="text-sm text-gray-500">{store.address}</p>
            </div>
            <span
              className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${store.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              `}
            >
              {store.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Products</span>
              <span className="font-medium text-gray-900">{store._count?.products ?? 0}</span>
            </div>
            {store.phone && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-900">{store.phone}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
