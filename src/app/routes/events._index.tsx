import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Event } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import EventList from '~/components/EventList';
import Card from '~/components/Card';

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
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={[{ name: 'Events', to: '.' }]} />
        <h1 className="pt-2 text-2xl font-bold">Events ({events.length})</h1>
      </Card>
      <EventList events={events} />
    </div>
  );
};

export default EventsIndex;
