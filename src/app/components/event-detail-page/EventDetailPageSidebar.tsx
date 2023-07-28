import React from 'react';
import { ModelObject } from 'objection';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
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
      {event.publishers && event.publishers.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowRightOnRectangleIcon
              className={clsx('h-4 w-4 text-blue-500')}
            />
            <span className="text-sm font-light">
              Publishers ({event.publishers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.publishers?.map((publisher) => (
              <Link to={`/services/${publisher.name}`} key={publisher.name}>
                <Badge
                  key={publisher.name}
                  className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow"
                >
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-blue-500"
                      aria-hidden
                    />
                  </div>
                  <div className="ml-3.5">{publisher.name}</div>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      {event.subscribers && event.subscribers.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
            <span className="text-sm font-light">
              Subscribers ({event.subscribers?.length || 0})
            </span>
          </span>
          <div className="flex flex-wrap gap-1">
            {event.subscribers?.map((subscriber) => (
              <Link to={`/services/${subscriber.name}`} key={subscriber.name}>
                <Badge className="inline-flex items-center rounded-full border hover:bg-gray-50 hover:shadow">
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                  </div>
                  <div className="ml-3.5">{subscriber.name}</div>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      {event.domain && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <RectangleStackIcon className={clsx('h-4 w-4 text-red-500')} />
            <span className="text-sm font-light">Domain</span>
          </span>
          <div className="flex flex-wrap gap-1">
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
          </div>
        </div>
      )}
      {event.owners && event.owners.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <UserGroupIcon className={clsx('h-4 w-4 text-yellow-500')} />
            <span className="text-sm font-light">
              Owners ({event.owners?.length || 0})
            </span>
          </span>
          <div className="flex flex-col  gap-2">
            {event.owners?.map((owner) => (
              <Link to={`/owners/${owner.email}`}>
                <div className="flex items-center gap-2">
                  <Avatar src={owner.image} alt={owner.name || owner.email} />
                  <span className="text-sm">{owner.name || owner.email}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {eventVersions.length > 0 && (
        <div className="py-6">
          <span className="inline-flex items-center gap-x-1 pb-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-4 w-4 text-emerald-500')}
            />
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
                      ? 'bg-emerald-700 text-white hover:text-black'
                      : '',
                  )}
                >
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full bg-emerald-500',
                        eventVersion.version === event.version &&
                          'bg-white group-hover:bg-emerald-500',
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
    </aside>
  </div>
);
export default EventDetailPageSidebar;
