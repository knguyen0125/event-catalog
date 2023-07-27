import React from 'react';
import { Link } from '@remix-run/react';
import Card from '~/components/Card';
import {
  Cog8ToothIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ModelObject } from 'objection';
import { Domain } from '~/database/models';

const DomainCard: React.FC<{ domain: ModelObject<Domain> }> = ({ domain }) => {
  return (
    <Link to={`/events/${domain.name}`}>
      <Card className={'h-full'}>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={'break-all text-lg font-bold'}>{domain.name}</span>
        </div>
        <div className={'py-2 font-light'}>{domain.summary}</div>
        <div className={'flex flex-wrap gap-x-2 pt-2 md:gap-x-4'}>
          <span className="inline-flex items-center gap-x-1">
            <EnvelopeIcon className={'h-4 w-4 text-blue-500'} />
            <span className={'text-xs font-light'}>
              Events ({domain.events?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <Cog8ToothIcon className={'h-4 w-4 text-green-500'} />
            <span className={'text-xs font-light'}>
              Services ({domain.services?.length || 0})
            </span>
          </span>
          <span className="inline-flex items-center gap-x-1">
            <UserGroupIcon className={'h-4 w-4  text-yellow-500'} />
            <span className={'text-xs font-light'}>
              Owners ({domain.owners?.length || 0})
            </span>
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default DomainCard;
