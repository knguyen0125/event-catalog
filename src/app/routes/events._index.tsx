import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Event } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import EventList from '~/components/EventList';

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
    <div>
      <Breadcrumb crumbs={[{ name: 'Events', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Events ({events.length})</h1>
      <hr className="py-4" />
      <EventList events={events} />
    </div>
  );
};

export default EventsIndex;
