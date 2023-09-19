import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';
import Avatar from '~/components/Avatar';

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

const DomainDetailPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <Breadcrumb
        crumbs={[
          { name: 'Domains', to: '/domains' },
          { name: domain.name },
          { name: 'Overview' },
        ]}
      />
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="py-4 text-2xl font-bold">{domain.name}</h1>
          </div>
          <p className="pb-4 text-gray-500">{domain.summary}</p>
          <div className="flex gap-2 pb-4">
            {(domain.owners || []).map((owner) => (
              <Link
                key={owner.email}
                to={`/owners/${owner.email}`}
                className="flex items-center gap-2"
              >
                <Avatar alt={owner.name} src={owner.image} />
                <span className="text-gray-500">{owner.name}</span>
              </Link>
            ))}
          </div>
          <hr className="pb-4" />
          <div className="prose max-w-none">
            {/* eslint-disable-next-line react/no-children-prop */}
            {domain.content && (
              <div dangerouslySetInnerHTML={{ __html: domain.content }} />
            )}
          </div>
          <div>
            <h2 className="py-4 text-2xl font-bold">Visualizer</h2>
            <div className="h-[500px] w-full">
              <ServicesVisualizer
                domainName={domain.name}
                services={domain.services || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainDetailPage;
