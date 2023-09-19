import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';
import Avatar from '~/components/Avatar';
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
    .withGraphFetched('[services.[producesEvents, consumesEvents], owners]');

  if (!domain) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    domain,
    catalogHash,
  });
}

const DomainOverviewPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb
          crumbs={[
            { name: 'Domains', to: '/domains' },
            { name: domain.name },
            { name: 'Overview' },
          ]}
        />
        <h1 className="py-4 text-2xl font-bold">{domain.name}</h1>
        <p className="text-gray-500">{domain.summary}</p>
      </Card>
      {domain.owners && domain.owners.length > 0 && (
        <Card title="Owners">
          {(domain.owners || []).map((owner) => (
            <Link
              key={owner.email}
              to={`/owners/${owner.email}`}
              className="flex items-center gap-2"
            >
              <Avatar alt={owner.name} src={owner.image} />
              <span className="text-gray-700">{owner.name}</span>
            </Link>
          ))}
        </Card>
      )}
      {domain.content && (
        <Card title="Content">
          <div className="prose max-w-none">
            {/* eslint-disable-next-line react/no-children-prop */}
            <div dangerouslySetInnerHTML={{ __html: domain.content }} />
          </div>
        </Card>
      )}
      <Card title="Visualizer">
        <div className="h-[500px] w-full">
          <ServicesVisualizer
            domainName={domain.name}
            services={domain.services || []}
          />
        </div>
      </Card>
    </div>
  );
};

export default DomainOverviewPage;
