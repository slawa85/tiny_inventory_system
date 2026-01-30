import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStores';
import { useProducts, useDeleteProduct, useCategories } from '../hooks/useProducts';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ProductList } from '../components/products/ProductList';
import { ProductFilters } from '../components/products/ProductFilters';
import { formatNumber } from '../utils/formatters';
import type { ProductQueryParams } from '../types/product.types';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<ProductQueryParams>({ storeId: id, page: 1, limit: 10 });

  const { data: store, isLoading: storeLoading, error: storeError, refetch: refetchStore } = useStore(id!);
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts(filters);
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();

  if (storeLoading) return <PageSpinner />;
  if (storeError) return <ErrorMessage message={storeError.message} onRetry={refetchStore} />;
  if (!store) return <ErrorMessage message="Store not found" />;

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters({ ...newFilters, storeId: id });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      refetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const totalProducts = store._count?.products ?? 0;

  return (
    <div>
      <div className="mb-6">
        <Link to="/stores" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back to Stores
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${store.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}
              >
                {store.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {store.address}<br />
                  {store.city}, {store.state} {store.zipCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {store.phone && <div>{store.phone}</div>}
                  {store.email && <div>{store.email}</div>}
                  {!store.phone && !store.email && <span className="text-gray-400">No contact info</span>}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Inventory Summary</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Total Products</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {formatNumber(totalProducts)}
                </div>
              </div>
              {productsData && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Showing</div>
                  <div className="mt-1 text-lg text-gray-900">
                    {productsData.meta.total} filtered products
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <Link to={`/products/new?storeId=${id}`}>
          <Button>Add Product</Button>
        </Link>
      </div>

      <ProductFilters
        stores={[store]}
        categories={categories}
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {productsLoading ? (
        <PageSpinner />
      ) : productsData ? (
        <ProductList
          products={productsData.data}
          meta={productsData.meta}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          showStore={false}
        />
      ) : null}
    </div>
  );
}
