import type { LoaderArgs } from '@remix-run/node';
import { json, Response, V2_MetaFunction } from '@remix-run/node';
import { Event } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import EventDetail from './events.$event_name_.versions.$event_version';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.event.name} | Events` },
  { name: 'description', content: 'Events' },
];

export async function loader({ params }: LoaderArgs) {
  const event = await Event.query()
    .where({
      name: params.event_name,
      version: params.event_version,
      domain_name: params.domain_name,
    })
    .withGraphFetched('[producers, consumers, domain, owners]')
    .first();

  if (!event) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  const eventVersions = await Event.query()
    .where({ name: params.event_name })
    .orderBy('version', 'desc');

  return json({
    event,
    eventVersions,
    crumbs: [
      { name: 'Domains', to: '/domains' },
      { name: event.domain_name },
      { name: 'Events', to: `/domains/${event.domain_name}/events` },
      {
        name: event.name,
      },
      {
        name: `v${event.version}`,
        to: `/events/${event.name}/versions/${event.version}`,
      },
    ],
    catalogHash,
  });
}

export default EventDetail;
