import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { CreateProductDto, Product, UpdateProductDto } from '../../types/product.types';
import type { Store } from '../../types/store.types';

interface ProductFormProps {
  product?: Product;
  stores: Store[];
  categories: string[];
  onSubmit: (data: CreateProductDto | UpdateProductDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const defaultCategories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];

export function ProductForm({
  product,
  stores,
  categories,
  onSubmit,
  onCancel,
  isLoading,
  isEdit,
}: ProductFormProps) {
  const allCategories = [...new Set([...defaultCategories, ...categories])].sort();

  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? allCategories[0] ?? '',
    price: product?.price?.toString() ?? '',
    quantity: product?.quantity?.toString() ?? '0',
    minStock: product?.minStock?.toString() ?? '10',
    storeId: product?.storeId ?? stores[0]?.id ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!isEdit && formData.quantity && parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    if (!isEdit && !formData.storeId) newErrors.storeId = 'Store is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEdit && product) {
      // Update: include version for optimistic locking, exclude quantity
      const data: UpdateProductDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sku: formData.sku.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        minStock: parseInt(formData.minStock) || 10,
        version: product.version,
      };
      onSubmit(data);
    } else {
      // Create: include quantity and storeId
      const data: CreateProductDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sku: formData.sku.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 10,
        storeId: formData.storeId,
      };
      onSubmit(data);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));
  const categoryOptions = allCategories.map((c) => ({ value: c, label: c }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
          error={errors.sku}
          required
        />
        <Select
          label="Category"
          options={categoryOptions}
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          error={errors.category}
          required
        />
      </div>
      <div className={`grid ${isEdit ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
        <Input
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          error={errors.price}
          required
        />
        {!isEdit && (
          <Input
            label="Initial Quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
          />
        )}
        <Input
          label="Min Stock"
          type="number"
          min="0"
          value={formData.minStock}
          onChange={(e) => handleChange('minStock', e.target.value)}
        />
      </div>
      {!isEdit && (
        <Select
          label="Store"
          options={storeOptions}
          value={formData.storeId}
          onChange={(e) => handleChange('storeId', e.target.value)}
          error={errors.storeId}
          required
        />
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
