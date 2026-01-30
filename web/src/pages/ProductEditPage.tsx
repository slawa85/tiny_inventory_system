import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useProduct, useCreateProduct, useUpdateProduct, useCategories } from '../hooks/useProducts';
import { useStores } from '../hooks/useStores';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ProductForm } from '../components/products/ProductForm';
import type { CreateProductDto, UpdateProductDto } from '../types/product.types';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: product, isLoading: productLoading, error: productError } = useProduct(id ?? '');
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: categories = [] } = useCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: id!, data });
        navigate(`/products/${id}/edit`);
      } else {
        const storeId = searchParams.get('storeId');
        const createData = { ...data, storeId: storeId || (data as CreateProductDto).storeId } as CreateProductDto;
        const newProduct = await createProduct.mutateAsync(createData);
        navigate(`/products/${newProduct.id}/edit`);
      }
    } catch (err) {
      alert(`Failed to ${isEdit ? 'update' : 'create'} product: ${(err as Error).message}`);
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
  const initialProduct = isEdit ? product : defaultStoreId ? { storeId: defaultStoreId } as any : undefined;

  return (
    <div>
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back to Products
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h1>
        </CardHeader>
        <CardBody>
          <ProductForm
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
    </div>
  );
}
