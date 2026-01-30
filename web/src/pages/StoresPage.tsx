import { useStores } from '../hooks/useStores';
import { useInventoryValue } from '../hooks/useAnalytics';
import { StoreList } from '../components/stores/StoreList';
import { Card, CardBody } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function StoresPage() {
  const { data: stores, isLoading, error, refetch } = useStores();
  const { data: inventoryValue } = useInventoryValue();

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your store locations and view inventory summaries
        </p>
      </div>

      {inventoryValue && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500">Total Stores</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {stores?.length ?? 0}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500">Total Inventory Value</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(inventoryValue.grandTotal)}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500">Total Products</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {formatNumber(
                  inventoryValue.stores.reduce((sum, s) => sum + s.totalProducts, 0)
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <StoreList stores={stores ?? []} />
    </div>
  );
}
