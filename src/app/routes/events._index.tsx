import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Container from '~/components/Container';
import { Event } from '~/database/models.server';
import CardV2 from '~/components/CardV2';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';

export const meta: V2_MetaFunction = () => [
  { title: 'Events' },
  { name: 'description', content: 'Events' },
];

export async function loader() {
  const events = await Event.query()
    .withGraphFetched(
      '[producers(selectName), consumers(selectName), domain(selectName), owners(selectEmail)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectEmail(builder) {
        builder.select('email');
      },
    })
    .where('is_latest', true)
    .orderBy('name');

  return json({ events, catalogHash });
}
const EventsIndex = () => {
  const { events } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Breadcrumb crumbs={[{ name: 'Events', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Events ({events.length})</h1>
      <hr className="py-4" />
      <ul className="grid  grid-cols-1 gap-6 sm:grid-cols-2">
        {events.map((event) => (
          <li key={event.name}>
            <Link to={`./${event.name}/versions/${event.version}`}>
              <CardV2
                title={event.name}
                description={event.summary}
                badges={[
                  { className: 'bg-amber-200', text: `v${event.version}` },
                ]}
                additionalDetails={[
                  {
                    icon: ArrowRightOnRectangleIcon,
                    iconClassName: 'text-blue-500',
                    text: `Producers (${event.producers?.length || 0})`,
                  },
                  {
                    icon: ArrowLeftOnRectangleIcon,
                    iconClassName: 'text-emerald-500',
                    text: `Consumers (${event.consumers?.length || 0})`,
                  },
                  {
                    icon: UserGroupIcon,
                    iconClassName: 'text-yellow-500',
                    text: `Owners (${event.owners?.length || 0})`,
                  },
                  event.domain
                    ? {
                        icon: RectangleStackIcon,
                        iconClassName: 'text-red-500',
                        text: event.domain.name,
                      }
                    : null,
                ]}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default EventsIndex;
