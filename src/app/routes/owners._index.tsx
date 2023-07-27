import type { V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import Container from '~/components/Container';
import OwnerCard from '~/components/OwnerCard';
import { Owner } from '~/database/models';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Owners' }, { name: 'description', content: 'Owners' }];
};

export async function loader() {
  const owners = await Owner.query();

  return json({
    owners,
  });
}

export default function OwnersIndex() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="py-4 text-4xl font-bold">Owners</h1>
      <ul className={'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
        {data.owners.map((owner) => (
          <li key={owner.email}>
            <OwnerCard owner={owner} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
