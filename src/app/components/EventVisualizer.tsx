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

const getWidth = (text: string) => Math.max(150, text.length * 10);

const EventVisualizer: React.FC<{
  event: ModelObject<Event>;
  withLabel?: boolean;
}> = ({ event, withLabel = true }) => {
  const navigate = useNavigate();
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setNode(`event-${event.name}`, {
    label: event.name,
    width: getWidth(event.name),
    height: 36,
  });

  (event.producers || []).forEach((producer) => {
    graph.setNode(`producer-${producer.name}`, {
      label: producer.name,
      width: getWidth(producer.name),
      height: 36,
    });

    graph.setEdge(
      `producer-${producer.name}`,
      `event-${event.name}`,
      withLabel
        ? {
            label: 'produces',
            width: 'produces'.length * 8,
          }
        : {},
    );
  });

  (event.consumers || []).forEach((consumer) => {
    graph.setNode(`consumer-${consumer.name}`, {
      label: consumer.name,
      width: getWidth(consumer.name),
      height: 36,
    });

    graph.setEdge(
      `event-${event.name}`,
      `consumer-${consumer.name}`,
      withLabel
        ? {
            label: 'consumed by',
            width: 'consumed by'.length * 8,
          }
        : {},
    );
  });

  dagre.layout(graph, {
    rankdir: 'LR',
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: `event-${event.name}`,
    data: {
      label: (
        <div className="inline-flex items-center gap-x-1 align-bottom">
          <EnvelopeIcon className="h-4 w-4" />
          <span>{event.name}</span>
        </div>
      ),
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
            <Cog8ToothIcon className="h-4 w-4 text-emerald-500" />
            <span>{consumer.name}</span>
          </div>
        ),
        url: `/services/${consumer.name}`,
      },
      position: graph.node(`consumer-${consumer.name}`),
      type: 'output',
      targetPosition: Position.Left,
      className: '!border-emerald-500 min-w-fit !cursor-pointer',
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
