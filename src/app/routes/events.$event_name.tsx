import type { LoaderArgs } from '@remix-run/node';
import { redirect, Response } from '@remix-run/node';
import { Event } from '~/database/models.server';

// eslint-disable-next-line import/prefer-default-export
export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      is_latest: true,
    })
    .withGraphFetched('[producers, consumers, domain, owners]')
    .first();

  if (!event) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw redirect(`/events/${event.name}/versions/${event.version}`);
}
