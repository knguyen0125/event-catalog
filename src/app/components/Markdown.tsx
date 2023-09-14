import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

const Markdown: React.FC<React.PropsWithChildren<Options>> = ({
  remarkPlugins,
  ...props
}) => (
  <ReactMarkdown
    {...props}
    remarkPlugins={[...(remarkPlugins || []), remarkGfm]}
  />
);

export default Markdown;
