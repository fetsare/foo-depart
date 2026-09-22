export const TRAFIKLAB_REALTIME_API_BASE_URL =
  process.env.TRAFIKLAB_REALTIME_API_BASE_URL ||
  "https://realtime-api.trafiklab.se/v1";

export const TRAFIKLAB_REALTIME_API_KEY =
  process.env.TRAFIKLAB_REALTIME_API_KEY || "";

// 3 configured stations * (30 days * 86400s / 90s) ~= 86,400 calls/month,
// fits Trafiklab's free Bronze tier (100k/month) with margin.
export const REALTIME_CACHE_SECONDS = parseInt(
  process.env.REALTIME_CACHE_SECONDS || "90",
  10,
);

const VERCEL_BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  VERCEL_BASE_URL ||
  "http://localhost:3000";

export const GITHUB_OWNER = process.env.GITHUB_OWNER || "";

export const GITHUB_REPO = process.env.GITHUB_REPO || "";

export const GITHUB_BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || "main";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export const JWT_SECRET = process.env.JWT_SECRET || "";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
  (GITHUB_OWNER && GITHUB_REPO
    ? `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
    : "");

export const GITHUB_BADGE_REPO =
  process.env.NEXT_PUBLIC_GITHUB_BADGE_REPO ||
  (GITHUB_OWNER && GITHUB_REPO ? `${GITHUB_OWNER}/${GITHUB_REPO}` : "");

export const CONTACT_SIGNATURE_NAME =
  process.env.CONTACT_SIGNATURE_NAME || "The Team";

export const DEFAULT_MIN_TIME_THRESHOLD = parseInt(
  process.env.NEXT_PUBLIC_DEFAULT_MIN_TIME_THRESHOLD || "7",
  10,
);

export const MAX_DEPARTURES_TO_DISPLAY = parseInt(
  process.env.NEXT_PUBLIC_MAX_DEPARTURES_TO_DISPLAY || "10",
  10,
);

export const validateConfig = () => {
  // required env variables
  if (!TRAFIKLAB_REALTIME_API_KEY) {
    throw new Error(
      "TRAFIKLAB_REALTIME_API_KEY is required. Please set it in your environment variables.",
    );
  }
};
