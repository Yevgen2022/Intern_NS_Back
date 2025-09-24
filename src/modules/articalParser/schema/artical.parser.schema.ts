// modules/parse/schema.ts
export const parseArticleResponse = {
    type: "object",
    properties: {
        sourceUrl: { type: "string", format: "uri" },
        title: { type: "string" },
        author: { type: "string", nullable: true },
        publishedAt: { type: "string", format: "date-time", nullable: true },
        content: { type: "string" },
        images: {
            type: "array",
            items: { type: "string", format: "uri" },
        },
        links: {
            type: "array",
            items: { type: "string", format: "uri" },
        },
    },
    required: ["sourceUrl", "title", "content"],
} as const;

export const parseArticleBody = {
    type: "object",
    required: ["url"],
    properties: {
        url: { type: "string", format: "uri" },
    },
    additionalProperties: false,
} as const;

export const parseArticleQuery = {
    type: "object",
    properties: {
        url: { type: "string", format: "uri" },
    },
    additionalProperties: false,
} as const;
