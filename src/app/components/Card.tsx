import React from 'react';
import clsx from 'clsx';

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-white shadow hover:bg-gray-50 hover:shadow-md',
        className,
      )}
    >
      <div className={'p-4'}>{children}</div>
    </div>
  );
};

export default Card;
