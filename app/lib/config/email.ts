import nodemailer from 'nodemailer';

// Kept for admin notification emails (e.g. future "new lead" alerts).
export function createNotifyTransporter() {
  const user = process.env.NOTIFY_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.NOTIFY_SMTP_PASSWORD || process.env.SMTP_PASSWORD;
  const host = process.env.NOTIFY_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.NOTIFY_SMTP_PORT || process.env.SMTP_PORT || '587');
  const secure = (process.env.NOTIFY_SMTP_SECURE || process.env.SMTP_SECURE) === 'true';
  return nodemailer.createTransport({ host, port, secure, auth: { user: user!, pass: pass! } });
}

// Auth transporter (OTP / password-reset emails)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASSWORD!,
  },
});

export async function sendOTP(email: string, otp: string) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            throw new Error(
                "SMTP_USER and SMTP_PASSWORD are required in environment variables"
            );
        }

        await transporter.verify();

        // Defensive escaping for anything interpolated into HTML
        const esc = (s: string) =>
            String(s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");

        const safeOtp = esc(otp);
        const safeEmail = esc(email);

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: "Your Global Elite CMS password reset code",
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark light">
    <meta name="supported-color-schemes" content="dark light">
    <title>Password Reset Code</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#f1f5f9;">

    <!-- Preheader (inbox preview line) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
        Your Global Elite CMS verification code is ${safeOtp}. It expires in 10 minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1220;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

                    <!-- Brand strip -->
                    <tr>
                        <td style="padding:0 6px 18px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="font-size:13px;font-weight:700;color:#cbd5e1;letter-spacing:0.02em;">
                                        <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;margin-right:8px;"></span>Global Elite CMS
                                    </td>
                                    <td align="right" style="font-size:11px;color:#64748b;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Security</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                        <td style="background:#111c30;border-radius:14px;overflow:hidden;border:1px solid #1f2a44;">

                            <!-- Gradient accent -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr><td style="background:linear-gradient(135deg,#3b82f6 0%,#6366f1 50%,#8b5cf6 100%);height:4px;line-height:0;font-size:0;">&nbsp;</td></tr>
                            </table>

                            <!-- Header -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 4px;">
                                        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#818cf8;">Password reset</p>
                                        <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#f8fafc;">Verify your identity</h1>
                                        <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">We received a request to reset the password for your Global Elite CMS account. Use the one-time code below to continue. If this wasn't you, you can safely ignore this email.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- OTP Display -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:24px 36px 8px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1220;border:1px solid #1f2a44;border-radius:10px;">
                                            <tr>
                                                <td style="padding:28px 24px;text-align:center;">
                                                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Verification code</p>
                                                    <p style="margin:0;font-size:38px;font-weight:700;color:#a5b4fc;letter-spacing:10px;font-family:'SF Mono','Menlo','Courier New',Consolas,monospace;line-height:1.1;">${safeOtp}</p>
                                                    <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Expires in 10 minutes</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security note -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:16px 36px 8px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.22);border-radius:8px;">
                                            <tr>
                                                <td style="padding:14px 16px;">
                                                    <p style="margin:0;font-size:13px;color:#fcd34d;line-height:1.55;">
                                                        <strong style="color:#fde68a;">Don't share this code.</strong> <span style="color:#fbbf24;">Global Elite staff will never ask for your verification code. If you didn't request a reset, your password will remain unchanged.</span>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Sent to -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:20px 36px 32px;">
                                        <p style="margin:0;padding:16px 0 0;border-top:1px solid #1f2a44;font-size:12px;color:#64748b;line-height:1.5;">
                                            This code was sent to <span style="color:#cbd5e1;font-weight:600;">${safeEmail}</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 6px 0;text-align:center;">
                            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#cbd5e1;letter-spacing:0.02em;">GLOBAL ELITE TECHNOLOGIES (OPC) PRIVATE LIMITED</p>
                            <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;">
                                Automated security message · Please do not reply to this email
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully! Message ID:", info.messageId);
        return info;
    } catch (error: any) {
        console.error("Nodemailer Error Details:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            stack: error.stack,
        });
        throw error;
    }
}