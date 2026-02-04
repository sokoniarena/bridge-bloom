import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const brevoApiKey = Deno.env.get("BREVO_API_KEY") as string;
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const getEmailTemplate = (
  actionType: string,
  confirmUrl: string,
  userName?: string
): { subject: string; html: string } => {
  const greeting = userName ? `Hello ${userName}` : "Hello";

  if (actionType === "signup" || actionType === "email") {
    return {
      subject: "Complete Your SokoniArena Signup",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your SokoniArena Signup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f7f9f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: #0a7e3a;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .title {
            color: #1a3c2a;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .action-button {
            display: inline-block;
            background: #0da34d;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background: #eee;
            margin: 25px 0;
        }
        .footer {
            background: #f8fbf9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .notice {
            background: #f0f8f3;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .link-text {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">SA</div>
            <div style="font-size: 18px; margin: 5px 0;">SokoniArena</div>
            <div style="font-size: 14px; opacity: 0.9;">Welcome to our community</div>
        </div>
        
        <div class="content">
            <div class="title">Complete Your Signup</div>
            
            <p>${greeting},</p>
            
            <p>You're almost done setting up your SokoniArena profile. Please click below to finish:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${confirmUrl}" class="action-button">Complete Signup</a>
            </div>
            
            <p>If the link doesn't work, copy and paste this into your browser:</p>
            
            <div class="link-text">
                ${confirmUrl}
            </div>
            
            <div class="divider"></div>
            
            <div class="notice">
                <p><strong>Questions?</strong> Contact our team for assistance.</p>
            </div>
            
            <p>If you didn't request this, you can disregard this message.</p>
            
            <p>Sincerely,<br>
            SokoniArena</p>
        </div>
        
        <div class="footer">
            <div>&copy; 2026 SokoniArena</div>
            <div style="margin: 10px 0;">
                <a href="https://sokoniarena.co.ke" style="color: #0a7e3a; margin: 0 10px;">Visit Site</a>
                <a href="https://sokoniarena.co.ke/terms" style="color: #0a7e3a; margin: 0 10px;">Terms</a>
            </div>
            <div>Nairobi</div>
        </div>
    </div>
</body>
</html>`,
    };
  }

  if (actionType === "recovery") {
    return {
      subject: "Reset Your SokoniArena Password",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your SokoniArena Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f7f9f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: #0a7e3a;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .title {
            color: #1a3c2a;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .action-button {
            display: inline-block;
            background: #0da34d;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background: #eee;
            margin: 25px 0;
        }
        .footer {
            background: #f8fbf9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .notice {
            background: #fff3cd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            border-left: 4px solid #ffc107;
        }
        .link-text {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">SA</div>
            <div style="font-size: 18px; margin: 5px 0;">SokoniArena</div>
            <div style="font-size: 14px; opacity: 0.9;">Password Reset Request</div>
        </div>
        
        <div class="content">
            <div class="title">Reset Your Password</div>
            
            <p>${greeting},</p>
            
            <p>We received a request to reset your SokoniArena password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${confirmUrl}" class="action-button">Reset Password</a>
            </div>
            
            <p>If the link doesn't work, copy and paste this into your browser:</p>
            
            <div class="link-text">
                ${confirmUrl}
            </div>
            
            <div class="divider"></div>
            
            <div class="notice">
                <p><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            
            <p>Sincerely,<br>
            SokoniArena Security Team</p>
        </div>
        
        <div class="footer">
            <div>&copy; 2026 SokoniArena</div>
            <div style="margin: 10px 0;">
                <a href="https://sokoniarena.co.ke" style="color: #0a7e3a; margin: 0 10px;">Visit Site</a>
                <a href="https://sokoniarena.co.ke/privacy" style="color: #0a7e3a; margin: 0 10px;">Privacy</a>
            </div>
            <div>Nairobi</div>
        </div>
    </div>
</body>
</html>`,
    };
  }

  // Default/generic email
  return {
    subject: "SokoniArena - Action Required",
    html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SokoniArena</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f7f9f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: #0a7e3a;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .action-button {
            display: inline-block;
            background: #0da34d;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
        }
        .footer {
            background: #f8fbf9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">SA</div>
            <div style="font-size: 18px; margin: 5px 0;">SokoniArena</div>
        </div>
        
        <div class="content">
            <p>${greeting},</p>
            
            <p>Please click the button below to continue:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${confirmUrl}" class="action-button">Continue</a>
            </div>
            
            <p>Sincerely,<br>
            SokoniArena</p>
        </div>
        
        <div class="footer">
            <div>&copy; 2026 SokoniArena</div>
        </div>
    </div>
</body>
</html>`,
  };
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verify the webhook signature
    const wh = new Webhook(hookSecret);
    const { user, email_data } = wh.verify(payload, headers) as EmailPayload;

    console.log("Processing email for:", user.email);
    console.log("Action type:", email_data.email_action_type);

    // Build the confirmation URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    // Get the appropriate email template
    const { subject, html } = getEmailTemplate(
      email_data.email_action_type,
      confirmUrl,
      user.user_metadata?.full_name
    );

    // Send email via Brevo API
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "SokoniArena",
          email: "confirmation@sokoniarena.co.ke",
        },
        to: [{ email: user.email }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${errorData}`);
    }

    const result = await brevoResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
