export const getAdjustedStockholmTime = (): Date => {
  const nowInSweden = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
  );
  
  const currentHour = nowInSweden.getHours();
  
  if (currentHour >= 0 && currentHour <= 3) {
    const minutesToSubtract = currentHour + 1;
    const adjustedTime = new Date(nowInSweden.getTime() - minutesToSubtract * 60 * 1000);
    return adjustedTime;
  }
  
  return nowInSweden;
};

export const formatTimeDifference = (departureTime: string): number | string => {
  // Get adjusted time in Swedish timezone
  const nowInSweden = getAdjustedStockholmTime();
  
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
