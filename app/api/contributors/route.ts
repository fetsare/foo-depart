export async function GET() {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contributors`,
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

  const contributors = await response.json();
  return Response.json(contributors.filter((contributor: any) => contributor.type !== "Bot")); // this removed vercel and copilot bots
}
