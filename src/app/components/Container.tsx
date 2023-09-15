import React from 'react';

const Container: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mx-auto px-2 sm:px-6 lg:px-8">{children}</div>
);

export default Container;
