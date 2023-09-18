import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ModelObject } from 'objection';
import {
  Cog8ToothIcon,
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
    .withGraphFetched(
      '[events(isLatest), services.[producesEvents, consumesEvents], owners]',
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

const Sidebar = ({ domain }: { domain: ModelObject<Domain> }) => (
  <div className="md:min-h-screen">
    <aside className="hidden divide-y divide-gray-200 xl:block xl:pl-8">
      <h2 className="sr-only">Details</h2>
      {domain.events && domain.events.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <EnvelopeIcon className={clsx('h-4 w-4 text-blue-500')} />
            <span className="text-sm font-light">
              Events ({domain.events?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {domain.events.length > 0 ? (
              domain.events?.map((event) => (
                <Link to={`/events/${event.name}`} key={event.name}>
                  <Badge
                    key={event.name}
                    className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                  >
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{event.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No events</div>
            )}
          </div>
        </div>
      )}
      {domain.services && domain.services.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <Cog8ToothIcon className={clsx('h-4 w-4 text-emerald-500')} />
            <span className="text-sm font-light">
              Services ({domain.services?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {domain.services.length > 0 ? (
              domain.services?.map((service) => (
                <Link to={`/services/${service.name}`} key={service.name}>
                  <Badge className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow">
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{service.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No services</div>
            )}
          </div>
        </div>
      )}
      {domain.owners && domain.owners.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <UserGroupIcon className={clsx('h-4 w-4 text-yellow-500')} />
            <span className="text-sm font-light">
              Owners ({domain.owners?.length || 0})
            </span>
          </span>
          <div className="flex flex-col  gap-2">
            {domain.owners.length > 0 ? (
              domain.owners?.map((owner) => (
                <Link to={`/owners/${owner.email}`} key={owner.email}>
                  <div className="flex items-center gap-2">
                    <Avatar src={owner.image} alt={owner.name || owner.email} />
                    <span className="text-sm">{owner.name || owner.email}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm">No owners</div>
            )}
          </div>
        </div>
      )}
    </aside>
  </div>
);

const DomainDetailPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { name: 'Domains', to: '/domains' },
          { name: domain.name, to: '.' },
        ]}
      />
      <div className="xl:grid xl:grid-cols-4">
        <div className="flex flex-col justify-between xl:col-span-3 xl:border-r xl:border-gray-200 xl:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="py-4 text-2xl font-bold">{domain.name}</h1>
            </div>
            <p className="pb-4 text-gray-500">{domain.summary}</p>
            <hr className="pb-4" />
            <div className="prose max-w-none">
              {/* eslint-disable-next-line react/no-children-prop */}
              {domain.content && (
                <div dangerouslySetInnerHTML={{ __html: domain.content }} />
              )}
            </div>
            <div>
              <h2 className="py-4 text-2xl font-bold">Visualizer</h2>
              <div className="h-[500px] w-full">
                <ServicesVisualizer
                  domainName={domain.name}
                  services={domain.services || []}
                />
              </div>
            </div>
          </div>
        </div>
        <Sidebar domain={domain} key={domain.name} />
      </div>
    </div>
  );
};

export default DomainDetailPage;
