// // src/helpers/normalizeHttpUrl.ts
// export type UrlCheck =
//     | { ok: true; url: string }
//     | {
//     ok: false;
//     reason:
//         | "not_a_string"
//         | "truncated_ellipsis"
//         | "invalid_url"
//         | "not_http_https";
//     original?: string;
// };
//
//
//   // Normalizes http(s) URL:
//   //  removes zero-width characters, \r\n\t
//   //  blocks truncated links with the symbol … or "..." at the end
//   //  encodes spaces as %20
//   //  converts relative links to absolute links relative to base (for RSS)
//   //  only allows http/https
//
// export function normalizeHttpUrl(raw: unknown, base?: string): UrlCheck {
//     if (typeof raw !== "string") return { ok: false, reason: "not_a_string" };
//
//     let s = raw
//         .trim()
//         .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
//         .replace(/[\r\n\t]+/g, " "); // перенос/таби → пробіл
//
//     // Обрізані лінки: U+2026 або "..." наприкінці
//     if (s.includes("…") || /\.\.\.$/.test(s)) {
//         return { ok: false, reason: "truncated_ellipsis", original: s };
//     }
//
//     // Пробіли всередині → %20
//     if (/\s/.test(s)) s = s.replace(/\s+/g, "%20");
//
//     try {
//         const u = base ? new URL(s, base) : new URL(s);
//         if (!/^https?:$/.test(u.protocol)) {
//             return { ok: false, reason: "not_http_https", original: s };
//         }
//         return { ok: true, url: u.toString() };
//     } catch {
//         return { ok: false, reason: "invalid_url", original: s };
//     }
// }


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

// Normalizes http(s) URL
export function normalizeHttpUrl(raw: unknown, base?: string): UrlCheck {
    if (typeof raw !== "string") return { ok: false, reason: "not_a_string" };

    let s = raw
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
        .replace(/[\r\n\t]+/g, " "); // перенос/таби → пробіл

    // Перевіряємо чи не пустий рядок після очищення
    if (!s) return { ok: false, reason: "invalid_url", original: raw };

    // ВИПРАВЛЕННЯ: Обрізані лінки - перевіряємо різні варіанти
    // U+2026 (…), "..." в кінці, або обрізання в середині URL
    if (s.includes("…") || /\.\.\.$/.test(s) || /\.{3,}/.test(s)) {
        return { ok: false, reason: "truncated_ellipsis", original: s };
    }

    // ДОДАТКОВО: Перевіряємо на типові ознаки обрізаного URL
    // Якщо URL закінчується параметром без значення або з підозрілими символами
    if (/[&?][a-zA-Z_]+=?$/.test(s) || s.endsWith('&') || s.endsWith('=')) {
        return { ok: false, reason: "truncated_ellipsis", original: s };
    }

    // ВИПРАВЛЕННЯ: Кодуємо пробіли ТІЛЬКИ після перевірки на valid URL
    // Спочатку перевіряємо чи це взагалі схоже на URL
    try {
        // Пробуємо створити URL БЕЗ заміни пробілів
        const testUrl = base ? new URL(s, base) : new URL(s);

        // Якщо URL валідний, тоді можемо безпечно замінювати пробіли
        if (/\s/.test(s)) {
            s = s.replace(/\s+/g, "%20");
        }

        // Створюємо фінальний URL з закодованими пробілами
        const finalUrl = base ? new URL(s, base) : new URL(s);

        if (!/^https?:$/.test(finalUrl.protocol)) {
            return { ok: false, reason: "not_http_https", original: s };
        }

        return { ok: true, url: finalUrl.toString() };
    } catch (error) {
        // Якщо не вдалося створити URL, спробуємо з кодуванням пробілів
        if (/\s/.test(s)) {
            const encoded = s.replace(/\s+/g, "%20");
            try {
                const encodedUrl = base ? new URL(encoded, base) : new URL(encoded);
                if (!/^https?:$/.test(encodedUrl.protocol)) {
                    return { ok: false, reason: "not_http_https", original: s };
                }
                return { ok: true, url: encodedUrl.toString() };
            } catch {
                return { ok: false, reason: "invalid_url", original: s };
            }
        }
        return { ok: false, reason: "invalid_url", original: s };
    }
}