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
import Markdown from 'react-markdown';
import Container from '~/components/Container';
import { Owner } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import Badge from '~/components/Badge';

export const meta: V2_MetaFunction = () => [
  { title: 'Owners' },
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
    <Container>
      <Breadcrumb
        crumbs={[
          { name: 'Owners', to: '/owners' },
          { name: owner.email, to: '.' },
        ]}
      />
      <div className="xl:grid xl:grid-cols-4">
        <div className="flex flex-col justify-between xl:col-span-3 xl:border-r xl:border-gray-200 xl:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="py-4 text-2xl font-bold">
                {owner.name ? owner.name : owner.email}
                {owner.role ? ` - ${owner.role}` : ''}
              </h1>
            </div>
            <p className="pb-4 text-gray-500">{owner.email}</p>
            <hr className="pb-4" />
            <div className="prose">
              {/* eslint-disable-next-line react/no-children-prop */}
              {owner.content && <Markdown children={owner.content} />}
            </div>
          </div>
        </div>
        <Sidebar owner={owner} key={owner.name} />
      </div>
    </Container>
  );
};

export default OwnerDetailPage;
