import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_TO = process.env.MAIL_TO!;
const MAIL_FROM = process.env.MAIL_FROM || "Portfolio <onboarding@resend.dev>";
const SUBJECT_PREFIX = "[Macbook_Clone - Portpolio] ";

// Daily mail limit configuration
const DAILY_MAIL_LIMIT = parseInt(process.env.DAILY_MAIL_LIMIT || "10");

console.log("Daily mail limit config:", { DAILY_MAIL_LIMIT });

// In-memory store for daily limits (in production, use Redis or similar)
const dailyLimitStore = new Map<string, { count: number; date: string }>();

function toText(subject: string, message: string, from?: string, meta?: {
  ip?: string;
  ua?: string;
  page?: string;
}) {
  return [
    `New message — ${subject}`,
    "",
    from ? `Reply-to: ${from}` : "",
    "",
    message,
    "",
    "Meta:",
    meta?.ip ? `- IP: ${meta.ip}` : "",
    meta?.ua ? `- User-Agent: ${meta.ua}` : "",
    meta?.page ? `- From page: ${meta.page}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function toHtml(subject: string, message: string, from?: string, meta?: {
  ip?: string;
  ua?: string;
  page?: string;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#ffffff;color:#374151;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;padding:24px">
      <tr>
        <td>
          <h1 style="margin:0 0 16px;font-size:20px;line-height:1.2;color:#111827;">New message</h1>
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">${
            new Date().toLocaleString()
          }</p>
          ${
            from
              ? `<p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>Reply-to:</strong> <a style="color:#3b82f6" href="mailto:${from}">${from}</a></p>`
              : ""
          }
          <div style="border:1px solid #d1d5db;border-radius:8px;padding:16px;background:#f9fafb;white-space:pre-wrap">${escapeHtml(
            message
          )}</div>

          <h2 style="margin:24px 0 8px;font-size:16px;color:#111827">Meta</h2>
          <ul style="margin:0;padding-left:18px;color:#6b7280;font-size:13px">
            ${
              meta?.ip ? `<li><strong>IP:</strong> ${escapeHtml(meta.ip)}</li>` : ""
            }
            ${
              meta?.ua ? `<li><strong>User-Agent:</strong> ${escapeHtml(meta.ua)}</li>` : ""
            }
            ${
              meta?.page ? `<li><strong>From page:</strong> <a style="color:#3b82f6" href="${meta.page}">${escapeHtml(meta.page)}</a></li>` : ""
            }
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const { fromEmail, subject, message } = (await req.json()) as {
      fromEmail?: string;
      subject?: string;
      message?: string;
    };

    // Daily limit check
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      (req as any).ip ||
      "unknown";
    
    const today = new Date().toDateString();
    const userKey = ip;
    const userLimit = dailyLimitStore.get(userKey);
    
    if (userLimit && userLimit.date === today) {
      if (userLimit.count >= DAILY_MAIL_LIMIT) {
        return NextResponse.json(
          { 
            message: `Daily limit exceeded! Please try again tomorrow.`, 
            code: 429,
            limit: DAILY_MAIL_LIMIT,
            remaining: 0
          },
          { status: 429 }
        );
      }
      userLimit.count++;
    } else {
      dailyLimitStore.set(userKey, {
        count: 1,
        date: today
      });
    }

    // basic validation
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { message: "Subject is required.", code: 400 },
        { status: 400 }
      );
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { message: "Message is too short.", code: 400 },
        { status: 400 }
      );
    }
    if (
      fromEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail.trim())
    ) {
      return NextResponse.json(
        { message: "Invalid reply email.", code: 400 },
        { status: 400 }
      );
    }

    // meta (not shown in the form)
    const ua = req.headers.get("user-agent") || "unknown";
    const page = req.headers.get("referer") || undefined;

    const fullSubject = SUBJECT_PREFIX + subject.trim();

    const result = await resend.emails.send({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: fromEmail ? [fromEmail] : undefined,
      subject: fullSubject,
      text: toText(subject.trim(), message.trim(), fromEmail, { ip, ua, page }),
      html: toHtml(subject.trim(), message.trim(), fromEmail, { ip, ua, page }),
      headers: {
        // small deliverability nudge; real fix is verifying your domain
        "X-Entity-Ref-ID": String(Date.now()),
      },
    });

    if (result.error) {
      const status = (result as any)?.statusCode;
      if (status === 429) {
        return NextResponse.json(
          {
            message:
              "Too many messages for now. Please wait a minute and try again.",
            code: 429,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          message: "Failed to send email.",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // network / unexpected
    return NextResponse.json(
      { message: "Unexpected server error.", details: err?.message },
      { status: 500 }
    );
  }
}
