import React from 'react';
import { ModelObject } from 'objection';
import { Link } from '@remix-run/react';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Event } from '~/database/models.server';
import CardV2 from '~/components/CardV2';

type EventListProps = {
  events: ModelObject<Event>[];
};

const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <ul className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <li key={event.name}>
          <Link to={`./${event.name}/versions/${event.version}`}>
            <CardV2
              title={event.name}
              description={event.summary}
              badges={[
                { className: 'bg-amber-200', text: `v${event.version}` },
              ]}
              additionalDetails={[
                event.domain_name
                  ? {
                      icon: RectangleStackIcon,
                      iconClassName: 'text-red-500',
                      text: event.domain_name,
                    }
                  : null,
                event.producers?.length && event.producers?.length > 0
                  ? {
                      icon: CubeIcon,
                      iconClassName: 'text-blue-500',
                      text: `Producers (${event.producers?.length || 0})`,
                    }
                  : null,
                event.consumers?.length && event.consumers?.length > 0
                  ? {
                      icon: CubeIcon,
                      iconClassName: 'text-blue-500',
                      text: `Consumers (${event.consumers?.length || 0})`,
                    }
                  : null,
                event.owners?.length && event.owners?.length > 0
                  ? {
                      icon: UserGroupIcon,
                      iconClassName: 'text-yellow-500',
                      text: `Owners (${event.owners?.length || 0})`,
                    }
                  : null,
              ]}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default EventList;
