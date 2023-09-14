import { useNavigate } from '@remix-run/react';
import { ModelObject } from 'objection';
import React from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  Node,
  Position,
  ReactFlow,
} from 'reactflow';
import dagre from '@dagrejs/dagre';

import { Cog8ToothIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Event } from '~/database/models.server';
import {
  addGraphEdge,
  addGraphNode,
  CONSUMER_EDGE_LABEL,
  createGraph,
  DEFAULT_NODE_HEIGHT,
  getNodeWidth,
  PRODUCER_EDGE_LABEL,
} from '~/components/visualizer/common';

const EventVisualizer: React.FC<{
  event: ModelObject<Event>;
  withLabel?: boolean;
}> = ({ event, withLabel = true }) => {
  const navigate = useNavigate();
  const graph = createGraph();

  graph.setNode(`event-${event.name}`, {
    label: event.name,
    width: getNodeWidth(event.name),
    height: DEFAULT_NODE_HEIGHT,
  });

  (event.producers || []).forEach((producer) => {
    addGraphNode(graph, `producer-${producer.name}`, producer.name);
    addGraphEdge(
      graph,
      `producer-${producer.name}`,
      `event-${event.name}`,
      withLabel && PRODUCER_EDGE_LABEL,
    );
  });

  (event.consumers || []).forEach((consumer) => {
    addGraphNode(graph, `consumer-${consumer.name}`, consumer.name);
    addGraphEdge(
      graph,
      `event-${event.name}`,
      `consumer-${consumer.name}`,
      withLabel && CONSUMER_EDGE_LABEL,
    );
  });

  dagre.layout(graph);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: `event-${event.name}`,
    data: {
      label: (
        <div className="inline-flex items-center gap-x-1 align-bottom">
          <EnvelopeIcon className="h-4 w-4 text-emerald-500" />
          <span>{event.name}</span>
        </div>
      ),
    },
    position: graph.node(`event-${event.name}`),
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    className: 'min-w-fit !cursor-auto !hover:shadow-0 !border-emerald-500',
  });

  (event.producers || []).forEach((producer) => {
    nodes.push({
      id: `producer-${producer.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <Cog8ToothIcon className="h-4 w-4 text-blue-500" />
            <span>{producer.name}</span>
          </div>
        ),
        url: `/services/${producer.name}`,
      },
      position: graph.node(`producer-${producer.name}`),
      type: 'input',
      sourcePosition: Position.Right,
      className: '!border-blue-500 min-w-fit !cursor-pointer',
    });

    edges.push({
      id: `producer-${producer.name}-to-event-${event.name}`,
      source: `producer-${producer.name}`,
      target: `event-${event.name}`,
      animated: true,
      markerEnd: {
        type: MarkerType.Arrow,
      },
      className: '!border-blue-500',
      type: 'smoothstep',
      label: withLabel ? 'produces' : null,
    });
  });

  (event.consumers || []).forEach((consumer) => {
    nodes.push({
      id: `consumer-${consumer.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <Cog8ToothIcon className="h-4 w-4 text-blue-500" />
            <span>{consumer.name}</span>
          </div>
        ),
        url: `/services/${consumer.name}`,
      },
      position: graph.node(`consumer-${consumer.name}`),
      type: 'output',
      targetPosition: Position.Left,
      className: '!border-blue-500 min-w-fit !cursor-pointer',
    });

    edges.push({
      id: `event-${event.name}-to-consumer-${consumer.name}`,
      source: `event-${event.name}`,
      target: `consumer-${consumer.name}`,
      animated: true,
      markerEnd: {
        type: MarkerType.Arrow,
      },
      type: 'smoothstep',
      label: withLabel ? 'consumed by' : null,
    });
  });

  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      draggable={false}
      onNodeClick={(ev, node) => {
        if (node.data.url) {
          navigate(`${node.data.url}`);
        }
      }}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export default EventVisualizer;
