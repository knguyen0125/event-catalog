import React from 'react';
import { json, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Service } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';

export const meta: V2_MetaFunction<typeof loader> = ({}) => [
  { title: `Visualizer` },
  { name: 'description', content: 'Visualizer' },
];

export async function loader() {
  const services = await Service.query().withGraphFetched(
    '[domain, owners, producesEvents(isLatest), consumesEvents(isLatest)]',
  );

  return json({
    services,
    catalogHash,
  });
}

const VisualizerPage = () => {
  const { services } = useLoaderData<typeof loader>();
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ServicesVisualizer services={services} withEdgeLabel />
    </div>
  );
};
export default VisualizerPage;
