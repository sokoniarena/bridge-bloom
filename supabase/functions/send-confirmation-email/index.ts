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
const BRAND_NAVY = '#0f172a'

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
  const logoUrl = 'https://tzrdtxrplzcvfotzndrp.supabase.co/storage/v1/object/public/email-assets/logo.png?v=3'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to SOKONI ARENA</title>
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
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto;">
          
          <!-- Header with Logo and Title -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <img src="${logoUrl}" alt="Sokoni Arena" width="100" height="100" style="display: block; margin: 0 auto 16px; border-radius: 20px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.25);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: ${BRAND_NAVY}; letter-spacing: 2px;">
                SOKONI ARENA
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${BRAND_PRIMARY}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Kenya's Premier Digital Marketplace
              </p>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Green Header Bar -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); height: 8px; border-radius: 20px 20px 0 0;"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    
                    <!-- Welcome Icon -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 50%; line-height: 72px; font-size: 36px;">
                        👋
                      </div>
                    </div>
                    
                    <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: ${BRAND_NAVY}; text-align: center; line-height: 1.3;">
                      Welcome to the Arena!
                    </h2>
                    
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 28px; color: #525252; text-align: center;">
                      Thank you for joining <strong style="color: ${BRAND_NAVY};">Sokoni Arena</strong> — your gateway to Kenya's most trusted digital marketplace!
                    </p>
                    
                    <!-- Platform Description -->
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; padding: 24px; margin-bottom: 28px; border-left: 4px solid ${BRAND_PRIMARY};">
                      <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #374151;">
                        🛒 <strong>Buy & Sell</strong> — List products, services, and events with ease
                      </p>
                      <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #374151;">
                        💼 <strong>SkillBridge</strong> — Complete tasks and earn real money
                      </p>
                      <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #374151;">
                        🎉 <strong>Fun Circle</strong> — Connect with friends and share moments
                      </p>
                      <p style="margin: 0; font-size: 15px; line-height: 24px; color: #374151;">
                        🔒 <strong>Secure & Verified</strong> — Trade with confidence in a trusted community
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 28px; font-size: 16px; line-height: 26px; color: #525252; text-align: center;">
                      Please confirm your email address to activate your account and unlock all features.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${confirmUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; padding: 18px 48px; border-radius: 12px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                        Confirm My Email
                      </a>
                    </div>
                    
                    <!-- Divider -->
                    <div style="border-top: 2px solid #e5e7eb; margin: 32px 0;"></div>
                    
                    <!-- OTP Code Section -->
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-align: center;">
                      Or enter this verification code manually:
                    </p>
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; margin: 0 auto; max-width: 240px;">
                      <code style="display: block; font-size: 32px; font-weight: 800; color: ${BRAND_NAVY}; text-align: center; letter-spacing: 8px; font-family: 'Courier New', monospace;">
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
            <td style="padding: 36px 20px 0;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #9ca3af; text-align: center; line-height: 20px;">
                If you didn't create an account on Sokoni Arena, you can safely ignore this email.
              </p>
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="https://sokoniarena.co.ke" target="_blank" style="color: ${BRAND_PRIMARY}; font-size: 14px; font-weight: 600; text-decoration: none;">
                  Visit sokoniarena.co.ke
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Sokoni Arena. All rights reserved.<br>
                Kenya's Premier Digital Marketplace
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
  const logoUrl = 'https://tzrdtxrplzcvfotzndrp.supabase.co/storage/v1/object/public/email-assets/logo.png?v=3'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Reset Your SOKONI ARENA Password</title>
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
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto;">
          
          <!-- Header with Logo and Title -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <img src="${logoUrl}" alt="Sokoni Arena" width="100" height="100" style="display: block; margin: 0 auto 16px; border-radius: 20px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.25);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: ${BRAND_NAVY}; letter-spacing: 2px;">
                SOKONI ARENA
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${BRAND_PRIMARY}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Kenya's Premier Digital Marketplace
              </p>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Header Bar (Amber for password reset) -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); height: 8px; border-radius: 20px 20px 0 0;"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    
                    <!-- Lock Icon -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 50%; line-height: 72px; font-size: 36px;">
                        🔐
                      </div>
                    </div>
                    
                    <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: ${BRAND_NAVY}; text-align: center; line-height: 1.3;">
                      Reset Your Password
                    </h2>
                    
                    <p style="margin: 0 0 28px; font-size: 16px; line-height: 28px; color: #525252; text-align: center;">
                      We received a request to reset your <strong style="color: ${BRAND_NAVY};">Sokoni Arena</strong> account password. Click the button below to create a new password.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; padding: 18px 48px; border-radius: 12px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                        Reset Password
                      </a>
                    </div>
                    
                    <!-- Expiry Notice -->
                    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 10px; padding: 16px; margin-bottom: 28px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #92400e;">
                        ⏰ This link will expire in <strong>1 hour</strong>
                      </p>
                    </div>
                    
                    <!-- Divider -->
                    <div style="border-top: 2px solid #e5e7eb; margin: 28px 0;"></div>
                    
                    <!-- OTP Code Section -->
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-align: center;">
                      Or use this verification code:
                    </p>
                    <div style="background-color: #fffbeb; border: 2px dashed #fcd34d; border-radius: 12px; padding: 24px; margin: 0 auto 24px; max-width: 240px;">
                      <code style="display: block; font-size: 32px; font-weight: 800; color: ${BRAND_NAVY}; text-align: center; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${token}
                      </code>
                    </div>
                    
                    <!-- Security Note -->
                    <div style="background-color: #f9fafb; border-radius: 10px; padding: 16px; border-left: 4px solid #d1d5db;">
                      <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 20px;">
                        <strong style="color: #374151;">🛡️ Security tip:</strong> Never share this code with anyone. Sokoni Arena will never ask for your password or verification codes.
                      </p>
                    </div>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 36px 20px 0;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #9ca3af; text-align: center; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="https://sokoniarena.co.ke" target="_blank" style="color: ${BRAND_PRIMARY}; font-size: 14px; font-weight: 600; text-decoration: none;">
                  Visit sokoniarena.co.ke
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Sokoni Arena. All rights reserved.<br>
                Kenya's Premier Digital Marketplace
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
