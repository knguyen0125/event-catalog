import React from 'react';
import { json, LoaderArgs } from '@remix-run/node';
import { Service } from '~/database/models';
import Container from '~/components/Container';
import { useLoaderData } from '@remix-run/react';

export async function loader({ params }: LoaderArgs) {
  const service = await Service.query()
    .findOne({
      name: params.service_name,
    })
    .withGraphFetched('[domain, owners, publishedEvents, subscribedToEvents]');

  if (!service) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    service,
  });
}
const ServiceDetailPage = () => {
  const { service } = useLoaderData<typeof loader>();

  return <Container>{service.name}</Container>;
};

export default ServiceDetailPage;
