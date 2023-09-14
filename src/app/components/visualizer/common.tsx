export const DEFAULT_NODE_WIDTH = 150;
export const DEFAULT_NODE_HEIGHT = 36;
export const getNodeWidth = (text: string) =>
  Math.max(DEFAULT_NODE_WIDTH, text.length * 10);
