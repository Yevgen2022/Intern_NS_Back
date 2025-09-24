// modules/articalParser/utils/isStaticEnough.ts
export function isStaticEnough(html: string) {
    const reasons: string[] = [];
    const lower = html.toLowerCase();

    // 1) Явні маркери SPA/SSR
    const spaMarkers = [
        'id="__next"', 'id="root"', 'id="app"', 'data-reactroot',
        'window.__nuxt__', '__NUXT__', 'astro-island', 'sveltekit',
        'webpackchunk', '/@vite/client', 'vite/client',
    ];
    if (spaMarkers.some(m => lower.includes(m.toLowerCase()))) {
        reasons.push("SPA/SSR marker detected");
    }

    // 2) Багато скриптів або “важкі” скрипти
    const scriptTags = lower.match(/<script\b[^>]*>/g) || [];
    const scriptCount = scriptTags.length;
    if (scriptCount > 40) reasons.push(`Too many scripts: ${scriptCount}`);

    const totalBytes = html.length;
    const scriptBlocks = Array.from(html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi));
    const scriptBytes = scriptBlocks.reduce((acc, m) => acc + (m[1]?.length ?? 0), 0);
    const scriptShare = totalBytes ? scriptBytes / totalBytes : 0;
    if (scriptShare > 0.35) reasons.push(`Script share too high: ${(scriptShare*100).toFixed(0)}%`);

    // 3) Важкі JSON-дампи
    const bigJsonDump = Array.from(html.matchAll(/<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi))
        .some(m => (m[1]?.length ?? 0) > 50_000);
    if (bigJsonDump) reasons.push("Big JSON dump in script tags");

    // 4) Перевірка на наявність реального тексту
    const mainTextChars =
        (lower.match(/<(main|article)\b[\s\S]*?<\/\1>/)?.[0] || html)
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim().length;

    if (mainTextChars < 600) reasons.push(`Too little main text: ${mainTextChars} chars`);

    // 5) Повідомлення про вимкнений JS
    if (lower.includes("please enable javascript")) reasons.push("Message: please enable JavaScript");

    // Проста оцінка: якщо є хоч одна “погана” причина — вважаємо не статичним
    const ok = reasons.length === 0;
    return { ok, reasons, score: ok ? 1 : 0 };
}
