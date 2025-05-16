import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';
import { convertIPEmail } from '@wlocalhost/ngx-email-builder-convertor';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
  request: Request
): Promise<Response> {
  const context = getContext();
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle your API convert endpoint
  if (pathname === '/api/convert' && request.method === 'POST') {
    try {
      const body = await request.json();
      const result = convertIPEmail(
        body,
        process.env['NODE_ENV'] === 'production'
      );

      return Response.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Error in convert function:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Pass all other requests to the Angular app
  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
