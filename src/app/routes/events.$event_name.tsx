import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json, Response, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ModelObject } from 'objection';
import Markdown from 'react-markdown';
import { Event } from '~/database/models.server';
import Container from '~/components/Container';
import Badge from '~/components/Badge';
import Avatar from '~/components/Avatar';
import Breadcrumb from '~/components/Breadcrumb';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `Events - ${data?.event.name}` },
  { name: 'description', content: 'Events' },
];

export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      is_latest: true,
    })
    .withGraphFetched('[publishers, subscribers, domain, owners]')
    .first();

  if (!event) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({ event });
}

const Sidebar = ({ event }: { event: ModelObject<Event> }) => (
  <div className="md:min-h-screen">
    <aside className="hidden divide-y divide-gray-200 xl:block xl:pl-8">
      <h2 className="sr-only">Details</h2>
      {event.publishers && event.publishers.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowRightOnRectangleIcon
              className={clsx('h-4 w-4 text-blue-500')}
            />
            <span className="text-sm font-light">
              Publishers ({event.publishers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.publishers?.map((publisher) => (
              <Link to={`/services/${publisher.name}`} key={publisher.name}>
                <Badge
                  key={publisher.name}
                  className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                >
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-blue-500"
                      aria-hidden
                    />
                  </div>
                  <div className="ml-3.5">{publisher.name}</div>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      {event.subscribers && event.subscribers.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
            <span className="text-sm font-light">
              Subscribers ({event.subscribers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.subscribers?.map((subscriber) => (
              <Link to={`/services/${subscriber.name}`} key={subscriber.name}>
                <Badge className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow">
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                  </div>
                  <div className="ml-3.5">{subscriber.name}</div>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      {event.domain && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <RectangleStackIcon className={clsx('h-4 w-4 text-red-500')} />
            <span className="text-sm font-light">Domain</span>
          </span>
          <div className="flex flex-wrap gap-1">
            <Link to={`/domains/${event.domain.name}`}>
              <Badge
                key={event.domain.name}
                className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
              >
                <div className="absolute flex flex-shrink-0 items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden
                  />
                </div>
                <div className="ml-3.5">{event.domain.name}</div>
              </Badge>
            </Link>
          </div>
        </div>
      )}
      {event.owners && event.owners.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <UserGroupIcon className={clsx('h-4 w-4 text-yellow-500')} />
            <span className="text-sm font-light">
              Owners ({event.owners?.length || 0})
            </span>
          </span>
          <div className="flex flex-col  gap-2">
            {event.owners?.map((owner) => (
              <Link to={`/owners/${owner.email}`}>
                <div className="flex items-center gap-2">
                  <Avatar src={owner.image} alt={owner.name || owner.email} />
                  <span className="text-sm">{owner.name || owner.email}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  </div>
);

const EventDetail = () => {
  const { event } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Breadcrumb
        crumbs={[
          { name: 'Events', to: '/events' },
          { name: event.name, to: '.' },
        ]}
      />
      <div className="xl:grid xl:grid-cols-4">
        <div className="flex flex-col justify-between xl:col-span-3 xl:border-r xl:border-gray-200 xl:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="py-4 text-2xl font-bold">{event.name}</h1>
              <Badge className="bg-amber-200">v{event.version}</Badge>
            </div>
            <p className="pb-4 text-gray-500">{event.summary}</p>
            <hr className="pb-4" />
            <div className="prose">
              {/* eslint-disable-next-line react/no-children-prop */}
              {event.content && <Markdown children={event.content} />}
            </div>
          </div>
        </div>
        <Sidebar event={event} key={event.name} />
      </div>
    </Container>
  );
};

export default EventDetail;
