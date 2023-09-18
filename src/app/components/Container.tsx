import React from 'react';

const Container: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mx-auto">{children}</div>
);

export default Container;
