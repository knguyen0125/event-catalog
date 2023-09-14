import dagre from '@dagrejs/dagre';

export const DEFAULT_NODE_WIDTH = 150;
export const DEFAULT_NODE_HEIGHT = 36;
export const getNodeWidth = (text: string) =>
  Math.max(DEFAULT_NODE_WIDTH, text.length * 8);
export const PRODUCER_EDGE_LABEL = 'produces';
export const CONSUMER_EDGE_LABEL = 'consumed by';

export const createGraph = () => {
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });

  return graph;
};

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
  label?: string | null | false,
) =>
  graph.setEdge(
    sourceId,
    targetId,
    label ? { label, width: label.length * 8 } : {},
  );
