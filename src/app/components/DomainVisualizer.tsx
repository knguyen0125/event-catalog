import { useNavigate } from '@remix-run/react';
import { ModelObject } from 'objection';
import React, { useEffect } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  Node,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import dagre from '@dagrejs/dagre';

import {
  Cog8ToothIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Domain } from '~/database/models.server';

const getWidth = (text: string) => Math.max(150, text.length * 10);

const DomainVisualizer: React.FC<{
  domain: ModelObject<Domain>;
  withLabel?: boolean;
}> = ({ domain, withLabel = true }) => {
  const reactFlowInstance = useReactFlow();
  const navigate = useNavigate();
  const graph = new dagre.graphlib.Graph();
  const [showExternalEvents, setShowExternalEvents] = React.useState(false);

  graph.setGraph({
    rankdir: 'LR',
    ranker: 'network-simplex',
  });
  graph.setDefaultEdgeLabel(() => ({}));

  (domain.services || []).forEach((service) => {
    graph.setNode(`service-${service.name}`, {
      label: service.name,
      width: getWidth(service.name),
      height: 36,
    });

    (service.producesEvents || []).forEach((producedEvent) => {
      const eventId = `service-${service.name}-produces-event-${producedEvent.name}`;

      const isExternalEvent = producedEvent.domain_name !== domain.name;

      if (isExternalEvent && !showExternalEvents) {
        return;
      }

      graph.setNode(eventId, {
        label: producedEvent.name,
        width: getWidth(producedEvent.name),
        height: 36,
      });

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
      const isExternalEvent = consumedEvent.domain_name !== domain.name;

      if (isExternalEvent && !showExternalEvents) {
        return;
      }
      const eventId = `service-${service.name}-consumes-event-${consumedEvent.name}`;
      graph.setNode(eventId, {
        label: consumedEvent.name,
        width: getWidth(consumedEvent.name),
        height: 36,
      });

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
      const isExternalEvent = producedEvent.domain_name !== domain.name;

      if (isExternalEvent && !showExternalEvents) {
        return;
      }
      const eventId = `service-${service.name}-produces-event-${producedEvent.name}`;
      nodes.push({
        id: eventId,
        data: {
          label: (
            <div className="inline-flex items-center gap-x-1 align-bottom">
              <EnvelopeIcon className="h-4 w-4 text-blue-500" />
              <span>{producedEvent.name}</span>
              {producedEvent.domain_name !== domain.name && (
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
          ),
          url: `/events/${producedEvent.name}`,
        },
        position: graph.node(eventId),
        type: 'output',
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        className: 'min-w-fit !cursor-auto !hover:shadow-0 !border-blue-500',
      });

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
      const isExternalEvent = consumedEvent.domain_name !== domain.name;

      if (isExternalEvent && !showExternalEvents) {
        return;
      }

      const eventId = `service-${service.name}-consumes-event-${consumedEvent.name}`;
      nodes.push({
        id: eventId,
        data: {
          label: (
            <div className="inline-flex items-center gap-x-1 align-bottom">
              <EnvelopeIcon className="h-4 w-4 text-blue-500" />
              <span>{consumedEvent.name}</span>
              {consumedEvent.domain_name !== domain.name && (
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
          ),
          url: `/events/${consumedEvent.name}`,
        },
        position: graph.node(eventId),
        type: 'input',
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        className: 'min-w-fit !cursor-auto !hover:shadow-0 !border-blue-500',
      });

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

  useEffect(() => {
    setTimeout(() => {
      reactFlowInstance.fitView();
    }, 0);
  }, [nodes]);

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
        <Panel position="top-right">
          <div className="flex items-center gap-x-2 rounded bg-white p-2 shadow">
            <label htmlFor="show-external-events" className="text-sm">
              <input
                id="show-external-events"
                type="checkbox"
                checked={showExternalEvents}
                onChange={(ev) => {
                  setShowExternalEvents(ev.target.checked);
                }}
              />
              Show external events
            </label>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const WrappedDomainVisualizer: React.FC<{
  domain: ModelObject<Domain>;
  withLabel?: boolean;
}> = ({ domain, withLabel = true }) => {
  return (
    <ReactFlowProvider>
      <DomainVisualizer domain={domain} withLabel={withLabel} />
    </ReactFlowProvider>
  );
};

export default WrappedDomainVisualizer;
