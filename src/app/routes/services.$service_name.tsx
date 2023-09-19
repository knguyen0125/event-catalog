import React from 'react';
import { json, LoaderArgs, redirect, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SwaggerUI from 'swagger-ui-react';
import { Service } from '~/database/models.server';
import Breadcrumb from '~/components/Breadcrumb';
import catalogHash from '../../../catalogHash.json';
import ServicesVisualizer from '~/components/visualizer/ServicesVisualizer';
import Card from '~/components/Card';
import DocList from '~/components/DocList';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.service.name} | Services` },
  { name: 'description', content: 'Services' },
];

export async function loader({ params }: LoaderArgs) {
  const service = await Service.query()
    .findOne({
      name: params.service_name,
    })
    .withGraphFetched(
      '[domain, owners, producesEvents(isLatest), consumesEvents(isLatest), docs(selectTitleAndSummaryAndId)]',
    )
    .modifiers({
      selectTitleAndSummaryAndId(builder) {
        builder.select(
          'title',
          'summary',
          'id',
          'domain_name',
          'service_name',
          'file_name',
        );
      },
    });
  if (!service) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  if (service.domain_name) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect(`/domains/${service.domain_name}/services/${service.name}`);
  }

  return json({
    service,
    catalogHash,
    crumbs: [
      { name: 'Services', to: '/Services' },
      { name: service.name, to: '.' },
    ],
  });
}

const ServiceDetailPage = () => {
  const { service, crumbs } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gray-50 p-4">
      <Card>
        <Breadcrumb crumbs={crumbs} />
        <h1 className="pt-2 text-2xl font-bold">{service.name}</h1>
        {service.summary && (
          <p className="pt-2 text-gray-500">{service.summary}</p>
        )}
      </Card>
      {service.content && (
        <Card title="Content">
          <div className="prose max-w-none">
            {/* eslint-disable-next-line react/no-children-prop */}
            <div dangerouslySetInnerHTML={{ __html: service.content }} />
          </div>
        </Card>
      )}
      <Card title="Visualizer">
        <div className="h-[500px] w-full">
          <ServicesVisualizer services={[service]} />
        </div>
      </Card>
      {service.openapi && (
        <Card title="OpenAPI">
          <div className="w-full">
            <SwaggerUI spec={service.openapi} />
          </div>
        </Card>
      )}
      {service.docs && service.docs.length > 0 && (
        <>
          <Card>
            <div className="text-base font-semibold leading-6 text-gray-900">
              Docs ({service.docs.length})
            </div>
          </Card>
          <DocList docs={service.docs} />
        </>
      )}
    </div>
  );
};

export default ServiceDetailPage;
