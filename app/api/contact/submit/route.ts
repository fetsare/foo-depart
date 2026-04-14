import { NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import rateLimit from "../../rateLimit";
import {
  ADMIN_EMAIL,
  JWT_SECRET,
  PUBLIC_BASE_URL,
  RESEND_API_KEY,
} from "@/lib/constants";

const resend = new Resend(RESEND_API_KEY);
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
if (!ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is not set");
}

const limiter = rateLimit(2, 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const { limited } = limiter(request);
    if (limited) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, title, description, website } = await request.json();
    
    if (website) {
      console.log("Bot detected via honeypot");
      return NextResponse.json({ success: true });
    }

    const token = jwt.sign(
      {
        name,
        email,
        title,
        description,
        timestamp: Date.now(),
      },
      JWT_SECRET,
      {
        expiresIn: "120d",
      }
    );

    const approveUrl = `${PUBLIC_BASE_URL}/api/contact/approve?token=${encodeURIComponent(token)}`;
    const rejectUrl = `${PUBLIC_BASE_URL}/api/contact/reject?token=${encodeURIComponent(token)}`;

    await resend.emails.send({
      from: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Inquiry: ${title}`,
      text: `
New Inquiry Received

Title: ${title}

Description:
${description}

Submitted by: ${name} (${email})

Approve & Create Issue: ${approveUrl}

Reject: ${rejectUrl}

Click "Approve" to automatically create a GitHub issue and branch for this inquiry.
This link will expire in 4 months.
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
