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

import { Event } from '~/database/models.server';

const EventVisualizer: React.FC<{ event: ModelObject<Event> }> = ({
  event,
}) => {
  const navigate = useNavigate();
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setNode(`event-${event.name}`, {
    label: event.name,
    width: Math.max(150, event.name.length * 10),
    height: 36,
  });

  (event.producers || []).forEach((producer) => {
    graph.setNode(`producer-${producer.name}`, {
      label: producer.name,
      width: 150,
      height: 36,
    });

    graph.setEdge(`producer-${producer.name}`, `event-${event.name}`);
  });

  (event.consumers || []).forEach((consumer) => {
    graph.setNode(`consumer-${consumer.name}`, {
      label: consumer.name,
      width: 150,
      height: 36,
    });

    graph.setEdge(`event-${event.name}`, `consumer-${consumer.name}`);
  });

  dagre.layout(graph, {
    rankdir: 'LR',
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: `event-${event.name}`,
    data: {
      label: event.name,
    },
    position: graph.node(`event-${event.name}`),
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    className: 'min-w-fit !cursor-auto !hover:shadow-0',
  });

  (event.producers || []).forEach((producer) => {
    nodes.push({
      id: `producer-${producer.name}`,
      data: {
        label: producer.name,
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
    });
  });

  (event.consumers || []).forEach((consumer) => {
    nodes.push({
      id: `consumer-${consumer.name}`,
      data: {
        label: consumer.name,
        url: `/services/${consumer.name}`,
      },
      position: graph.node(`consumer-${consumer.name}`),
      type: 'output',
      targetPosition: Position.Left,
      className: '!border-green-500 min-w-fit !cursor-pointer',
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
    });
  });

  return (
    <div style={{ width: '100%', height: '250px' }}>
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
    </div>
  );
};

export default EventVisualizer;
