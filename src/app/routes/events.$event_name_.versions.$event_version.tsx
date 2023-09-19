import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect, Response, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Event } from '~/database/models.server';
import Badge from '~/components/Badge';
import Breadcrumb from '~/components/Breadcrumb';
import EventDetailPageSidebar from '~/components/event-detail-page/EventDetailPageSidebar';
import catalogHash from '../../../catalogHash.json';
import FileViewer from '~/components/FileViewer';
import EventVisualizer from '~/components/visualizer/EventVisualizer';
import Card from '~/components/Card';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.event.name} | Events` },
  { name: 'description', content: 'Events' },
];

export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      version: params.event_version,
    })
    .withGraphFetched('[producers, consumers, domain, owners]')
    .first();

  if (!event) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  if (event.domain_name) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect(
      `/domains/${event.domain_name}/events/${event.name}/versions/${event.version}`,
    );
  }

  const eventVersions = await Event.query()
    .where({ name: params.event_name })
    .orderBy('version', 'desc');

  return json({
    event,
    eventVersions,
    crumbs: [
      { name: 'Events', to: '/events' },
      { name: event.name, to: `/events/${event.name}` },
      {
        name: `v${event.version}`,
        to: `/events/${event.name}/versions/${event.version}`,
      },
    ],
    catalogHash,
  });
}

const EventDetail = () => {
  const { event, eventVersions, crumbs } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={crumbs} />
        <div className="flex items-baseline gap-2">
          <h1 className="pt-2 text-2xl font-bold">{event.name}</h1>
          <Badge className="bg-amber-200">v{event.version}</Badge>
          {event.is_latest ? (
            <Badge className="bg-emerald-700 text-white">Latest</Badge>
          ) : (
            <Badge className="bg-red-700 text-white">Previous Version</Badge>
          )}
        </div>
        {event.summary && <p className="text-gray-500">{event.summary}</p>}
      </Card>
      {event.content && (
        <Card title="Content">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: event.content }} />
          </div>
        </Card>
      )}
      <Card title="Visualizer">
        <div className="h-[500px] w-full">
          <EventVisualizer event={event} />
        </div>
      </Card>
      {event.schema && (
        <Card title="Schema">
          <FileViewer
            filename="schema.json"
            content={JSON.stringify(JSON.parse(event.schema), null, 2)}
            language="yml"
          />
        </Card>
      )}
    </div>
  );
};

export default EventDetail;
