// netlify/edge-functions/convert.js

import { convertIPEmail } from '@wlocalhost/ngx-email-builder-convertor';

export const handler = async (event, context) => {
  if (event.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
    });
  }
  try {
    const body = await event.request.json();
    const result = convertIPEmail(body, process.env.NODE_ENV === 'production');
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
};
