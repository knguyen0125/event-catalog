import React from 'react';
import { json, LoaderArgs, redirect, V2_MetaFunction } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import {
  CubeIcon,
  DocumentIcon,
  EnvelopeIcon,
  HomeIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Domain } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.domain.name} | Domains` },
  { name: 'description', content: 'Domains' },
];

export async function loader({ params, request }: LoaderArgs) {
  const path = new URL(request.url).pathname;

  if (path === encodeURI(`/domains/${params.domain_name}`)) {
    throw redirect(`/domains/${params.domain_name}/overview`);
  }

  const domain = await Domain.query()
    .findOne({
      name: params.domain_name,
    })
    .select(
      'domains.name',
      'domains.summary',
      Domain.relatedQuery('events')
        .where({ is_latest: true })
        .count()
        .as('eventsCount'),
      Domain.relatedQuery('services').count().as('servicesCount'),
      Domain.relatedQuery('docs').count().as('docsCount'),
    );

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

  const menu = [
    {
      id: 'overview',
      name: 'Overview',
      to: `/domains/${domain.name}/overview`,
      icon: HomeIcon,
      iconColor: 'text-gray-500',
    },
    {
      id: 'events',
      // @ts-ignore
      name: `Events (${domain.eventsCount || 0})`,
      to: `/domains/${domain.name}/events`,
      icon: EnvelopeIcon,
      iconColor: 'text-blue-500',
    },
    {
      id: 'services',
      // @ts-ignore
      name: `Services (${domain.servicesCount || 0})`,
      to: `/domains/${domain.name}/services`,
      icon: CubeIcon,
      iconColor: 'text-emerald-500',
    },
    {
      id: 'docs',
      // @ts-ignore
      name: `Docs (${domain.docsCount || 0})`,
      to: `/domains/${domain.name}/docs`,
      icon: DocumentIcon,
      iconColor: 'text-stone-500',
    },
  ];

  return (
    <div className="flex h-screen w-full">
      <aside className="w-80">
        <div className="flex items-center space-x-1 p-4">
          <div className="rounded-md bg-red-500 p-3">
            <RectangleStackIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold">{domain.name}</h1>
        </div>
        {/* Menu */}
        <nav className="mt-4 space-y-1">
          {menu.map(({ id, icon: Icon, iconColor, name, to }) => (
            <NavLink
              key={id}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center space-x-2 rounded-md px-4 py-2 hover:bg-gray-50 hover:text-gray-900',
                  isActive ? 'bg-gray-50 font-bold' : '',
                )
              }
            >
              <Icon className={`h-6 w-6 ${iconColor}`} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="w-px bg-gray-200" />
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default DomainDetailPage;
