import { NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const { name, email, title, description } = await request.json();

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
