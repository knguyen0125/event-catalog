import React from 'react';
import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Domain } from '~/database/models.server';
import Container from '~/components/Container';

export async function loader({ params }: LoaderArgs) {
  const domain = await Domain.query().findOne({
    name: params.domain_name,
  });

  if (!domain) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    domain,
  });
}

const DomainDetailPage = () => {
  const { domain } = useLoaderData<typeof loader>();

  return <Container>{domain.name}</Container>;
};

export default DomainDetailPage;
