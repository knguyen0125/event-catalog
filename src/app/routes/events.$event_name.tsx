import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Event } from '~/database/models';

export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      is_latest: true,
    })
    .first();

  if (!event) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ event });
}

const EventDetail = () => {
  const { event } = useLoaderData<typeof loader>();
  return <div>{event.name}</div>;
};

export default EventDetail;
