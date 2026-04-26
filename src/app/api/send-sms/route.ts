// SMS API — Supports Fast2SMS AND Twilio
// Fast2SMS: needs ₹100 recharge for bulk route
// Twilio: free trial works immediately — https://twilio.com
// Set ONE of these in .env.local:
//   FAST2SMS_API_KEY=...  (fast2sms.com — needs ₹100 recharge)
//   TWILIO_SID=...  TWILIO_TOKEN=...  TWILIO_FROM=+1XXXXXXXXXX  (twilio.com — free trial)

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numbers, message } = body as { numbers: string; message: string };

    if (!numbers || !message) {
      return NextResponse.json({ error: "Missing numbers or message" }, { status: 400 });
    }

    console.log("[SMS] To:", numbers);
    console.log("[SMS] Message:", message.slice(0, 80));

    // ── Option 1: Twilio (free trial, works immediately) ──
    const twilioSid = process.env.TWILIO_SID;
    const twilioToken = process.env.TWILIO_TOKEN;
    const twilioFrom = process.env.TWILIO_FROM;

    if (twilioSid && twilioToken && twilioFrom) {
      console.log("[SMS] Using Twilio");
      const toNumber = numbers.startsWith("+") ? numbers : `+91${numbers}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: twilioFrom,
            To: toNumber,
            Body: message,
          }),
        }
      );
      const result = await res.json();
      console.log("[Twilio] Response:", result.sid ?? result);
      if (result.sid) return NextResponse.json({ success: true, provider: "twilio", sid: result.sid });
      return NextResponse.json({ success: false, provider: "twilio", error: result.message, raw: result });
    }

    // ── Option 2: Fast2SMS (needs ₹100 recharge for bulk route) ──
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && fast2smsKey !== "your_api_key_here") {
      console.log("[SMS] Using Fast2SMS");
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        body: JSON.stringify({ route: "q", numbers, message, flash: 0 }),
      });
      const result = await res.json();
      console.log("[Fast2SMS] Response:", JSON.stringify(result));
      if (result.return === true) return NextResponse.json({ success: true, provider: "fast2sms", result });
      return NextResponse.json({
        success: false,
        provider: "fast2sms",
        error: result.message,
        hint: result.status_code === 999
          ? "Fast2SMS needs ₹100 recharge. Add TWILIO_SID + TWILIO_TOKEN + TWILIO_FROM to .env.local for free SMS."
          : undefined,
      });
    }

    // ── Demo mode ──
    console.log("[SMS DEMO] No provider configured — message logged only");
    return NextResponse.json({ success: true, demo: true, to: numbers, message });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SMS Error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
