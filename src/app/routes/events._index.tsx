import React from 'react';
import Container from '~/components/Container';
import { json } from '@remix-run/node';
import { Event } from '~/database/models';
import { useLoaderData } from '@remix-run/react';
import EventCard from '~/components/EventCard';

export async function loader() {
  const events = await Event.query()
    .withGraphFetched('[publishers, subscribers, domain, owners]')
    .where('is_latest', true)
    .orderBy('name');

  return json({ events });
}
const EventsIndex = () => {
  const { events } = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="py-4 text-2xl font-bold">Events ({events.length})</h1>
      <hr className={'py-4'} />
      <ul className="grid  grid-cols-1 gap-6 sm:grid-cols-2">
        {events.map((event) => (
          <li key={event.name}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default EventsIndex;
