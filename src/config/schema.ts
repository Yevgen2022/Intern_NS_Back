import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
	type: "object",
	properties: {
		PORT: { type: "number", default: 3500 },
		HOST: { type: "string", default: "0.0.0.0" },

		AUTH_COOKIE: { type: "string", default: "auth" },
		SESSION_TTL_SEC: { type: "number", default: 7200 }, // 2h
		COOKIE_SECURE: {
			type: "boolean",
			default: process.env.NODE_ENV === "production",
		},
		COOKIE_SAMESITE: {
			type: "string",
			enum: ["lax", "strict", "none"],
			default: "lax",
		},
		COOKIE_PATH: { type: "string", default: "/" },

		RATE_LIMIT_GLOBAL: { type: "boolean", default: false },
		// 0 will be interpreted as "unlimited" in the plugin itself
		RATE_LIMIT_MAX: { type: "number", default: 0 },
		RATE_LIMIT_TIME_WINDOW: { type: "string", default: "1 hour" },
	},
	required: ["PORT", "HOST"],
	additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
