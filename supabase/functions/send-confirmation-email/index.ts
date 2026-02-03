// deno-lint-ignore-file
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') as string
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Sokoni Arena brand colors
const BRAND_PRIMARY = '#10b981'
const BRAND_DARK = '#059669'

// Generate branded HTML email template for signup confirmation
function generateConfirmationEmailHtml(params: {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}): string {
  const { supabase_url, email_action_type, redirect_to, token_hash, token } = params
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
  const logoUrl = 'https://tzrdtxrplzcvfotzndrp.supabase.co/storage/v1/object/public/email-assets/logo.png?v=2'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Confirm your Sokoni Arena account</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 48px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto;">
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <img src="${logoUrl}" alt="Sokoni Arena" width="72" height="72" style="display: block; margin: 0 auto; border-radius: 16px;">
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Green Header Bar -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); height: 6px; border-radius: 16px 16px 0 0;"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 32px;">
                    <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                      Welcome to Sokoni Arena! 🎉
                    </h1>
                    <p style="margin: 0 0 32px; font-size: 16px; line-height: 26px; color: #525252; text-align: center;">
                      Thank you for signing up! Please confirm your email address to activate your account and start exploring the marketplace.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${confirmUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                        Confirm Email Address
                      </a>
                    </div>
                    
                    <!-- Divider -->
                    <div style="border-top: 1px solid #e5e7eb; margin: 28px 0;"></div>
                    
                    <!-- OTP Code Section -->
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-align: center;">
                      Or enter this confirmation code manually:
                    </p>
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 10px; padding: 20px; margin: 0 auto; max-width: 220px;">
                      <code style="display: block; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                        ${token}
                      </code>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 20px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af; text-align: center; line-height: 20px;">
                If you didn't create an account on Sokoni Arena, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
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

// Generate branded HTML email template for password reset
function generatePasswordResetEmailHtml(params: {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}): string {
  const { supabase_url, email_action_type, redirect_to, token_hash, token } = params
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
  const logoUrl = 'https://tzrdtxrplzcvfotzndrp.supabase.co/storage/v1/object/public/email-assets/logo.png?v=2'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Reset your Sokoni Arena password</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 48px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto;">
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <img src="${logoUrl}" alt="Sokoni Arena" width="72" height="72" style="display: block; margin: 0 auto; border-radius: 16px;">
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Header Bar -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); height: 6px; border-radius: 16px 16px 0 0;"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 32px;">
                    <!-- Lock Icon -->
                    <div style="text-align: center; margin-bottom: 20px;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; line-height: 64px; font-size: 28px;">
                        🔐
                      </div>
                    </div>
                    
                    <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                      Reset Your Password
                    </h1>
                    <p style="margin: 0 0 32px; font-size: 16px; line-height: 26px; color: #525252; text-align: center;">
                      We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 10px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                        Reset Password
                      </a>
                    </div>
                    
                    <!-- Divider -->
                    <div style="border-top: 1px solid #e5e7eb; margin: 28px 0;"></div>
                    
                    <!-- OTP Code Section -->
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-align: center;">
                      Or use this verification code:
                    </p>
                    <div style="background-color: #fffbeb; border: 2px dashed #fcd34d; border-radius: 10px; padding: 20px; margin: 0 auto; max-width: 220px;">
                      <code style="display: block; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                        ${token}
                      </code>
                    </div>
                    
                    <!-- Security Note -->
                    <div style="margin-top: 28px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #d1d5db;">
                      <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 20px;">
                        <strong style="color: #374151;">Security tip:</strong> Never share this code with anyone. Sokoni Arena will never ask for your password or verification codes.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 20px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af; text-align: center; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
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

// Get email subject based on action type
function getEmailSubject(actionType: string): string {
  switch (actionType) {
    case 'signup':
    case 'email':
      return 'Confirm your Sokoni Arena account'
    case 'recovery':
      return 'Reset your Sokoni Arena password'
    case 'email_change':
      return 'Confirm your new email address - Sokoni Arena'
    case 'invite':
      return "You've been invited to Sokoni Arena"
    default:
      return 'Sokoni Arena - Action Required'
  }
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

    console.log(`Sending ${email_action_type} email to ${user.email}`)

    // Select template based on action type
    const isPasswordReset = email_action_type === 'recovery'
    
    const html = isPasswordReset 
      ? generatePasswordResetEmailHtml({
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      : generateConfirmationEmailHtml({
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
        })

    const subject = getEmailSubject(email_action_type)

    // Send email using Brevo API with verified sender
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
          email: 'confirmation@sokoniarena.co.ke',
        },
        to: [{ email: user.email }],
        subject: subject,
        htmlContent: html,
      }),
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json()
      console.error('Brevo error:', errorData)
      throw new Error(errorData.message || 'Failed to send email via Brevo')
    }

    console.log(`${email_action_type} email sent successfully to ${user.email}`)

  } catch (error: unknown) {
    console.error('Error sending email:', error)
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
