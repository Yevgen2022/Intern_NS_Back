// modules/articalParser/schema/artical.parser.schema.ts
export const parseArticleBody = {
    type: "object",
    required: ["url"],
    properties: {
        // Дозволяємо будь-який http/https без пробілів
        url: {
            type: "string",
            minLength: 8,
            maxLength: 4096,
            pattern: "^https?:\\/\\/\\S+$",
        },
        // опціонально, для дев-режиму
        force: { type: "boolean", default: false },
    },
    additionalProperties: false,
} as const;

export const parseArticleResponse = {
    type: "object",
    properties: {
        sourceUrl: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
        title: { type: "string" },
        author: { type: ["string", "null"] },
        publishedAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
        content: { type: "string" },
        images: {
            type: "array",
            items: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
            uniqueItems: true,
        },
        links: {
            type: "array",
            items: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
            uniqueItems: true,
        },
    },
    required: ["sourceUrl", "title", "content"],
    additionalProperties: false,
} as const;
