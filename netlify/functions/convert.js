// netlify/functions/convert.js
const { convertIPEmail } = require('@wlocalhost/ngx-email-builder-convertor');

exports.handler = async function (event, context) {
  // Ensure the request is a POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);

    // Use your conversion function
    const result = convertIPEmail(body, process.env.NODE_ENV === 'production');

    // Return the converted result
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
