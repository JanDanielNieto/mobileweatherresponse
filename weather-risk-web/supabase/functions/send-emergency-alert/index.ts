// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts' // Or a more recent stable version
import { Resend } from 'npm:resend'

// IMPORTANT: Store your API key and From Email as Supabase secrets, not directly in the code.
// Go to your Supabase project dashboard -> Settings -> Secrets
// Add a new secret, e.g., RESEND_API_KEY with your actual Resend API key.
// Add another secret, e.g., FROM_EMAIL with your verified sender email.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') // e.g., 'alerts@yourdomain.com' or your verified personal email
const ALLOWED_ORIGINS = new Set([
  'https://mobileweatherresponse.vercel.app',
  'http://localhost:5173',
])

const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables.');
}
if (!FROM_EMAIL) {
  console.error('FROM_EMAIL is not set in environment variables. This should be your verified Resend sender email.');
}

const resend = new Resend(RESEND_API_KEY)

console.log("send-emergency-alert function initialized.");

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (!corsHeaders['Access-Control-Allow-Origin']) {
      return new Response(null, { status: 403 })
    }

    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    console.log(`Method Not Allowed: ${req.method}`);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { recipientEmail, emergencyDetails } = await req.json()
    console.log("Request received. Recipient:", recipientEmail, "Details:", emergencyDetails);


    if (!recipientEmail) {
      console.error('recipientEmail is required');
      return new Response(JSON.stringify({ error: 'recipientEmail is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!emergencyDetails) {
      console.error('emergencyDetails are required');
      return new Response(JSON.stringify({ error: 'emergencyDetails are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!RESEND_API_KEY || !FROM_EMAIL) {
     console.error('Email service not configured on server: Missing RESEND_API_KEY or FROM_EMAIL.');
     return new Response(JSON.stringify({ error: 'Email service not configured on server.' }), {
       status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
    }

    const subject = `New Emergency Alert: ${emergencyDetails.type || 'Alert'} in ${emergencyDetails.city || 'your area'}`;
    const htmlBody = `
      <h1>New Emergency Alert</h1>
      <p>An emergency has been reported:</p>
      <ul>
        <li><strong>Type:</strong> ${emergencyDetails.type || 'N/A'}</li>
        <li><strong>City:</strong> ${emergencyDetails.city || 'N/A'}</li>
        <li><strong>Location:</strong> ${emergencyDetails.fullAddress || 'Detailed location not available'}</li> 
        <li><strong>Severity:</strong> ${emergencyDetails.severity || 'N/A'}</li>
        <li><strong>Details:</strong> ${emergencyDetails.details || 'No additional details.'}</li>
        <li><strong>Reported by:</strong> ${emergencyDetails.user || 'N/A'}</li>
      </ul>
      <p>Please take necessary precautions and stay informed.</p>
      <p><em>This is an automated message from Seia Weather Response.</em></p>
    `;

    console.log(`Attempting to send email to: ${recipientEmail} from: ${FROM_EMAIL} with subject: ${subject}`);

    const { data, error } = await resend.emails.send({
      from: `Seia Weather Alerts <${FROM_EMAIL}>`,
      to: [recipientEmail], // Resend expects an array of strings for 'to'
      subject: subject,
      html: htmlBody,
    })

    if (error) {
      console.error('Resend API Error:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ error: 'Failed to send email', details: error.message }), {
        status: 500, // Internal Server Error or specific error from Resend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Email sent successfully via Resend:', data);
    return new Response(JSON.stringify({ message: 'Email sent successfully', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (e) {
    console.error('Function Error:', e.message, e.stack);
    // It's good practice to avoid sending detailed internal error messages to the client.
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/*
To invoke locally (after `supabase start` and ensuring Docker is running):

1. Make sure RESEND_API_KEY and FROM_EMAIL are set in your supabase/functions/.env file for local testing, e.g.:
   RESEND_API_KEY=re_yourActualKey...
   FROM_EMAIL=yourverified@email.com

2. Use a tool like curl or Postman:

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-emergency-alert' \\
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "recipientEmail": "test@example.com",
    "emergencyDetails": {
      "type": "Test Flood",
      "city": "Testville",
      "severity": "High",
      "details": "This is a test emergency from local curl.",
      "user": "Local Tester",
      "lat": 12.345,
      "lng": -67.890
    }
  }'

Replace YOUR_SUPABASE_ANON_KEY with your actual Supabase anon key if you're testing with JWT verification enabled (though this example is set up with --no-verify-jwt for deployment, local testing might still use it by default).
If you deployed with --no-verify-jwt, the Authorization header might not be strictly needed for invocation if not enforced by other policies.
*/
