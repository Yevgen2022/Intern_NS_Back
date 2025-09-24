// src/helpers/normalizeHttpUrl.ts
export type UrlCheck =
    | { ok: true; url: string }
    | {
    ok: false;
    reason:
        | "not_a_string"
        | "truncated_ellipsis"
        | "invalid_url"
        | "not_http_https";
    original?: string;
};


  // Normalizes http(s) URL:
  //  removes zero-width characters, \r\n\t
  //  blocks truncated links with the symbol … or "..." at the end
  //  encodes spaces as %20
  //  converts relative links to absolute links relative to base (for RSS)
  //  only allows http/https

export function normalizeHttpUrl(raw: unknown, base?: string): UrlCheck {
    if (typeof raw !== "string") return { ok: false, reason: "not_a_string" };

    let s = raw
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
        .replace(/[\r\n\t]+/g, " "); // перенос/таби → пробіл

    // Обрізані лінки: U+2026 або "..." наприкінці
    if (s.includes("…") || /\.\.\.$/.test(s)) {
        return { ok: false, reason: "truncated_ellipsis", original: s };
    }

    // Пробіли всередині → %20
    if (/\s/.test(s)) s = s.replace(/\s+/g, "%20");

    try {
        const u = base ? new URL(s, base) : new URL(s);
        if (!/^https?:$/.test(u.protocol)) {
            return { ok: false, reason: "not_http_https", original: s };
        }
        return { ok: true, url: u.toString() };
    } catch {
        return { ok: false, reason: "invalid_url", original: s };
    }
}
