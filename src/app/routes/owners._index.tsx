import type { V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React from 'react';
import {
  CubeIcon,
  EnvelopeIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { Owner } from '~/database/models.server';
import CardV2 from '~/components/CardV2';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';

export const meta: V2_MetaFunction = () => [
  { title: 'Owners' },
  { name: 'description', content: 'Owners' },
];

export async function loader() {
  const owners = await Owner.query()
    .withGraphFetched(
      '[events(isLatest,selectName), services(selectName), domains(selectName)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
    })
    .orderBy('email');

  return json({
    owners,
    catalogHash,
  });
}

const OwnersIndex = () => {
  const { owners } = useLoaderData<typeof loader>();

  return (
    <div>
      <Breadcrumb crumbs={[{ name: 'Owners', to: '.' }]} />
      <h1 className="py-4 text-2xl font-bold">Owners ({owners.length})</h1>
      <hr className="py-4" />
      <ul className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {owners.map((owner) => (
          <li key={owner.email}>
            <Link to={`./${owner.email}`} key={owner.email}>
              {/* <OwnerCard owner={owner} /> */}

              <CardV2
                title={owner.name ? owner.name : owner.email}
                description={owner.role}
                additionalDetails={[
                  {
                    icon: EnvelopeIcon,
                    iconClassName: 'text-blue-500',
                    text: `Events (${owner.events?.length || 0})`,
                  },
                  {
                    icon: CubeIcon,
                    iconClassName: 'text-emerald-500',
                    text: `Services (${owner.services?.length || 0})`,
                  },
                  {
                    icon: RectangleStackIcon,
                    iconClassName: 'text-red-500',
                    text: `Domains (${owner.domains?.length || 0})`,
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

export default OwnersIndex;
