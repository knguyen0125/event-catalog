import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect, Response, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Event } from '~/database/models.server';
import Container from '~/components/Container';
import Badge from '~/components/Badge';
import Breadcrumb from '~/components/Breadcrumb';
import EventDetailPageSidebar from '~/components/event-detail-page/EventDetailPageSidebar';
import catalogHash from '../../../catalogHash.json';
import FileViewer from '~/components/FileViewer';
import EventVisualizer from '~/components/visualizer/EventVisualizer';

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
    <Container>
      <Breadcrumb crumbs={crumbs} />
      <div className="xl:grid xl:grid-cols-4">
        <div className="flex flex-col justify-between xl:col-span-3 xl:border-r xl:border-gray-200 xl:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="py-4 text-2xl font-bold">{event.name}</h1>
              <Badge className="bg-amber-200">v{event.version}</Badge>
              {event.is_latest ? (
                <Badge className="bg-emerald-700 text-white">Latest</Badge>
              ) : (
                <Badge className="bg-red-700 text-white">
                  Previous Version
                </Badge>
              )}
            </div>
            <p className="pb-4 text-gray-500">{event.summary}</p>
            <hr className="pb-4" />
            <div className="prose max-w-none">
              {event.content && (
                <div dangerouslySetInnerHTML={{ __html: event.content }} />
              )}
            </div>
            <div>
              <h2 className="py-4 text-2xl font-bold">Visualizer</h2>
              <div className="h-[500px] w-full">
                <EventVisualizer event={event} />
              </div>
            </div>
            <div>
              {event.schema && (
                <div>
                  <h2 className="py-4 text-2xl font-bold">Schema</h2>
                  <FileViewer
                    filename="schema.json"
                    content={JSON.stringify(JSON.parse(event.schema), null, 2)}
                    language="yml"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <EventDetailPageSidebar
          event={event}
          eventVersions={eventVersions}
          key={event.name}
        />
      </div>
    </Container>
  );
};

export default EventDetail;
