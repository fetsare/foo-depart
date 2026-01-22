export const RESROBOT_API_BASE_URL =
  process.env.RESROBOT_API_BASE_URL ||
  "https://api.resrobot.se/v2.1/departureBoard";

export const RESROBOT_ACCESS_ID = process.env.RESROBOT_ACCESS_ID || "";

export const API_DURATION = parseInt(process.env.API_DURATION || "120", 10);

export const DEFAULT_MIN_TIME_THRESHOLD = parseInt(
  process.env.NEXT_PUBLIC_DEFAULT_MIN_TIME_THRESHOLD || "7",
  10
);

export const MAX_DEPARTURES_TO_DISPLAY = parseInt(
  process.env.NEXT_PUBLIC_MAX_DEPARTURES_TO_DISPLAY || "10",
  10
);

export const DRÄGG_START_HOUR = parseInt(
  process.env.NEXT_PUBLIC_EARLY_MORNING_START_HOUR || "0",
  10
);

export const DRÄGG_END_HOUR = parseInt(
  process.env.NEXT_PUBLIC_EARLY_MORNING_END_HOUR || "3",
  10
);

export const validateConfig = () => {
  // required env variables
  if (!RESROBOT_ACCESS_ID) {
    throw new Error(
      "RESROBOT_ACCESS_ID is required. Please set it in your environment variables."
    );
  }
};
