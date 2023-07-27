import type { V2_MetaFunction } from '@remix-run/node';
import Container from '~/components/Container';
import { json } from '@remix-run/node';
import { Domain } from '~/database/models';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Cog8ToothIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import CardV2 from '~/components/CardV2';

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
            <Link to={`/domains/${domain.name}`}>
              <CardV2
                title={domain.name}
                description={domain.summary}
                additionalDetails={[
                  {
                    icon: EnvelopeIcon,
                    iconClassName: 'text-blue-500',
                    text: `Events (${domain.events?.length || 0})`,
                  },
                  {
                    icon: Cog8ToothIcon,
                    iconClassName: 'text-green-500',
                    text: `Services (${domain.services?.length || 0})`,
                  },
                  {
                    icon: UserGroupIcon,
                    iconClassName: 'text-yellow-500',
                    text: `Owners (${domain.owners?.length || 0})`,
                  },
                ]}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
