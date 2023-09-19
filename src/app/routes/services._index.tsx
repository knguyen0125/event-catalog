import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Service } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import ServiceList from '~/components/ServiceList';

export const meta: V2_MetaFunction = () => [
  { title: 'Services' },
  { name: 'description', content: 'Services' },
];

export async function loader() {
  const services = await Service.query()
    .withGraphFetched(
      '[domain(selectName), owners(selectEmail), producesEvents(isLatest,selectName), consumesEvents(isLatest,selectName), docs(selectId)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectEmail(builder) {
        builder.select('email');
      },
      selectId(builder) {
        builder.select('id');
      },
    })
    .orderBy('domain_name', 'asc', 'last');

  return json({
    services,
    catalogHash,
  });
}

const ServiceIndexPage = () => {
  const { services } = useLoaderData<typeof loader>();

  return (
    <div>
      <Breadcrumb crumbs={[{ name: 'Services', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Services ({services.length})</h1>
      <ServiceList services={services} />
    </div>
  );
};

export default ServiceIndexPage;
