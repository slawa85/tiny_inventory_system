import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { CreateStoreDto, Store, UpdateStoreDto } from '../../types/store.types';

interface StoreFormProps {
  store?: Store;
  onSubmit: (data: CreateStoreDto | UpdateStoreDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StoreForm({ store, onSubmit, onCancel, isLoading }: StoreFormProps) {
  const [formData, setFormData] = useState({
    name: store?.name ?? '',
    address: store?.address ?? '',
    city: store?.city ?? '',
    state: store?.state ?? '',
    zipCode: store?.zipCode ?? '',
    phone: store?.phone ?? '',
    email: store?.email ?? '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Store Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          required
        />
        <Input
          label="State"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          required
        />
      </div>
      <Input
        label="ZIP Code"
        value={formData.zipCode}
        onChange={(e) => handleChange('zipCode', e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {store ? 'Update Store' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}
