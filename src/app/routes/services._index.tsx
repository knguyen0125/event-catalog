import React from 'react';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Container from '~/components/Container';
import { Service } from '~/database/models.server';
import CardV2 from '~/components/CardV2';
import Breadcrumb from '~/components/Breadcrumb';

export async function loader() {
  const services = await Service.query()
    .withGraphFetched(
      '[domain(selectName), owners(selectEmail), publishedEvents(selectName), subscribedToEvents(selectName)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectEmail(builder) {
        builder.select('email');
      },
    })
    .orderBy('name');

  return json({
    services,
  });
}

const ServiceIndexPage = () => {
  const { services } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Breadcrumb crumbs={[{ name: 'Services', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Services ({services.length})</h1>
      <hr className="py-4" />
      <ul className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.name}>
            <Link to={`./${service.name}`}>
              <CardV2
                title={service.name}
                description={service.summary}
                additionalDetails={[
                  {
                    icon: ArrowRightOnRectangleIcon,
                    iconClassName: 'text-blue-500',
                    text: `Publishes (${service.publishedEvents?.length || 0})`,
                  },
                  {
                    icon: ArrowLeftOnRectangleIcon,
                    iconClassName: 'text-emerald-500',
                    text: `Subscribes (${
                      service.subscribedToEvents?.length || 0
                    })`,
                  },
                  {
                    icon: UserGroupIcon,
                    iconClassName: 'text-yellow-500',
                    text: `Owners (${service.owners?.length || 0})`,
                  },
                  service.domain
                    ? {
                        icon: RectangleStackIcon,
                        iconClassName: 'text-red-500',
                        text: service.domain.name,
                      }
                    : null,
                ]}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default ServiceIndexPage;
