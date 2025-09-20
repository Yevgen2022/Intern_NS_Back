// export const schema = {
// 	tags: ["feed"],
// 	summary: "Get feed data",
// 	description: "Get feed data",
// 	response: {
// 		200: {
// 			type: "object",
// 			properties: {
// 				hello: {
// 					type: "string",
// 				},
// 			},
// 		},
// 	},
// } as const;
export const schema = {
	tags: ["feed"],
	summary: "Get feed data",
	description: "Get feed data",
	response: {
		200: {
			type: "object",
			properties: {
				message: { type: "string" },
				url: { type: "string" },
				force: { type: ["string", "number", "boolean"] },
			},
			required: ["message", "url"],
		},
	},
} as const;
