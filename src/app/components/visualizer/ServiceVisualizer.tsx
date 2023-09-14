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
import { Service } from '~/database/models.server';
import {
  DEFAULT_NODE_HEIGHT,
  getNodeWidth,
} from '~/components/visualizer/common';

const ServiceVisualizer: React.FC<{
  service: ModelObject<Service>;
  withLabel?: boolean;
}> = ({ service, withLabel = true }) => {
  const navigate = useNavigate();
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setNode(`service-${service.name}`, {
    label: service.name,
    width: getNodeWidth(service.name),
    height: DEFAULT_NODE_HEIGHT,
  });

  (service.producesEvents || []).forEach((producedEvent) => {
    graph.setNode(`produced-event-${producedEvent.name}`, {
      label: producedEvent.name,
      width: getNodeWidth(producedEvent.name),
      height: DEFAULT_NODE_HEIGHT,
    });

    graph.setEdge(
      `service-${service.name}`,
      `produced-event-${producedEvent.name}`,
      withLabel
        ? {
            label: 'produces',
            width: 'produces'.length * 8,
          }
        : {},
    );
  });

  (service.consumesEvents || []).forEach((consumedEvent) => {
    graph.setNode(`consumed-event-${consumedEvent.name}`, {
      label: consumedEvent.name,
      width: getNodeWidth(consumedEvent.name),
      height: DEFAULT_NODE_HEIGHT,
    });

    graph.setEdge(
      `consumed-event-${consumedEvent.name}`,
      `service-${service.name}`,
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
    id: `service-${service.name}`,
    data: {
      label: (
        <div className="inline-flex items-center gap-x-1 align-bottom">
          <Cog8ToothIcon className="h-4 w-4" />
          <span>{service.name}</span>
        </div>
      ),
    },
    position: graph.node(`service-${service.name}`),
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    className: 'min-w-fit !cursor-auto !hover:shadow-0',
  });

  (service.producesEvents || []).forEach((producedEvent) => {
    nodes.push({
      id: `produced-event-${producedEvent.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <EnvelopeIcon className="h-4 w-4 text-blue-500" />
            <span>{producedEvent.name}</span>
          </div>
        ),
        url: `/events/${producedEvent.name}`,
      },
      position: graph.node(`produced-event-${producedEvent.name}`),
      type: 'output',
      targetPosition: Position.Left,
      className: '!border-blue-500 min-w-fit !cursor-pointer',
    });

    edges.push({
      id: `service-${service.name}-to-produced-event-${producedEvent.name}`,
      source: `service-${service.name}`,
      target: `produced-event-${producedEvent.name}`,
      animated: true,
      markerEnd: {
        type: MarkerType.Arrow,
      },
      className: '!border-blue-500',
      type: 'smoothstep',
      label: withLabel ? 'produces' : null,
    });
  });

  (service.consumesEvents || []).forEach((consumedEvent) => {
    nodes.push({
      id: `consumed-event-${consumedEvent.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <EnvelopeIcon className="h-4 w-4 text-emerald-500" />
            <span>{consumedEvent.name}</span>
          </div>
        ),
        url: `/events/${consumedEvent.name}`,
      },
      position: graph.node(`consumed-event-${consumedEvent.name}`),
      type: 'input',
      sourcePosition: Position.Right,
      className: '!border-emerald-500 min-w-fit !cursor-pointer',
    });

    edges.push({
      id: `consumed-event-${consumedEvent.name}-to-service-${service.name}`,
      source: `consumed-event-${consumedEvent.name}`,
      target: `service-${service.name}`,
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

export default ServiceVisualizer;
