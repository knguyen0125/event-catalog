import type { V2_MetaFunction } from '@remix-run/node';
import Container from '~/components/Container';
import { json } from '@remix-run/node';
import { Domain } from '~/database/models';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Domains' }, { name: 'description', content: 'Domains' }];
};

export async function loader() {
  const domains = await Domain.query();

  return json({
    domains,
  });
}

export default function DomainIndex() {
  return (
    <Container>
      <h1>Domains</h1>
    </Container>
  );
}
