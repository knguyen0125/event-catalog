import type { V2_MetaFunction } from '@remix-run/node';
import Container from '~/components/Container';
import { json } from '@remix-run/node';
import { Domain } from '~/database/models';
import { useLoaderData } from '@remix-run/react';
import DomainCard from '~/components/DomainCard';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Domains' }, { name: 'description', content: 'Domains' }];
};

export async function loader() {
  const domains = await Domain.query()
    .withGraphFetched('[events, services, owners]')
    .orderBy('name');

  return json({
    domains,
  });
}

export default function DomainIndex() {
  const { domains } = useLoaderData<typeof loader>();
  return (
    <Container>
      <h1 className="py-4 text-2xl font-bold">Domains ({domains.length})</h1>
      <hr className={'py-4'} />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {domains.map((domain) => (
          <li key={domain.name}>
            <DomainCard domain={domain} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
