import React from 'react';
import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import DocList from '~/components/DocList';
import Card from '~/components/Card';
import Breadcrumb from '~/components/Breadcrumb';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.domain.name} | Domains` },
  { name: 'description', content: 'Domains' },
];

export async function loader({ params }: LoaderArgs) {
  const domain = await Domain.query()
    .findOne({
      name: params.domain_name,
    })
    .withGraphFetched('[docs(selectTitleAndSummaryAndId)]')
    .modifiers({
      selectTitleAndSummaryAndId(builder) {
        builder.select(
          'title',
          'summary',
          'id',
          'domain_name',
          'service_name',
          'file_name',
          'last_updated_at',
        );
      },
    });

  if (!domain) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    domain,
    catalogHash,
  });
}

const DomainDocListPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb
          crumbs={[
            { name: 'Domains', to: '/domains' },
            { name: domain.name },
            { name: 'Docs' },
          ]}
        />
      </Card>
      {domain.docs && domain.docs.length > 0 ? (
        <DocList docs={domain.docs} />
      ) : (
        <Card>No docs</Card>
      )}
    </div>
  );
};

export default DomainDocListPage;
