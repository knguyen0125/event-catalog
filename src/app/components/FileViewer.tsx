/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import clsx from 'clsx';

export type FileViewerProps = {
  filename: string;
  content: string;
  language: string;
  className?: string;
};

const FileViewer: React.FC<FileViewerProps> = ({
  filename,
  language,
  content,
  className,
}) => {
  if (!content) {
    return null;
  }
  return (
    <div>
      <div className={clsx('rounded-t bg-gray-200 px-4 py-2', className)}>
        {filename}
      </div>
      <Highlight language={language} code={content} theme={themes.github}>
        {(highlight) => (
          <pre
            style={highlight.style}
            className={clsx(highlight.className, 'rounded-b px-4 py-2')}
          >
            {highlight.tokens.map((line, i) => (
              <div key={i} {...highlight.getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...highlight.getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default FileViewer;
