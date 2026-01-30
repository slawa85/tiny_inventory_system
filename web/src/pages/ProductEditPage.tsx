import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useAdjustQuantity,
  useCategories,
  productKeys,
} from '../hooks/useProducts';
import { useStores } from '../hooks/useStores';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { ProductForm } from '../components/products/ProductForm';
import { QuantityAdjustment } from '../components/products/QuantityAdjustment';
import type { CreateProductDto, UpdateProductDto, AdjustQuantityDto } from '../types/product.types';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}

function isConflictError(error: unknown): boolean {
  return (error as ApiError)?.response?.status === 409;
}

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [conflictError, setConflictError] = useState<string | null>(null);

  const { data: product, isLoading: productLoading, error: productError } = useProduct(id ?? '');
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: categories = [] } = useCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const adjustQuantity = useAdjustQuantity();

  const handleRefresh = async () => {
    setConflictError(null);
    await queryClient.invalidateQueries({ queryKey: productKeys.detail(id!) });
  };

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    setConflictError(null);

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: id!, data: data as UpdateProductDto });
      } else {
        const storeId = searchParams.get('storeId');
        const createData = {
          ...data,
          storeId: storeId || (data as CreateProductDto).storeId,
        } as CreateProductDto;
        const newProduct = await createProduct.mutateAsync(createData);
        navigate(`/products/${newProduct.id}/edit`);
      }
    } catch (err) {
      if (isConflictError(err)) {
        setConflictError(
          'This product was modified by another user. Please refresh to see the latest version.',
        );
      } else {
        alert(`Failed to ${isEdit ? 'update' : 'create'} product: ${(err as Error).message}`);
      }
    }
  };

  const handleAdjustQuantity = async (data: AdjustQuantityDto) => {
    try {
      await adjustQuantity.mutateAsync({ id: id!, data });
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.response?.data?.message || apiError.message);
    }
  };

  const handleCancel = () => {
    if (isEdit && product) {
      navigate(`/stores/${product.storeId}`);
    } else {
      navigate('/products');
    }
  };

  if (productLoading || storesLoading) return <PageSpinner />;
  if (productError) return <ErrorMessage message={productError.message} />;
  if (isEdit && !product) return <ErrorMessage message="Product not found" />;

  const defaultStoreId = searchParams.get('storeId');
  const initialProduct = isEdit
    ? product
    : defaultStoreId
      ? ({ storeId: defaultStoreId } as any)
      : undefined;

  return (
    <div>
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back to Products
        </Link>
      </div>

      <div className={`${isEdit ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}`}>
        <Card className={isEdit ? 'lg:col-span-2' : 'max-w-2xl'}>
          <CardHeader>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
          </CardHeader>
          <CardBody>
            {conflictError && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-amber-800 font-medium">Update Conflict</p>
                    <p className="text-amber-700 text-sm mt-1">{conflictError}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
            <ProductForm
              key={product?.version}
              product={initialProduct}
              stores={stores}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createProduct.isPending || updateProduct.isPending}
              isEdit={isEdit}
            />
          </CardBody>
        </Card>

        {isEdit && product && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Adjust Quantity</h2>
            </CardHeader>
            <CardBody>
              <QuantityAdjustment
                product={product}
                onAdjust={handleAdjustQuantity}
                isLoading={adjustQuantity.isPending}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
