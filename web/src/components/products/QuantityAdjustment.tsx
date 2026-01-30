import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { AdjustQuantityDto, Product } from '../../types/product.types';

interface QuantityAdjustmentProps {
  product: Product;
  onAdjust: (data: AdjustQuantityDto) => void;
  isLoading?: boolean;
}

const reasonOptions = [
  { value: 'restock', label: 'Restock (received inventory)' },
  { value: 'sale', label: 'Sale (sold to customer)' },
  { value: 'return', label: 'Return (customer returned)' },
  { value: 'damaged', label: 'Damaged (write-off)' },
  { value: 'correction', label: 'Correction (inventory count)' },
  { value: 'other', label: 'Other' },
];

export function QuantityAdjustment({ product, onAdjust, isLoading }: QuantityAdjustmentProps) {
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState<AdjustQuantityDto['reason']>('restock');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const adjustmentNum = parseInt(adjustment);

    if (isNaN(adjustmentNum) || adjustmentNum === 0) {
      setError('Please enter a non-zero adjustment amount');
      return;
    }

    if (product.quantity + adjustmentNum < 0) {
      setError(`Cannot reduce by ${Math.abs(adjustmentNum)}. Current stock is ${product.quantity}.`);
      return;
    }

    onAdjust({
      adjustment: adjustmentNum,
      reason,
      note: note.trim() || undefined,
    });

    // Reset form
    setAdjustment('');
    setNote('');
  };

  const adjustmentNum = parseInt(adjustment) || 0;
  const newQuantity = product.quantity + adjustmentNum;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">Current Stock</div>
        <div className="text-2xl font-bold text-gray-900">{product.quantity}</div>
        {product.quantity <= product.minStock && (
          <div className="text-sm text-amber-600 mt-1">Below minimum stock ({product.minStock})</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Adjustment"
          type="number"
          placeholder="+10 or -5"
          value={adjustment}
          onChange={(e) => {
            setAdjustment(e.target.value);
            setError('');
          }}
          error={error}
          required
        />
        <Select
          label="Reason"
          options={reasonOptions}
          value={reason}
          onChange={(e) => setReason(e.target.value as AdjustQuantityDto['reason'])}
          required
        />
      </div>

      {adjustmentNum !== 0 && (
        <div className={`p-3 rounded-lg ${adjustmentNum > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className="text-sm text-gray-600">New quantity will be: </span>
          <span className={`font-bold ${newQuantity < 0 ? 'text-red-600' : adjustmentNum > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {newQuantity}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            ({adjustmentNum > 0 ? '+' : ''}{adjustmentNum})
          </span>
        </div>
      )}

      <Input
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g., PO #12345, damaged in shipping"
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Adjust Quantity
      </Button>
    </form>
  );
}
