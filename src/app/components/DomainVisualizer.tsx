import _ from 'lodash';
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

import {
  Cog8ToothIcon,
  EnvelopeIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { Domain } from '~/database/models.server';

const getWidth = (text: string) => Math.max(150, text.length * 10);

const DomainVisualizer: React.FC<{
  domain: ModelObject<Domain>;
  withLabel?: boolean;
}> = ({ domain, withLabel = true }) => {
  const navigate = useNavigate();
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });
  graph.setDefaultEdgeLabel(() => ({}));

  (domain.events || []).forEach((event) => {
    graph.setNode(`event-${event.name}`, {
      label: event.name,
      width: getWidth(event.name),
      height: 36,
    });
  });

  (domain.services || []).forEach((service) => {
    graph.setNode(`service-${service.name}`, {
      label: service.name,
      width: getWidth(service.name),
      height: 36,
    });

    (service.producesEvents || []).forEach((producedEvent) => {
      let eventId = `event-${producedEvent.name}`;
      if (!_.includes(domain.events?.map((e) => e.name), producedEvent.name)) {
        eventId = `service-${service.name}-produces-event-${producedEvent.name}`;
        graph.setNode(eventId, {
          label: producedEvent.name,
          width: getWidth(producedEvent.name),
          height: 36,
        });
      }

      graph.setEdge(
        `service-${service.name}`,
        eventId,
        withLabel
          ? {
              label: 'produces',
              width: 'produces'.length * 8,
            }
          : {},
      );
    });

    (service.consumesEvents || []).forEach((consumedEvent) => {
      let eventId = `event-${consumedEvent.name}`;
      if (!_.includes(domain.events?.map((e) => e.name), consumedEvent.name)) {
        eventId = `service-${service.name}-consumes-event-${consumedEvent.name}`;
        graph.setNode(eventId, {
          label: consumedEvent.name,
          width: getWidth(consumedEvent.name),
          height: 36,
        });
      }

      graph.setEdge(
        eventId,
        `service-${service.name}`,
        withLabel
          ? {
              label: 'consumes',
              width: 'consumes'.length * 8,
            }
          : {},
      );
    });
  });

  dagre.layout(graph, {
    rankdir: 'LR',
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  (domain.events || []).forEach((event) => {
    nodes.push({
      id: `event-${event.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <EnvelopeIcon className="h-4 w-4 text-blue-500" />
            <span>{event.name}</span>
          </div>
        ),
        url: `/events/${event.name}`,
      },
      position: graph.node(`event-${event.name}`),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      className: 'min-w-fit !cursor-auto !hover:shadow-0 !border-blue-500',
    });
  });

  (domain.services || []).forEach((service) => {
    nodes.push({
      id: `service-${service.name}`,
      data: {
        label: (
          <div className="inline-flex items-center gap-x-1 align-bottom">
            <Cog8ToothIcon className="h-4 w-4 text-emerald-500" />
            <span>{service.name}</span>
          </div>
        ),
        url: `/services/${service.name}`,
      },
      position: graph.node(`service-${service.name}`),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      className: 'min-w-fit !cursor-auto !hover:shadow-0 !border-emerald-500',
    });

    (service.producesEvents || []).forEach((producedEvent) => {
      let eventId = `event-${producedEvent.name}`;

      if (!_.includes(domain.events?.map((e) => e.name), producedEvent.name)) {
        eventId = `service-${service.name}-produces-event-${producedEvent.name}`;
        nodes.push({
          id: eventId,
          data: {
            label: (
              <div className="inline-flex items-center gap-x-1 align-bottom">
                <Cog8ToothIcon className="h-4 w-4 text-emerald-500" />
                <span>{producedEvent.name}</span>
              </div>
            ),
            url: `/events/${producedEvent.name}`,
          },
          position: graph.node(eventId),
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
          className:
            'min-w-fit !cursor-auto !hover:shadow-0 !border-emerald-500',
        });
      }

      edges.push({
        id: `service-${service.name}-produces-event-${producedEvent.name}`,
        source: `service-${service.name}`,
        target: eventId,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
        },
        className: '!border-emerald-500',
        label: withLabel ? 'produces' : null,
      });
    });

    (service.consumesEvents || []).forEach((consumedEvent) => {
      let eventId = `event-${consumedEvent.name}`;

      if (!_.includes(domain.events?.map((e) => e.name), consumedEvent.name)) {
        eventId = `service-${service.name}-consumes-event-${consumedEvent.name}`;
        nodes.push({
          id: eventId,
          data: {
            label: (
              <div className="inline-flex items-center gap-x-1 align-bottom">
                <Cog8ToothIcon className="h-4 w-4 text-emerald-500" />
                <span>{consumedEvent.name}</span>
              </div>
            ),
            url: `/events/${consumedEvent.name}`,
          },
          position: graph.node(eventId),
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
          className:
            'min-w-fit !cursor-auto !hover:shadow-0 !border-emerald-500',
        });
      }

      edges.push({
        id: `service-${service.name}-consumes-event-${consumedEvent.name}`,
        source: eventId,
        target: `service-${service.name}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
        },
        className: '!border-emerald-500',
        label: withLabel ? 'consumes' : null,
      });
    });
  });

  return (
    <div style={{ width: '100%', height: '500px' }}>
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

export default DomainVisualizer;