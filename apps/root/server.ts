// apps/root/server.ts

import { CommonEngine } from '@angular/ssr/node';
import { render } from '@netlify/angular-runtime/common-engine.mjs';
import { convertIPEmail } from '@wlocalhost/ngx-email-builder-convertor';

const commonEngine = new CommonEngine();

export async function netlifyCommonEngineHandler(
  request: Request
): Promise<Response> {
  const url = new URL(request.url);

  // Custom API endpoint
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

  // All other requests: standard Angular SSR render
  return await render(commonEngine);
}

// This is the entry point Netlify will bundle as your SSR Edge Function:
export const reqHandler = netlifyCommonEngineHandler;

// Add a default export so that Nx’s generated main-server.js
// can re-export it without complaining:
export default reqHandler;
