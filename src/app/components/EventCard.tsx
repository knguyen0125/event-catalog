import React from 'react';
import { Link } from '@remix-run/react';
import Card from '~/components/Card';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ModelObject } from 'objection';
import type { Event } from '~/database/models';

const EventCard: React.FC<{ event: ModelObject<Event> }> = ({ event }) => {
  return (
    <Link to={`/events/${event.name}`}>
      <Card className={'h-full'}>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={'break-all font-bold'}>{event.name}</span>
          <span
            className={'rounded-full bg-amber-200 px-2 py-1 text-sm font-light'}
          >
            v{event.version}
          </span>
        </div>
        <div className={'py-2 font-light'}>{event.summary}</div>
        <div className={'flex flex-wrap gap-x-2 pt-2 md:gap-x-4'}>
          <span className="inline-flex items-center gap-x-1">
            <ArrowRightOnRectangleIcon className={'h-4 w-4 text-blue-500'} />
            <span className={'text-sm font-light'}>
              Publishers ({event.publishers?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <ArrowLeftOnRectangleIcon className={'h-4 w-4 text-green-500'} />
            <span className={'text-sm font-light'}>
              Subscribers ({event.subscribers?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <UserGroupIcon className={'h-4 w-4  text-yellow-500'} />
            <span className={'text-sm font-light'}>
              Owners ({event.owners?.length || 0})
            </span>
          </span>
          {event.domain?.name && (
            <span className="inline-flex items-center gap-x-1">
              <RectangleStackIcon className={'h-4 w-4  text-yellow-500'} />
              <span className={'text-sm font-light'}>{event.domain?.name}</span>
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
