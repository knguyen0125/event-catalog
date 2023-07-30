import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Service } from '~/database/models.server';
import catalogHash from '../../../catalogHash.json';
import ServiceDetailPage from '~/routes/services.$service_name';

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
      '[domain, owners, producesEvents(isLatest), consumesEvents(isLatest)]',
    );

  if (!service) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    service,
    catalogHash,
    crumbs: [
      { name: 'Domains', to: '/domains' },
      { name: service.domain_name, to: `/domains/${service.domain_name}` },
      { name: 'Services', to: '/Services' },
      { name: service.name, to: '.' },
    ],
  });
}

export default ServiceDetailPage;
