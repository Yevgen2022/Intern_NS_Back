// src/adServer/lineItem/formHtmlResponse.schema.ts
export const formHtmlResponse = {
	$id: "LineItemFormHtmlResponse",
	type: "string",
	description: "SSR HTML form for creating an adserver line item",
	// JSON Schema 2020-12; Ajv/Fastify perceived as metadata (validation — by type:string)
	contentMediaType: "text/html",
} as const;

export const creativeForSave = {
	body: {
		type: "object",
		properties: {
			size: { type: "string" },
			cpmMin: { type: "number" },
			cpmMax: { type: "number" },
			geo: { type: "string" },
			adType: { type: "string" },
			frequency: { type: "number" },
		},
		required: ["size", "cpmMin", "cpmMax", "geo", "adType", "frequency"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				message: { type: "string" },
				payload: { type: "object" },
			},
		},
	},
} as const;
