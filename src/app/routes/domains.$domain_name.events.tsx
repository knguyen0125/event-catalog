import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ModelObject } from 'objection';
import {
  CubeIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Domain } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import Badge from '~/components/Badge';
import Avatar from '~/components/Avatar';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';
import EventList from '~/components/EventList';
import Card from '~/components/Card';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.domain.name} | Domains` },
  { name: 'description', content: 'Domains' },
];

export async function loader({ params }: LoaderArgs) {
  const domain = await Domain.query()
    .findOne({
      name: params.domain_name,
    })
    .withGraphFetched('[events(isLatest)]');

  if (!domain) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    domain,
    catalogHash,
  });
}

const DomainEventListPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb
          crumbs={[
            { name: 'Domains', to: '/domains' },
            { name: domain.name },
            { name: 'Events' },
          ]}
        />
      </Card>
      {domain.events && domain.events.length > 0 ? (
        <EventList events={domain.events || []} />
      ) : (
        <Card>No events</Card>
      )}
    </div>
  );
};

export default DomainEventListPage;
