// IP hashing + rate limiting for the feedback endpoint (brief §9.3/§9.4).
// The raw IP is NEVER stored or logged — only a salted hash, for abuse
// forensics (§9.6.3).

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Fixed-window KV counter: max N submissions per IP-hash per hour (§9.4).
// Returns true if the request is within the limit (and records it).
export async function withinRateLimit(
  kv: KVNamespace,
  ipHash: string,
  limit = 5
): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 3_600_000); // hourly window
  const key = `rl:feedback:${ipHash}:${bucket}`;
  const current = Number((await kv.get(key)) ?? 0);
  if (current >= limit) return false;
  // TTL a little over the hour so the counter self-expires.
  await kv.put(key, String(current + 1), { expirationTtl: 3700 });
  return true;
}
