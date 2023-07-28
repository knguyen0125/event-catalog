import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json, Response, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Markdown from 'react-markdown';
import { Event } from '~/database/models.server';
import Container from '~/components/Container';
import Badge from '~/components/Badge';
import Breadcrumb from '~/components/Breadcrumb';
import EventDetailPageSidebar from '~/components/event-detail-page/EventDetailPageSidebar';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `Events - ${data?.event.name}` },
  { name: 'description', content: 'Events' },
];

export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      version: params.event_version,
    })
    .withGraphFetched('[publishers, subscribers, domain, owners]')
    .first();

  if (!event) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  const eventVersions = await Event.query()
    .where({ name: params.event_name })
    .orderBy('version', 'desc');

  return json({ event, eventVersions });
}

const EventDetail = () => {
  const { event, eventVersions } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Breadcrumb
        crumbs={[
          { name: 'Events', to: '/events' },
          { name: event.name, to: `/events/${event.name}` },
          {
            name: `v${event.version}`,
            to: `/events/${event.name}/versions/${event.version}`,
          },
        ]}
      />
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
            <div className="prose">
              {/* eslint-disable-next-line react/no-children-prop */}
              {event.content && <Markdown children={event.content} />}
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