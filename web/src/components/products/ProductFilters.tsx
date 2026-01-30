import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { ProductQueryParams } from '../../types/product.types';
import type { Store } from '../../types/store.types';

interface ProductFiltersProps {
  stores: Store[];
  categories: string[];
  initialFilters?: ProductQueryParams;
  onFilterChange: (filters: ProductQueryParams) => void;
}

export function ProductFilters({
  stores,
  categories,
  initialFilters = {},
  onFilterChange,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductQueryParams>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (key: keyof ProductQueryParams, value: string | boolean | number | undefined) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: ProductQueryParams = { page: 1 };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const storeOptions = [
    { value: '', label: 'All Stores' },
    ...stores.map((s) => ({ value: s.id, label: s.name })),
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'quantity', label: 'Quantity' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Search"
          placeholder="Name, SKU, or description"
          value={filters.search ?? ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
        <Select
          label="Store"
          options={storeOptions}
          value={filters.storeId ?? ''}
          onChange={(e) => handleChange('storeId', e.target.value)}
        />
        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category ?? ''}
          onChange={(e) => handleChange('category', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min Price"
            type="number"
            min="0"
            step="0.01"
            value={filters.minPrice ?? ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
          <Input
            label="Max Price"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxPrice ?? ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Select
          label="Sort By"
          options={sortOptions}
          value={filters.sortBy ?? 'createdAt'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        />
        <Select
          label="Sort Order"
          options={sortOrderOptions}
          value={filters.sortOrder ?? 'desc'}
          onChange={(e) => handleChange('sortOrder', e.target.value as 'asc' | 'desc')}
        />
        <div className="flex items-center space-x-4 lg:col-span-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filters.inStock ?? false}
              onChange={(e) => handleChange('inStock', e.target.checked || undefined)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>In Stock Only</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filters.lowStock ?? false}
              onChange={(e) => handleChange('lowStock', e.target.checked || undefined)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Low Stock Only</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </div>
  );
}
