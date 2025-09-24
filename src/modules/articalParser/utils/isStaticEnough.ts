export function isStaticEnough(html: string) {
	const problems: string[] = [];
	const htmlLower = html.toLowerCase();

	// Check if it's a single page application
	const spaKeywords = [
		'id="__next"',
		'id="root"',
		'id="app"',
		"data-reactroot",
		"window.__nuxt__",
		"__NUXT__",
		"astro-island",
		"sveltekit",
		"webpackchunk",
		"/@vite/client",
		"vite/client",
	];

	for (const keyword of spaKeywords) {
		if (htmlLower.includes(keyword.toLowerCase())) {
			problems.push("Dynamic website detected");
			break;
		}
	}

	// Count script tags
	const scriptMatches = htmlLower.match(/<script\b[^>]*>/g);
	const scriptCount = scriptMatches?.length ?? 0;
	if (scriptCount > 40) {
		problems.push(`Too many scripts found: ${scriptCount}`);
	}

	// Check how much JavaScript code vs HTML
	const totalSize = html.length;
	let scriptCodeSize = 0;

	const scriptBlocks =
		html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
	for (const block of scriptBlocks) {
		const code = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(block)?.[1];
		if (code) {
			scriptCodeSize += code.length;
		}
	}

	const scriptPercentage =
		totalSize > 0 ? (scriptCodeSize / totalSize) * 100 : 0;
	if (scriptPercentage > 35) {
		problems.push(`Too much JavaScript: ${Math.round(scriptPercentage)}%`);
	}

	// Look for big JSON data
	const jsonScripts =
		html.match(
			/<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi,
		) ?? [];
	for (const jsonScript of jsonScripts) {
		const json =
			/<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i.exec(
				jsonScript,
			)?.[1];
		if (json && json.length > 50_000) {
			problems.push("Large JSON data found in scripts");
			break;
		}
	}

	// Check if there's enough actual text content
	const textContent = html
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();

	const textLength = textContent.length;
	if (textLength < 600) {
		problems.push(`Not enough text content: ${textLength} characters`);
	}

	// Check for JavaScript required message
	if (htmlLower.includes("please enable javascript")) {
		problems.push("Page requires JavaScript to work");
	}

	const isStatic = problems.length === 0;
	return {
		ok: isStatic,
		reasons: problems,
		score: isStatic ? 1 : 0,
	};
}
