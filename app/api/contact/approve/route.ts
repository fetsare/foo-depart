import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = rawJwtSecret;

const rawAdminEmail = process.env.ADMIN_EMAIL;
if (!rawAdminEmail) {
  throw new Error("ADMIN_EMAIL environment variable is not set");
}
const ADMIN_EMAIL = rawAdminEmail;

const rawGithubOwner = process.env.GITHUB_OWNER;
if (!rawGithubOwner) {
  throw new Error("GITHUB_OWNER environment variable is not set");
}
const GITHUB_OWNER = rawGithubOwner;

const rawGithubRepo = process.env.GITHUB_REPO;
if (!rawGithubRepo) {
  throw new Error("GITHUB_REPO environment variable is not set");
}
const GITHUB_REPO = rawGithubRepo;

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

    let inquiryData: InquiryToken;
    try {
      inquiryData = jwt.verify(token, JWT_SECRET) as InquiryToken;
    } catch (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Token</title>
          </head>
          <body>
            <h1>Invalid or Expired Token</h1>
            <p>This approval link is invalid or has expired. Approval links are valid for 4 months.</p>
            <p>If you need to approve this inquiry, please ask the submitter to resubmit.</p>
          </body>
        </html>
        `,
        {
          status: 401,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const { name, email, title, description } = inquiryData;

    // Create GitHub issue
    const issue = await octokit.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: title,
      body: `
**Submitted by:** ${name}

**Description:**
${description}

---
*This issue was automatically created from an approved inquiry*
      `,
      labels: ["inquiry", "needs-review"],
    });

    const branchName = `inquiry/${issue.data.number}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 50)}`;

    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: "heads/main",
    });

    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });

    await resend.emails.send({
      from: ADMIN_EMAIL,
      to: [email],
      bcc: [ADMIN_EMAIL],
      subject: "Your inquiry has been approved!",
      text: `
Your inquiry was approved

Hi ${name},

Your inquiry "${title}" has been approved and a GitHub issue has been created to track its progress.

GitHub Issue: ${issue.data.html_url}

Best regards,
Ugla
      `,
    });

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inquiry Approved</title>
        </head>
        <body>
          <h1>Inquiry Approved!</h1>
          <p>The GitHub issue and branch have been created successfully.</p>
          
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Issue:</strong> #${issue.data.number}</p>
          <p><strong>Branch:</strong> ${branchName}</p>

          <p><a href="${issue.data.html_url}" target="_blank">View GitHub Issue</a></p>
          
          <p>The submitter has been notified via email.</p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Error approving inquiry:", error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>Failed to approve inquiry. Please try again or contact support.</p>
          <p>Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
