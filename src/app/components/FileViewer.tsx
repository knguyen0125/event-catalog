import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

export type FileViewerProps = {
  filename: string;
  content: string;
  filetype: string;
};

const FileViewer: React.FC<FileViewerProps> = ({
  filename,
  filetype,
  content,
}) => {
  if (!content) {
    return null;
  }
  return (
    <Highlight language="js" code={content} theme={themes.vsDark}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style} className={className}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export default FileViewer;
