import React from 'react';
import { Link } from '@remix-run/react';
import {
  DocumentIcon,
  EnvelopeIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { ModelObject } from 'objection';
import { Service } from '~/database/models.server';
import CardV2 from '~/components/CardV2';

type ServiceListProps = {
  services: ModelObject<Service>[];
};

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <ul className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <li key={service.name}>
          <Link to={`./${service.name}`}>
            <CardV2
              title={service.name}
              description={service.summary}
              additionalDetails={[
                service.domain_name
                  ? {
                      icon: RectangleStackIcon,
                      iconClassName: 'text-red-500',
                      text: service.domain_name,
                    }
                  : null,
                service.owners?.length && service.owners?.length > 0
                  ? {
                      icon: UserGroupIcon,
                      iconClassName: 'text-yellow-500',
                      text: `Owners (${service.owners?.length})`,
                    }
                  : null,
                service.producesEvents?.length &&
                service.producesEvents?.length > 0
                  ? {
                      icon: EnvelopeIcon,
                      iconClassName: 'text-blue-500',
                      text: `Produces (${service.producesEvents?.length})`,
                    }
                  : null,
                service.consumesEvents?.length &&
                service.consumesEvents?.length > 0
                  ? {
                      icon: EnvelopeIcon,
                      iconClassName: 'text-blue-500',
                      text: `Consumes (${service.consumesEvents?.length})`,
                    }
                  : null,
                service.docs?.length && service.docs?.length > 0
                  ? {
                      icon: DocumentIcon,
                      iconClassName: 'text-stone-500',
                      text: `Docs (${service.consumesEvents?.length})`,
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

export default ServiceList;
