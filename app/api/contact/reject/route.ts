import { NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import {
  ADMIN_EMAIL,
  CONTACT_SIGNATURE_NAME,
  JWT_SECRET,
  RESEND_API_KEY,
} from "@/lib/constants";

const resend = new Resend(RESEND_API_KEY);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
if (!ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is not set");
}
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

interface InquiryToken {
  name: string;
  email: string;
  title: string;
  description: string;
  timestamp: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Verify and decode the JWT token
    let inquiryData: InquiryToken;
    try {
      inquiryData = jwt.verify(token, JWT_SECRET) as InquiryToken;
    } catch {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Token</title>
          </head>
          <body>
            <h1>Invalid or Expired Token</h1>
            <p>This rejection link is invalid or has expired. Links are valid for 4 months.</p>
          </body>
        </html>
        `,
        {
          status: 401,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const { name, email, title } = inquiryData;

    await resend.emails.send({
      from: ADMIN_EMAIL,
      to: email,
      subject: "Update on your inquiry",
      text: `
Thank you for your inquiry

Hi ${name},

Thank you for submitting your inquiry "${title}". After review, we've decided not to proceed with this at this time.

We appreciate your interest and encourage you to submit future ideas!

Best regards,
${CONTACT_SIGNATURE_NAME}
      `,
    });

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inquiry Rejected</title>
        </head>
        <body>
          <h1>Inquiry Rejected</h1>
          <p>The inquiry "${title}" has been rejected.</p>
          <p>The submitter has been notified via email.</p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("Error rejecting inquiry:", error);
    return new NextResponse("Error processing rejection", { status: 500 });
  }
}
