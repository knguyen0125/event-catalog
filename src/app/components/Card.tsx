import React from 'react';
import clsx from 'clsx';

const Card: React.FC<React.PropsWithChildren<{ title?: React.ReactNode }>> = ({
  title,
  children,
}) => {
  return (
    <div className="rounded-md bg-white py-4 shadow">
      {title && (
        <div className="border-b border-gray-200 px-4 pb-4">
          <div className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </div>
        </div>
      )}
      <div className={clsx('px-4', title && 'pt-4')}>{children}</div>
    </div>
  );
};

export default Card;
