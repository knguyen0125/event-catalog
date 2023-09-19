import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.domain.name} | Domains` },
  { name: 'description', content: 'Domains' },
];

export async function loader({ params }: LoaderArgs) {
  const domain = await Domain.query()
    .findOne({
      name: params.domain_name,
    })
    .withGraphFetched('[docs]');

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

  return <div>Docs</div>;
};

export default DomainDetailPage;
