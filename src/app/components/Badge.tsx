import React from 'react';
import clsx from 'clsx';

const Badge: React.FC<
  React.PropsWithChildren<{ className?: string; color?: string }>
> = ({ children, className, color }) => (
  <span
    className={clsx('rounded-full px-2 py-1 text-sm text-gray-700', className)}
    style={{ backgroundColor: color }}
  >
    {children}
  </span>
);

export default Badge;
