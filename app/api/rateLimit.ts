const rateLimit = (limit: number, interval: number) => {
  const requests = new Map<string, { count: number; firstRequest: number }>();

  return (request: Request): { limited: boolean; ip: string } => {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    if (!requests.has(ip)) {
      requests.set(ip, { count: 0, firstRequest: Date.now() });
    }

    const data = requests.get(ip)!;

    if (Date.now() - data.firstRequest > interval) {
      data.count = 0;
      data.firstRequest = Date.now();
    }

    data.count += 1;

    if (data.count > limit) {
      return { limited: true, ip };
    }

    requests.set(ip, data);
    return { limited: false, ip };
  };
};

export default rateLimit;
