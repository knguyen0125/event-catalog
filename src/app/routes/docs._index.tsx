import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Doc } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import DocList from '~/components/DocList';
import Card from '~/components/Card';

export const meta: V2_MetaFunction = () => [
  { title: 'Docs' },
  { name: 'description', content: 'Docs' },
];

export async function loader() {
  const docs = await Doc.query()
    .withGraphFetched(
      '[domain(selectName), service(selectName), owners(selectNameAndEmail)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectNameAndEmail(builder) {
        builder.select('name', 'email');
      },
    })
    .orderBy('last_updated_at');

  return json({
    docs,
    catalogHash,
  });
}

const DocIndexPage = () => {
  const { docs } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={[{ name: 'Docs', to: '.' }]} />
        <h1 className="pt-2 text-2xl font-bold">Docs ({docs.length})</h1>
      </Card>
      <DocList docs={docs} />
    </div>
  );
};

export default DocIndexPage;
