/**
 * Safe, RFC 6265 compliant session cookie encoder and decoder.
 * Uses Base64 encoding to guarantee cookies contain strictly valid cookie octets
 * (alphanumerics, +, /, =), preventing browsers from discarding cookies containing
 * quotes, braces, commas, or spaces.
 */

export function encodeSessionCookie(user: any): string {
  if (!user) return "";
  try {
    const json = JSON.stringify(user);
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      ));
    }
    return Buffer.from(json, "utf-8").toString("base64");
  } catch (err) {
    console.error("[COOKIE ENCODE ERROR]", err);
    return "";
  }
}

export function decodeSessionCookie(val: string | undefined | null): any | null {
  if (!val) return null;

  // 1. Try Base64 decoding
  try {
    let jsonStr: string;
    if (typeof window !== "undefined") {
      jsonStr = decodeURIComponent(
        atob(val)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonStr = Buffer.from(val, "base64").toString("utf-8");
    }
    if (jsonStr.startsWith("{") && jsonStr.endsWith("}")) {
      return JSON.parse(jsonStr);
    }
  } catch {}

  // 2. Try URI decoding (percent-encoded legacy fallback)
  try {
    const decoded = decodeURIComponent(val);
    if (decoded.startsWith("{") && decoded.endsWith("}")) {
      return JSON.parse(decoded);
    }
  } catch {}

  // 3. Try direct JSON parsing fallback
  try {
    if (val.startsWith("{") && val.endsWith("}")) {
      return JSON.parse(val);
    }
  } catch {}

  return null;
}
