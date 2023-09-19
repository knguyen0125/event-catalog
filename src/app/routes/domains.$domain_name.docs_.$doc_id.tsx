import type { LoaderArgs } from '@remix-run/node';
import { json, Response, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import { Doc } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import Card from '~/components/Card';
import Breadcrumb from '~/components/Breadcrumb';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.doc.title || data?.doc.file_name} | Documents` },
  { name: 'description', content: 'Document' },
];

export async function loader({ params }: LoaderArgs) {
  const id = params.doc_id ? params.doc_id.split('-')[0] : undefined;
  if (!id) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  const doc = await Doc.query()
    .where({
      id,
    })
    .first();

  if (!doc) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    doc,
    crumbs: [
      { name: 'Domains', to: '/domains' },
      { name: doc.domain_name as string, to: `/domains/${doc.domain_name}` },
      { name: 'Docs', to: `/domains/${doc.domain_name}/docs` },
      {
        name: (doc.title || doc.file_name) as string,
      },
    ],
    catalogHash,
  });
}
const DocDetailPage = () => {
  const { doc, crumbs } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={crumbs} />
        <h1 className="pt-2 text-2xl font-bold">
          {doc.title || doc.file_name}
        </h1>
        {doc.summary && <p className="pt-2 text-gray-500">{doc.summary}</p>}
      </Card>
      {doc.content && (
        <Card title="Content">
          <div className="prose max-w-none">
            {/* eslint-disable-next-line react/no-children-prop */}
            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocDetailPage;
