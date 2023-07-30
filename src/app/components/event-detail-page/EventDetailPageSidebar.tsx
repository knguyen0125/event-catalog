import React from 'react';
import { ModelObject } from 'objection';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ListBulletIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Link } from '@remix-run/react';
import { Event } from '~/database/models.server';
import Badge from '~/components/Badge';
import Avatar from '~/components/Avatar';

const EventDetailPageSidebar = ({
  event,
  eventVersions,
}: {
  event: ModelObject<Event>;
  eventVersions: ModelObject<Event>[];
}) => (
  <div className="md:min-h-screen">
    <aside className="hidden divide-y divide-gray-200 xl:block xl:pl-8">
      <h2 className="sr-only">Details</h2>
      {event.producers && event.producers.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowRightOnRectangleIcon
              className={clsx('h-4 w-4 text-blue-500')}
            />
            <span className="text-sm font-light">
              Producers ({event.producers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.producers.length > 0 ? (
              event.producers?.map((producer) => (
                <Link to={`/services/${producer.name}`} key={producer.name}>
                  <Badge
                    key={producer.name}
                    className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                  >
                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        aria-hidden
                      />
                    </div>
                    <div className="ml-3.5">{producer.name}</div>
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-sm">No producers</div>
            )}
          </div>
        </div>
      )}
      {event.consumers && event.consumers.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
            <span className="text-sm font-light">
              Consumers ({event.consumers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.consumers.length > 0 ? (
              event.consumers?.map((consumer) => (
                <Link to={`/services/${consumer.name}`} key={consumer.name}>
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
              <div className="text-sm">No consumers</div>
            )}
          </div>
        </div>
      )}
      {eventVersions.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ListBulletIcon className={clsx('h-4 w-4 text-zinc-500')} />
            <span className="text-sm font-light">Event Versions</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {eventVersions.map((eventVersion) => (
              <Link
                to={`/events/${event.name}/versions/${eventVersion.version}`}
                key={eventVersion.version}
              >
                <Badge
                  className={clsx(
                    'group inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow',
                    eventVersion.version === event.version
                      ? 'bg-zinc-700 text-white hover:text-black'
                      : '',
                  )}
                >
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full bg-zinc-500',
                        eventVersion.version === event.version &&
                          'bg-white group-hover:bg-zinc-500',
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="ml-3.5">
                    {eventVersion.version}
                    {eventVersion.is_latest ? ' (Latest)' : ''}
                  </div>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="py-6">
        <span className="inline-flex items-center gap-x-1 pb-4">
          <RectangleStackIcon className={clsx('h-4 w-4 text-red-500')} />
          <span className="text-sm font-light">Domain</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {event.domain ? (
            <Link to={`/domains/${event.domain.name}`}>
              <Badge
                key={event.domain.name}
                className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
              >
                <div className="absolute flex flex-shrink-0 items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden
                  />
                </div>
                <div className="ml-3.5">{event.domain.name}</div>
              </Badge>
            </Link>
          ) : (
            <div className="text-sm">No domain</div>
          )}
        </div>
      </div>
      {event.owners && event.owners.length >= 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <UserGroupIcon className={clsx('h-4 w-4 text-yellow-500')} />
            <span className="text-sm font-light">
              Owners ({event.owners?.length || 0})
            </span>
          </span>
          <div className="flex flex-col  gap-2">
            {event.owners.length > 0 ? (
              event.owners?.map((owner) => (
                <Link to={`/owners/${owner.email}`}>
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
export default EventDetailPageSidebar;
