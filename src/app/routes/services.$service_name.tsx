import React from 'react';
import { json, LoaderArgs, redirect, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ModelObject } from 'objection';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Markdown from '~/components/Markdown';
import { Service } from '~/database/models.server';
import Container from '~/components/Container';
import Breadcrumb from '~/components/Breadcrumb';
import Badge from '~/components/Badge';
import Avatar from '~/components/Avatar';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.service.name} | Services` },
  { name: 'description', content: 'Services' },
];

export async function loader({ params }: LoaderArgs) {
  const service = await Service.query()
    .findOne({
      name: params.service_name,
    })
    .withGraphFetched(
      '[domain, owners, producesEvents(isLatest), consumesEvents(isLatest)]',
    );

  if (!service) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  if (service.domain_name) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect(`/domains/${service.domain_name}/services/${service.name}`);
  }

  return json({
    service,
    catalogHash,
    crumbs: [
      { name: 'Services', to: '/Services' },
      { name: service.name, to: '.' },
    ],
  });
}

const Sidebar = ({ service }: { service: ModelObject<Service> }) => (
  <div className="md:min-h-screen">
    <aside className="hidden divide-y divide-gray-200 xl:block xl:pl-8">
      <h2 className="sr-only">Details</h2>
      {service.producesEvents && service.producesEvents.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowRightOnRectangleIcon
              className={clsx('h-4 w-4 text-blue-500')}
            />
            <span className="text-sm font-light">
              Produces ({service.producesEvents?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {service.producesEvents.length > 0 ? (
              service.producesEvents?.map((publishedEvent) => (
                <Link
                  to={`/events/${publishedEvent.name}`}
                  key={publishedEvent.name}
                >
                  <Badge
                    key={publishedEvent.name}
                    className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                  >
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{publishedEvent.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No publications</div>
            )}
          </div>
        </div>
      )}
      {service.consumesEvents && service.consumesEvents.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
            <span className="text-sm font-light">
              Consumes ({service.consumesEvents?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {service.consumesEvents.length > 0 ? (
              service.consumesEvents?.map((consumer) => (
                <Link to={`/events/${consumer.name}`} key={consumer.name}>
                  <Badge className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow">
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{consumer.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No subscriptions</div>
            )}
          </div>
        </div>
      )}
      <div className="py-6">
        <span className="inline-flex items-center gap-x-1 pb-4">
          <RectangleStackIcon className={clsx('h-4 w-4 text-red-500')} />
          <span className="text-sm font-light">Domain</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {service.domain ? (
            <Link to={`/domains/${service.domain.name}`}>
              <Badge
                key={service.domain.name}
                className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
              >
                <div className="absolute flex flex-shrink-0 items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden
                  />
                </div>
                <div className="ml-3.5">{service.domain.name}</div>
              </Badge>
            </Link>
          ) : (
            <div className="text-sm">No domain</div>
          )}
        </div>
      </div>
      {service.owners && service.owners.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <UserGroupIcon className={clsx('h-4 w-4 text-yellow-500')} />
            <span className="text-sm font-light">
              Owners ({service.owners?.length || 0})
            </span>
          </span>
          <div className="flex flex-col  gap-2">
            {service.owners?.length > 0 ? (
              service.owners?.map((owner) => (
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

const ServiceDetailPage = () => {
  const { service, crumbs } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Breadcrumb crumbs={crumbs} />
      <div className="xl:grid xl:grid-cols-4">
        <div className="flex flex-col justify-between xl:col-span-3 xl:border-r xl:border-gray-200 xl:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="py-4 text-2xl font-bold">{service.name}</h1>
            </div>
            <p className="pb-4 text-gray-500">{service.summary}</p>
            <hr className="pb-4" />
            <div className="prose">
              {/* eslint-disable-next-line react/no-children-prop */}
              {service.content && <Markdown children={service.content} />}
            </div>
            <div>
              <h2 className="py-4 text-2xl font-bold">Visualizer</h2>
              <div className="h-[500px] w-full">
                <ServicesVisualizer services={[service]} />
              </div>
            </div>
          </div>
        </div>
        <Sidebar service={service} key={service.name} />
      </div>
    </Container>
  );
};

export default ServiceDetailPage;
