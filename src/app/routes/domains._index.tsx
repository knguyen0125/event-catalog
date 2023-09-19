import type { V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  CubeIcon,
  DocumentIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Domain } from '~/database/models.server';
import CardV2 from '~/components/CardV2';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import Card from '~/components/Card';

export const meta: V2_MetaFunction = () => [
  { title: 'Domains' },
  { name: 'description', content: 'Domains' },
];

export async function loader() {
  const domains = await Domain.query()
    .withGraphFetched(
      '[events(isLatest,selectName), services(selectName), owners(selectEmail), docs(selectId)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
      selectEmail(builder) {
        builder.select('email');
      },
      selectId(builder) {
        builder.select('id');
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
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={[{ name: 'Domains', to: '.' }]} />
        <h1 className="pt-2 text-2xl font-bold">Domains ({domains.length})</h1>
      </Card>
      <ul className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
                    icon: CubeIcon,
                    iconClassName: 'text-emerald-500',
                    text: `Services (${domain.services?.length || 0})`,
                  },
                  {
                    icon: UserGroupIcon,
                    iconClassName: 'text-yellow-500',
                    text: `Owners (${domain.owners?.length || 0})`,
                  },
                  {
                    icon: DocumentIcon,
                    iconClassName: 'text-stone-500',
                    text: `Docs (${domain.docs?.length || 0})`,
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
