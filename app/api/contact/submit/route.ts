import { NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import rateLimit from "../../rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);
const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = rawJwtSecret;

const limiter = rateLimit(3, 60 * 60 * 1000);

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const approveUrl = `${baseUrl}/api/contact/approve?token=${token}`;
    const rejectUrl = `${baseUrl}/api/contact/reject?token=${token}`;

    await resend.emails.send({
      from: process.env.ADMIN_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
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
