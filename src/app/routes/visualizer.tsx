import React from 'react';
import { json, LoaderArgs, redirect, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Container from '~/components/Container';
import { Service } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import Breadcrumb from '~/components/Breadcrumb';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `Visualizer` },
  { name: 'description', content: 'Visualizer' },
];

export async function loader({ params }: LoaderArgs) {
  const services = await Service.query().withGraphFetched(
    '[domain, owners, producesEvents(isLatest), consumesEvents(isLatest)]',
  );

  return json({
    services,
    catalogHash,
    crumbs: [{ name: 'Visualizer', to: '/visualizer' }],
  });
}

const VisualizerPage = () => {
  const { services, crumbs } = useLoaderData<typeof loader>();
  return (
    <div className="h-[90vh] w-screen">
      <ServicesVisualizer services={services} />
    </div>
  );
};
export default VisualizerPage;
