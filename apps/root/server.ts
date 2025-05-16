import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';
import { convertIPEmail } from '@wlocalhost/ngx-email-builder-convertor';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
  request: Request
): Promise<Response> {
  const url = new URL(request.url);
  const context = getContext();

  // Your custom API endpoint:
  if (url.pathname === '/api/convert' && request.method === 'POST') {
    try {
      const body = await request.json();
      const result = convertIPEmail(
        body,
        process.env['NODE_ENV'] === 'production'
      );
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // All other requests go to Angular SSR:
  const response = await angularAppEngine.handle(request, context);
  return response ?? new Response('Not found', { status: 404 });
}

// The entrypoint Netlify will bundle as an Edge Function:
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
