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

import { Event } from '~/database/models.server';

const EventVisualizer: React.FC<{ event: ModelObject<Event> }> = ({
  event,
}) => {
  const navigate = useNavigate();

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: `event-${event.name}`,
    data: {
      label: event.name,
      url: `/events/${event.name}`,
    },
    position: { x: 0, y: 0 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    className: 'min-w-fit !cursor-pointer',
  });

  (event.producers || []).forEach((producer, i) => {
    nodes.push({
      id: `producer-${producer.name}`,
      data: {
        label: producer.name,
        url: `/services/${producer.name}`,
      },
      position: { x: -300, y: 100 * i },
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
    });
  });

  (event.consumers || []).forEach((consumer, i) => {
    nodes.push({
      id: `consumer-${consumer.name}`,
      data: {
        label: consumer.name,
        url: `/services/${consumer.name}`,
      },
      position: { x: 300, y: 100 * i },
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
    });
  });

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        onNodeClick={(ev, node) => {
          navigate(`${node.data.url}`);
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default EventVisualizer;
