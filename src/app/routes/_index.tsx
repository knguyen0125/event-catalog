import type { V2_MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const meta: V2_MetaFunction = () => [
  { title: 'Event Catalog' },
  { name: 'description', content: 'Event Catalog' },
];

export async function loader() {
  throw redirect('/events');
}
