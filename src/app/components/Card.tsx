import React from 'react';

const Card: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={
        'overflow-hidden rounded-lg border-l-8 border-l-indigo-500 bg-white shadow hover:bg-gray-50 hover:shadow-md'
      }
    >
      <div className={'p-4'}>{children}</div>
    </div>
  );
};

export default Card;
