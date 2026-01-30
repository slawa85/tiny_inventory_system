import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }: TableProps) {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }: TableProps) {
  return <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;
}

interface TableCellProps extends TableProps {
  isHeader?: boolean;
}

export function TableCell({ children, className = '', isHeader = false }: TableCellProps) {
  if (isHeader) {
    return (
      <th
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      >
        {children}
      </th>
    );
  }

  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}
