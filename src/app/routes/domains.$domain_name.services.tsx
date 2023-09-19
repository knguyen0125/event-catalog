import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import ServiceList from '~/components/ServiceList';
import Breadcrumb from '~/components/Breadcrumb';
import Card from '~/components/Card';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.domain.name} | Domains` },
  { name: 'description', content: 'Domains' },
];

export async function loader({ params }: LoaderArgs) {
  const domain = await Domain.query()
    .findOne({
      name: params.domain_name,
    })
    .withGraphFetched('[services.[producesEvents, consumesEvents, docs]]');

  if (!domain) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    domain,
    catalogHash,
  });
}

const DomainServiceListPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb
          crumbs={[
            { name: 'Domains', to: '/domains' },
            { name: domain.name },
            { name: 'Services' },
          ]}
        />
      </Card>
      {domain.services && domain.services.length > 0 ? (
        <ServiceList services={domain.services || []} />
      ) : (
        <Card>No services</Card>
      )}
    </div>
  );
};

export default DomainServiceListPage;
