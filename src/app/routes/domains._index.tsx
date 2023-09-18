import type { V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Cog8ToothIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Domain } from '~/database/models.server';
import CardV2 from '~/components/CardV2';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';

export const meta: V2_MetaFunction = () => [
  { title: 'Domains' },
  { name: 'description', content: 'Domains' },
];

export async function loader() {
  const domains = await Domain.query()
    .withGraphFetched(
      '[events(isLatest,selectName), services(selectName), owners(selectEmail)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectEmail(builder) {
        builder.select('email');
      },
    })
    .orderBy('name');

  return json({
    domains,
    catalogHash,
  });
}

const DomainIndex = () => {
  const { domains } = useLoaderData<typeof loader>();
  return (
    <div>
      <Breadcrumb crumbs={[{ name: 'Domains', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Domains ({domains.length})</h1>
      <hr className="py-4" />
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
                    iconClassName: 'text-emerald-500',
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
    </div>
  );
};

export default DomainIndex;
