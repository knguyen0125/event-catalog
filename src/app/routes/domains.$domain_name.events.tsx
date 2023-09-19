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

const DomainDetailPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return <div>Events</div>;
};

export default DomainDetailPage;
