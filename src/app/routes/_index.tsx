import type { V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ChevronRightIcon,
  Cog8ToothIcon,
  EnvelopeIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Domain, Event, Owner, Service } from '~/database/models.server';

export const meta: V2_MetaFunction = () => [
  { title: 'Event Catalog' },
  { name: 'description', content: 'Event Catalog' },
];

export async function loader() {
  const [eventCount, domainCount, serviceCount, ownerCount] = await Promise.all(
    [
      Event.query().where('is_latest', true).resultSize(),
      Domain.query().distinct('name').resultSize(),
      Service.query().distinct('name').resultSize(),
      Owner.query().distinct('email').resultSize(),
    ],
  );

  return {
    eventCount,
    domainCount,
    serviceCount,
    ownerCount,
  };
}

const Index = () => {
  const { eventCount, domainCount, serviceCount, ownerCount } =
    useLoaderData<typeof loader>();
  const data = [
    {
      name: 'Events',
      count: eventCount,
      to: '/events',
      icon: EnvelopeIcon,
      iconColor: 'bg-blue-500',
    },
    {
      name: 'Services',
      count: serviceCount,
      to: '/services',
      icon: Cog8ToothIcon,
      iconColor: 'bg-emerald-500',
    },
    {
      name: 'Domains',
      count: domainCount,
      to: '/domains',
      icon: RectangleStackIcon,
      iconColor: 'bg-red-500',
    },
    {
      name: 'Owners',
      count: ownerCount,
      to: '/owners',
      icon: UserGroupIcon,
      iconColor: 'bg-yellow-500',
    },
  ];

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold">Event Catalog</h1>
      <div className="mt-2 text-lg font-light">
        Discover, Explore, and Document your Event Driven Architectures
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <Link
            className="rounded-lg bg-white px-4 py-4 shadow transition duration-200 ease-in-out hover:shadow-lg"
            key={item.name}
            to={item.to}
            aria-label={item.name}
          >
            <div className="flex items-center justify-between space-x-4 text-gray-700">
              <div className={clsx('rounded-md p-3', item.iconColor)}>
                <item.icon className={clsx('h-8 w-8 text-white')} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {item.name}
                </div>
                <div className="text-4xl font-bold">{item.count}</div>
              </div>
              <div className="rounded-md py-3 group-hover:bg-gray-200">
                <ChevronRightIcon className={clsx('h-8 w-8 text-gray-500')} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
