import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React from 'react';
import { ModelObject } from 'objection';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Owner } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import Badge from '~/components/Badge';
import catalogHash from '../../../catalogHash.json';
import Card from '~/components/Card';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.owner.name || data?.owner.email} | Owners` },
  { name: 'description', content: 'Owners' },
];

export async function loader({ params }: LoaderArgs) {
  const owner = await Owner.query()
    .withGraphFetched('[events(isLatest), services, domains]')
    .findOne({ email: params.owner_email });

  if (!owner) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not found', { status: 404 });
  }

  return json({
    owner,
    catalogHash,
  });
}

const Sidebar = ({ owner }: { owner: ModelObject<Owner> }) => (
  <div className="md:min-h-screen">
    <aside className="hidden divide-y divide-gray-200 xl:block xl:pl-8">
      <h2 className="sr-only">Details</h2>
      {owner.events && owner.events.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowRightOnRectangleIcon
              className={clsx('h-4 w-4 text-blue-500')}
            />
            <span className="text-sm font-light">
              Events ({owner.events?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {owner.events.length > 0 ? (
              owner.events?.map((event) => (
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
      {owner.services && owner.services.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
            <span className="text-sm font-light">
              Services ({owner.services?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {owner.services.length > 0 ? (
              owner.services?.map((service) => (
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
      {owner.domains && owner.domains.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <RectangleStackIcon className={clsx('h-4 w-4 text-red-500')} />
            <span className="text-sm font-light">
              Domains ({owner.domains.length})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {owner.domains.length > 0 ? (
              owner.domains.map((domain) => (
                <Link to={`/domains/${domain.name}`}>
                  <Badge
                    key={domain.name}
                    className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                  >
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-red-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{domain.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No domains</div>
            )}
          </div>
        </div>
      )}
    </aside>
  </div>
);

const OwnerDetailPage = () => {
  const { owner } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb
          crumbs={[
            { name: 'Owners', to: '/owners' },
            { name: owner.email, to: '.' },
          ]}
        />
        <h1 className="py-2 text-2xl font-bold">
          {owner.name ? owner.name : owner.email}
          {owner.role ? ` - ${owner.role}` : ''}
        </h1>
        <p className="text-gray-500">{owner.email}</p>
      </Card>
      {owner.content && (
        <Card title="Content">
          <div className="prose max-w-none">
            {/* eslint-disable-next-line react/no-children-prop */}
            <div dangerouslySetInnerHTML={{ __html: owner.content }} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default OwnerDetailPage;
