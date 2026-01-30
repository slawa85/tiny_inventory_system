import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useDeleteProduct, useCategories } from '../hooks/useProducts';
import { useStores } from '../hooks/useStores';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ProductList } from '../components/products/ProductList';
import { ProductFilters } from '../components/products/ProductFilters';
import type { ProductQueryParams } from '../types/product.types';

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductQueryParams>({ page: 1, limit: 20 });

  const { data: productsData, isLoading, error, refetch } = useProducts(filters);
  const { data: stores = [] } = useStores();
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      refetch();
    } catch {
      alert('Failed to delete product');
    }
  };

  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage all products across all stores
          </p>
        </div>
        <Link to="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <ProductFilters
        stores={stores}
        categories={categories}
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <PageSpinner />
      ) : productsData ? (
        <ProductList
          products={productsData.data}
          meta={productsData.meta}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
}
