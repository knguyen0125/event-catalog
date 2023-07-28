import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React from 'react';
import Container from '~/components/Container';
import { Owner } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';

export const meta: V2_MetaFunction = () => [
  { title: 'Owners' },
  { name: 'description', content: 'Owners' },
];

export async function loader({ params }: LoaderArgs) {
  const owner = await Owner.query().findOne({ email: params.owner_email });

  if (!owner) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not found', { status: 404 });
  }

  return json({
    owner,
  });
}

const OwnerDetailPage = () => {
  const { owner } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Breadcrumb
        crumbs={[
          { name: 'Owners', to: '/owners' },
          { name: owner.email, to: '.' },
        ]}
      />
      <h1 className="text-4xl font-bold">{owner.name}</h1>
      <h2 className="text-2xl font-bold">{owner.role}</h2>
      <p>{owner.email}</p>
    </Container>
  );
};

export default OwnerDetailPage;
