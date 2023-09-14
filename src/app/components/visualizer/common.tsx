import dagre from '@dagrejs/dagre';

export const DEFAULT_NODE_WIDTH = 150;
export const DEFAULT_NODE_HEIGHT = 36;
export const getNodeWidth = (text: string) =>
  Math.max(DEFAULT_NODE_WIDTH, text.length * 10);

export const addGraphNode = (
  graph: dagre.graphlib.Graph,
  id: string,
  label: string,
) => {
  graph.setNode(id, {
    label,
    width: getNodeWidth(label),
    height: DEFAULT_NODE_HEIGHT,
  });
};

export const addGraphEdge = (
  graph: dagre.graphlib.Graph,
  sourceId: string,
  targetId: string,
  label?: string,
) =>
  graph.setEdge(
    sourceId,
    targetId,
    label ? { label, width: label.length * 8 } : {},
  );
