import React from 'react';
import Container from '~/components/Container';
import { Service } from '~/database/models';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import EventCard from '~/components/EventCard';
import ServiceCard from '~/components/ServiceCard';

export async function loader() {
  const services = await Service.query()
    .withGraphFetched('[domain, owners, publishedEvents, subscribedToEvents]')
    .orderBy('name');

  return json({
    services,
  });
}

const ServiceIndexPage = () => {
  const { services } = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="py-4 text-2xl font-bold">Services ({services.length})</h1>
      <hr className={'py-4'} />
      <ul className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.name}>
            <ServiceCard service={service} />
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default ServiceIndexPage;
