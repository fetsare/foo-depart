export const formatTimeDifference = (departureTime: string): number | string => {
  // Get current time in Swedish timezone
  const nowInSweden = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
  );
  
  const [hours, minutes] = departureTime.split(":").map(Number);

  const departureDate = new Date(
    nowInSweden.getFullYear(),
    nowInSweden.getMonth(),
    nowInSweden.getDate(),
    hours,
    minutes
  );

  if (departureDate < nowInSweden) {
    departureDate.setDate(departureDate.getDate() + 1);
  }

  const differenceInMs = departureDate.getTime() - nowInSweden.getTime();

  if (differenceInMs < 0) {
    return "Departed";
  }

  const differenceInMin = Math.floor(differenceInMs / 1000 / 60);

  return differenceInMin;
};

export const removeParentheses = (input: string): string => {
  return input.replace(/\s*\(.*?\)/g, "");
};
