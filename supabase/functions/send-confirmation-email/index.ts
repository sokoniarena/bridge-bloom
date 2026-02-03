// deno-lint-ignore-file
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') as string
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Generate branded HTML email template
function generateConfirmationEmailHtml(params: {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}): string {
  const { supabase_url, email_action_type, redirect_to, token_hash, token } = params
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your Sokoni Arena account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="https://tzrdtxrplzcvfotzndrp.supabase.co/storage/v1/object/public/email-assets/logo.png?v=1" alt="Sokoni Arena" width="80" height="80" style="display: block; margin: 0 auto;">
              </div>
              <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: bold; color: #1a1a1a; text-align: center;">
                Welcome to Sokoni Arena!
              </h1>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #525252; text-align: center;">
                Thanks for signing up! Please confirm your email address to get started.
              </p>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${confirmUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                  Confirm Email Address
                </a>
              </div>
              <p style="margin: 24px 0 14px; font-size: 14px; line-height: 24px; color: #525252; text-align: center;">
                Or, copy and paste this confirmation code:
              </p>
              <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; max-width: 280px; margin: 0 auto;">
                <code style="display: block; font-size: 24px; font-weight: bold; color: #1a1a1a; text-align: center; letter-spacing: 4px;">
                  ${token}
                </code>
              </div>
              <p style="margin: 32px 0 0; font-size: 12px; line-height: 20px; color: #a1a1aa; text-align: center;">
                If you didn't create an account on Sokoni Arena, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 40px 32px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                © ${new Date().getFullYear()} Sokoni Arena. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
        token_new: string
        token_hash_new: string
      }
    }

    console.log(`Sending confirmation email to ${user.email} for action: ${email_action_type}`)

    const html = generateConfirmationEmailHtml({
      supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
      token,
      token_hash,
      redirect_to,
      email_action_type,
    })

    // Send email using Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Sokoni Arena',
          email: 'noreply@sokoniarena.com',
        },
        to: [{ email: user.email }],
        subject: 'Confirm your Sokoni Arena account',
        htmlContent: html,
      }),
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json()
      console.error('Brevo error:', errorData)
      throw new Error(errorData.message || 'Failed to send email via Brevo')
    }

    console.log(`Confirmation email sent successfully to ${user.email}`)

  } catch (error: unknown) {
    console.error('Error sending confirmation email:', error)
    const err = error as { code?: string; message?: string }
    return new Response(
      JSON.stringify({
        error: {
          http_code: err.code ?? 'UNKNOWN',
          message: err.message ?? 'An error occurred',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
