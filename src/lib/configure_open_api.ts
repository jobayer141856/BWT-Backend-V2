import env from '@/env';
import { Scalar as apiReference } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types';

import packageJSON from '../../package.json' with { type: 'json' };

export function configureOpenAPI(app: AppOpenAPI, openapiPath = '/reference', docPath = '/doc') {
  app.doc(docPath, {
    openapi: '3.0.0',
    info: {
      title: packageJSON.name,
      description: 'BWT API Documentation',
      contact: { name: 'RBR', email: 'rafsan@fortunezip.com' },
      version: packageJSON.version,
    },
    servers: [
      { url: env.SERVER_URL, description: 'Dev' },
      { url: env.PRODUCTION_URL, description: 'Prod' },
    ],

  });

  app.get(
    `${openapiPath}`,
    apiReference({
      url: `${docPath}`,
      theme: 'kepler',
      pageTitle: packageJSON.name,
      layout: 'modern', // modern, classic
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      hideDownloadButton: true,
      hiddenClients: true,
    }),
  );
}
