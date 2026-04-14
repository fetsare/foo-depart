import { fetchContributors } from "@/lib/actions";
import Image from "next/image";
import ovvenamn from "@/lib/contributor_names.json";
import { GITHUB_REPO_URL, GITHUB_BADGE_REPO } from "@/lib/constants";

export default async function Contributors() {
  const contributors = await fetchContributors();
  const hasRepo = Boolean(GITHUB_REPO_URL);
  const hasBadgeRepo = Boolean(GITHUB_BADGE_REPO);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black py-1 px-4 z-40">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.login}
              className="text-xs sm:text-sm text-gray-400"
            >
              {ovvenamn[contributor.login as keyof typeof ovvenamn] ||
                contributor.login}
              {index !== contributors.length - 1 && ","}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {hasRepo && (
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/github-icon.svg"
                alt="GitHub repository"
                width={16}
                height={16}
              />
            </a>
          )}
          {hasBadgeRepo && (
            <img
              src={`https://img.shields.io/github/last-commit/${GITHUB_BADGE_REPO}`}
              alt="GitHub last commit"
              className="h-4"
            />
          )}
          {hasBadgeRepo && (
            <img
              src={`https://img.shields.io/github/license/${GITHUB_BADGE_REPO}`}
              alt="GitHub license"
              className="h-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}
