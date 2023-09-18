import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ModelObject } from 'objection';
import slugify from 'slugify';
import { Doc } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';

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

const getDocPath = (doc: ModelObject<Doc>) => {
  const docPath = `${doc.id}-${slugify(doc.file_name)}`;
  if (doc.domain?.name) {
    if (doc.service?.name) {
      return `/domains/${doc.domain.name}/services/${doc.service.name}/docs/${docPath}`;
    }
    return `/domains/${doc.domain.name}/docs/${docPath}`;
  }

  return `/services/${doc.service?.name}/docs/${docPath}`;
};

const DocIndexPage = () => {
  const { docs } = useLoaderData<typeof loader>();

  return (
    <div>
      <Breadcrumb crumbs={[{ name: 'Docs', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Docs ({docs.length})</h1>
      <hr className="py-4" />
      <ul className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2">
        {docs.map((doc) => (
          <li key={doc.path}>
            <Link to={getDocPath(doc)}>
              {doc.summary}-{doc.service?.name}-{doc.domain?.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocIndexPage;
