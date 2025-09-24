// // src/modules/feed/schemas/getFeedData.schema.ts
//
// export const schema = {
// 	tags: ["feed"],
// 	summary: "Get feed data",
//
// 	// query parameter typing
// 	querystring: {
// 		type: "object",
// 		properties: {
// 			url: { type: "string", format: "uri" }, // opt
// 			force: { type: "string", enum: ["1"] }, // only '1', opt
// 		},
// 		additionalProperties: false,
// 	} as const,
//
// 	response: {
// 		200: {
// 			type: "object",
// 			required: ["sourceUrl", "items"],
// 			properties: {
// 				sourceUrl: { type: "string" },
// 				items: {
// 					type: "array",
// 					items: {
// 						type: "object",
// 						properties: {
// 							title: { type: ["string", "null"] },
// 							link: { type: ["string", "null"] },
// 							isoDate: { type: ["string", "null"] },
// 							pubDate: { type: ["string", "null"] },
// 							description: { type: ["string", "null"] },
// 						},
// 						additionalProperties: false,
// 					},
// 				},
// 			},
// 			additionalProperties: false,
// 		},
// 	},
// } as const;

// src/modules/feed/schemas/getFeedData.schema.ts

// export const schema = {
//     tags: ["feed"],
//     summary: "Get feed data",
//
//     // query parameter typing
//     querystring: {
//         type: "object",
//         properties: {
//             // NEW: замінили строгий format: "uri" на простий патерн http/https без пробілів
//             url: { type: "string", pattern: "^https?:\\/\\/\\S+$" }, // opt
//             force: { type: "string", enum: ["1"] }, // only '1', opt (залишаємо як у тебе)
//         },
//         additionalProperties: false,
//     } as const,
//
//     response: {
//         200: {
//             type: "object",
//             required: ["sourceUrl", "items"],
//             properties: {
//                 // NEW: гарантуємо, що повертаємо саме http/https
//                 sourceUrl: { type: "string", pattern: "^https?:\\/\\/\\S+$" }, // NEW
//                 items: {
//                     type: "array",
//                     items: {
//                         type: "object",
//                         // NEW: після нормалізації link завжди є → робимо його обов'язковим
//                         required: ["link"], // NEW
//                         properties: {
//                             title: { type: ["string", "null"] },
//                             // NEW: посилання тільки http/https, без пробілів
//                             link: { type: "string", pattern: "^https?:\\/\\/\\S+$" }, // NEW
//                             isoDate: { type: ["string", "null"] },
//                             pubDate: { type: ["string", "null"] },
//                             description: { type: ["string", "null"] },
//                         },
//                         additionalProperties: false,
//                     },
//                 },
//             },
//             additionalProperties: false,
//         },
//     },
// } as const;
export const schema = {
    tags: ["feed"],
    summary: "Get feed data",
    querystring: {
        type: "object",
        properties: {
            url: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
            force: { type: "string", enum: ["1"] },
        },
        additionalProperties: false,
    } as const,
    response: {
        200: {
            type: "object",
            required: ["sourceUrl", "items"],
            properties: {
                sourceUrl: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["link"],
                        properties: {
                            title: { type: ["string", "null"] },
                            link: { type: "string", pattern: "^https?:\\/\\/\\S+$" },
                            isoDate: { type: ["string", "null"] },
                            pubDate: { type: ["string", "null"] },
                            description: { type: ["string", "null"] },
                        },
                        additionalProperties: false,
                    },
                },
            },
            additionalProperties: false,
        },
        400: {
            type: "object",
            properties: {
                message: { type: "string" }
            }
        },
        500: {
            type: "object",
            properties: {
                message: { type: "string" }
            }
        },
        502: {
            type: "object",
            properties: {
                message: { type: "string" }
            }
        }
    },
} as const;