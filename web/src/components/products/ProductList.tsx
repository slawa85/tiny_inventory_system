import { ProductTable } from './ProductTable';
import { Pagination } from '../ui/Pagination';
import type { Product } from '../../types/product.types';
import type { PaginationMeta } from '../../types/api.types';

interface ProductListProps {
  products: Product[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onDelete?: (id: string) => void;
  showStore?: boolean;
}

export function ProductList({
  products,
  meta,
  onPageChange,
  onDelete,
  showStore = true,
}: ProductListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <ProductTable products={products} onDelete={onDelete} showStore={showStore} />
      <Pagination meta={meta} onPageChange={onPageChange} />
    </div>
  );
}
