/**
 * Resend Email Service for Nexora Institutional OS
 */

export interface PasswordResetEmailParams {
  to: string;
  userName?: string;
  resetLink: string;
  expiresInMinutes?: number;
}

export async function sendPasswordResetEmail({
  to,
  userName = "Administrator",
  resetLink,
  expiresInMinutes = 15,
}: PasswordResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || "NEXORA <onboarding@resend.dev>";
  // If a public consumer email is configured as sender, fallback to onboarding@resend.dev to avoid Resend 403 rejection
  if (fromEmail.includes("@gmail.com") || fromEmail.includes("@yahoo.com") || fromEmail.includes("@hotmail.com")) {
    fromEmail = "NEXORA <onboarding@resend.dev>";
  }

  const emailSubject = "Reset your NEXORA Institutional Password";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your NEXORA Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAF8F5;
      color: #211A24;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E8E1E8;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 1px solid #E8E1E8;
      padding-bottom: 20px;
    }
    .logo-box {
      width: 36px;
      height: 36px;
      background-color: #56356B;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 14px;
      border-radius: 8px;
      text-align: center;
      line-height: 36px;
      display: inline-block;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      color: #211A24;
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
      letter-spacing: -0.02em;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #211A24;
      margin: 0 0 12px 0;
      line-height: 1.25;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #68616D;
      margin: 0 0 20px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #56356B;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .footer-note {
      font-size: 12px;
      color: #8E8693;
      border-top: 1px solid #E8E1E8;
      padding-top: 20px;
      margin-top: 30px;
    }
    .link-alt {
      word-break: break-all;
      font-size: 11px;
      color: #56356B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="logo-box">NX</div>
      <span class="brand-title">NEXORA Institutional OS</span>
    </div>

    <h1>Password Recovery</h1>
    
    <p>Hello ${userName},</p>
    <p>We received a request to reset the password for your Nexora institutional account (<strong>${to}</strong>).</p>
    <p>Click the button below to securely choose a new master password. This link is valid for ${expiresInMinutes} minutes.</p>

    <div class="btn-container">
      <a href="${resetLink}" class="btn">Reset Password →</a>
    </div>

    <p style="font-size: 13px;">If the button does not work, copy and paste this link into your browser:</p>
    <p class="link-alt">${resetLink}</p>

    <div class="footer-note">
      <p style="margin: 0 0 8px 0;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <p style="margin: 0; font-size: 11px; color: #A1A1AA;">© ${new Date().getFullYear()} NEXORA Enterprise Institutional OS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  if (!apiKey) {
    return {
      success: true,
      id: `mock-email-${Date.now()}`,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: emailSubject,
        html: htmlContent,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[Resend API Error]:", data.message || "Failed to deliver email");
      return {
        success: false,
        error: data.message || "Failed to deliver email via Resend API",
      };
    }

    console.log(`[Resend] Successfully delivered password reset email to: ${to} (ID: ${data.id})`);

    return {
      success: true,
      id: data.id,
    };
  } catch (err: any) {
    console.error("[Resend Exception]:", err.message || err);
    return {
      success: false,
      error: err.message || "Unexpected network error connecting to Resend",
    };
  }
}
