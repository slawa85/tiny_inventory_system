import { Link } from 'react-router-dom';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import type { Product } from '../../types/product.types';

interface ProductTableProps {
  products: Product[];
  onDelete?: (id: string) => void;
  showStore?: boolean;
}

export function ProductTable({ products, onDelete, showStore = true }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="No products match your current filters. Try adjusting your search criteria."
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell isHeader>Name</TableCell>
          <TableCell isHeader>SKU</TableCell>
          <TableCell isHeader>Category</TableCell>
          {showStore && <TableCell isHeader>Store</TableCell>}
          <TableCell isHeader>Price</TableCell>
          <TableCell isHeader>Quantity</TableCell>
          <TableCell isHeader>Status</TableCell>
          <TableCell isHeader>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="font-medium text-gray-900">{product.name}</div>
              {product.description && (
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {product.description}
                </div>
              )}
            </TableCell>
            <TableCell>
              <span className="font-mono text-sm">{product.sku}</span>
            </TableCell>
            <TableCell>{product.category}</TableCell>
            {showStore && (
              <TableCell>
                {product.store ? (
                  <Link
                    to={`/stores/${product.storeId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {product.store.name}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
            )}
            <TableCell>{formatCurrency(Number(product.price))}</TableCell>
            <TableCell>
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    product.quantity <= product.minStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }
                `}
              >
                {product.quantity}
                {product.quantity <= product.minStock && ' (Low)'}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Link to={`/products/${product.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        onDelete(product.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
