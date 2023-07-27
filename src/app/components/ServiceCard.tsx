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
import type { Service } from '~/database/models';

const ServiceCard: React.FC<{ service: ModelObject<Service> }> = ({
  service,
}) => {
  return (
    <Link to={`/events/${service.name}`}>
      <Card className={'h-full'}>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={'break-all text-lg font-bold'}>{service.name}</span>
        </div>
        <div className={'py-2 font-light'}>{service.summary}</div>
        <div className={'flex flex-wrap gap-x-2 pt-2 md:gap-x-4'}>
          <span className="inline-flex items-center gap-x-1">
            <ArrowRightOnRectangleIcon className={'h-4 w-4 text-blue-500'} />
            <span className={'text-xs font-light'}>
              Publishes ({service.publishedEvents?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <ArrowLeftOnRectangleIcon className={'h-4 w-4 text-green-500'} />
            <span className={'text-xs font-light'}>
              Subscribes ({service.subscribedToEvents?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <UserGroupIcon className={'h-4 w-4  text-yellow-500'} />
            <span className={'text-xs font-light'}>
              Owners ({service.owners?.length || 0})
            </span>
          </span>
          {service.domain?.name && (
            <span className="inline-flex items-center gap-x-1">
              <RectangleStackIcon className={'h-4 w-4  text-yellow-500'} />
              <span className={'text-xs font-light'}>
                {service.domain?.name}
              </span>
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
