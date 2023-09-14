import _ from 'lodash';
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
import { Service } from '~/database/models.server';
import {
  addGraphEdge,
  addGraphNode,
  CONSUMER_EDGE_LABEL,
  createGraph,
  PRODUCER_EDGE_LABEL,
} from '~/components/visualizer/common';

type DomainVisualizerProps = {
  services: ModelObject<Service>[];
  domainName?: string;
  withEdgeLabel?: boolean;
};

const ServicesVisualizer: React.FC<DomainVisualizerProps> = ({
  services,
  domainName,
  withEdgeLabel = false,
}) => {
  const considerExternalEvents = !!domainName;
  const reactFlowInstance = useReactFlow();
  const navigate = useNavigate();
  const [showExternalEvents, setShowExternalEvents] = React.useState(
    considerExternalEvents,
  );

  const graph = createGraph();

  (services || []).forEach((service) => {
    const serviceId = `service-${service.name}`;
    addGraphNode(graph, serviceId, service.name);

    const addProducedEvent = (eventName: string) => {
      const eventId = `service-${service.name}-produces-event-${eventName}`;
      addGraphNode(graph, eventId, eventName);
      addGraphEdge(
        graph,
        serviceId,
        eventId,
        withEdgeLabel ? PRODUCER_EDGE_LABEL : undefined,
      );
    };

    const addConsumedEvent = (eventName: string) => {
      const eventId = `service-${service.name}-consumes-event-${eventName}`;
      addGraphNode(graph, eventId, eventName);
      addGraphEdge(
        graph,
        eventId,
        serviceId,
        withEdgeLabel ? CONSUMER_EDGE_LABEL : undefined,
      );
    };

    (service.producesEvents || []).forEach((producedEvent) => {
      if (considerExternalEvents) {
        const isExternalEvent = producedEvent.domain_name !== domainName;

        if (isExternalEvent && !showExternalEvents) {
          return;
        }
      }

      addProducedEvent(producedEvent.name);
    });

    if (
      (service.producesEvents || []).length === 0 ||
      (!showExternalEvents &&
        _.every(
          service.producesEvents,
          (producedEvent) =>
            considerExternalEvents && producedEvent.domain_name !== domainName,
        ))
    ) {
      addProducedEvent('none');
    }

    (service.consumesEvents || []).forEach((consumedEvent) => {
      if (considerExternalEvents) {
        const isExternalEvent = consumedEvent.domain_name !== domainName;

        if (isExternalEvent && !showExternalEvents) {
          return;
        }
      }

      addConsumedEvent(consumedEvent.name);
    });

    if (
      (service.consumesEvents || []).length === 0 ||
      (!showExternalEvents &&
        _.every(
          service.consumesEvents,
          (consumedEvent) =>
            considerExternalEvents && consumedEvent.domain_name !== domainName,
        ))
    ) {
      addConsumedEvent('none');
    }
  });

  dagre.layout(graph);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  (services || []).forEach((service) => {
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
      if (considerExternalEvents) {
        const isExternalEvent = producedEvent.domain_name !== domainName;

        if (isExternalEvent && !showExternalEvents) {
          return;
        }
      }

      const eventId = `service-${service.name}-produces-event-${producedEvent.name}`;
      nodes.push({
        id: eventId,
        data: {
          label: (
            <div className="inline-flex items-center gap-x-1 align-bottom">
              <EnvelopeIcon className="h-4 w-4 text-blue-500" />
              <span>{producedEvent.name}</span>
              {considerExternalEvents &&
                producedEvent.domain_name !== domainName && (
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
        label: withEdgeLabel ? PRODUCER_EDGE_LABEL : null,
      });
    });

    (service.consumesEvents || []).forEach((consumedEvent) => {
      if (considerExternalEvents) {
        const isExternalEvent = consumedEvent.domain_name !== domainName;

        if (isExternalEvent && !showExternalEvents) {
          return;
        }
      }

      const eventId = `service-${service.name}-consumes-event-${consumedEvent.name}`;
      nodes.push({
        id: eventId,
        data: {
          label: (
            <div className="inline-flex items-center gap-x-1 align-bottom">
              <EnvelopeIcon className="h-4 w-4 text-blue-500" />
              <span>{consumedEvent.name}</span>
              {considerExternalEvents &&
                consumedEvent.domain_name !== domainName && (
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
        label: withEdgeLabel ? CONSUMER_EDGE_LABEL : null,
      });
    });
  });

  useEffect(() => {
    setTimeout(() => {
      reactFlowInstance.fitView();
    }, 0);
  }, [nodes]);

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
      {considerExternalEvents && (
        <Panel position="top-right">
          <label
            htmlFor="show-external-events"
            className="flex items-center gap-x-2 rounded bg-white p-2 text-sm shadow"
          >
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
        </Panel>
      )}
    </ReactFlow>
  );
};

const WrappedServicesVisualizer: React.FC<DomainVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ServicesVisualizer {...props} />
    </ReactFlowProvider>
  );
};

export default WrappedServicesVisualizer;
