import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import reactFlowStyles from 'reactflow/dist/style.css';
import swaggerUiStyles from 'swagger-ui-react/swagger-ui.css';
import styles from './tailwind.css';
import Layout from '~/components/Layout';
import GlobalLoadingIndicator from '~/components/GlobalLoadingIndicator';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: reactFlowStyles },
  { rel: 'stylesheet', href: swaggerUiStyles },
];

const App = () => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body>
      <Layout>
        <Outlet />
      </Layout>
      <GlobalLoadingIndicator />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </body>
  </html>
);

export default App;
