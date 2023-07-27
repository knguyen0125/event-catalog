import type { V2_MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React from 'react';
import {
  Cog8ToothIcon,
  EnvelopeIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import Container from '~/components/Container';
import { Owner } from '~/database/models';
import CardV2 from '~/components/CardV2';

export const meta: V2_MetaFunction = () => [
  { title: 'Owners' },
  { name: 'description', content: 'Owners' },
];

export async function loader() {
  const owners = await Owner.query()
    .withGraphFetched(
      '[events(selectName), services(selectName), domains(selectName)]',
    )
    .modifiers({
      selectName(builder) {
        builder.select('name');
      },
    })
    .orderBy('email');

  return json({
    owners,
  });
}

const OwnersIndex = () => {
  const { owners } = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="py-4 text-2xl font-bold">Owners ({owners.length})</h1>
      <hr className="py-4" />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    icon: Cog8ToothIcon,
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
    </Container>
  );
};

export default OwnersIndex;
