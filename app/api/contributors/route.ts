import { GITHUB_OWNER, GITHUB_REPO } from "@/lib/constants";

interface GitHubContributorResponseItem {
  type?: string;
}

export async function GET() {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    return Response.json([]);
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    },
  );

  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch contributors" },
      { status: response.status },
    );
  }

  const contributors =
    (await response.json()) as GitHubContributorResponseItem[];
  return Response.json(
    contributors.filter((contributor) => contributor.type !== "Bot"),
  ); // this removed vercel and copilot bots
}
