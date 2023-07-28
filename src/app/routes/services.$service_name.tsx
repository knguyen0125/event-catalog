import React from 'react';
import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Service } from '~/database/models.server';
import Container from '~/components/Container';
import Breadcrumb from '~/components/Breadcrumb';

export async function loader({ params }: LoaderArgs) {
  const service = await Service.query()
    .findOne({
      name: params.service_name,
    })
    .withGraphFetched('[domain, owners, publishedEvents, subscribedToEvents]');

  if (!service) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    service,
  });
}
const ServiceDetailPage = () => {
  const { service } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Breadcrumb
        crumbs={[
          { name: 'Services', to: '/Services' },
          { name: service.name, to: '.' },
        ]}
      />
      {service.name}
    </Container>
  );
};

export default ServiceDetailPage;
