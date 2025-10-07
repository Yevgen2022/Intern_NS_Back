export const userShape = {
	type: "object",
	properties: {
		id: { type: "string" },
		email: { type: "string" },
		name: { type: ["string", "null"] },
	},
	required: ["id", "email"],
	additionalProperties: false,
} as const;

//////////////////////////////////////////////////////////////

export const registerBody = {
	type: "object",
	required: ["email", "password", "name"],
	additionalProperties: false,
	properties: {
		email: {
			type: "string",
			format: "email",
			minLength: 5,
			maxLength: 255,
			examples: ["test@example.com"],
		},
		password: {
			type: "string",
			minLength: 8,
			maxLength: 200,
			examples: ["12345678"],
		},
		name: {
			type: "string",
			minLength: 1,
			maxLength: 100,
			examples: ["Test User"],
		},
	},
} as const;

//////////////////////////////////////////////////////////////

export const registerResponse = {
	type: "object",
	properties: {
		ok: { type: "boolean" },
		user: userShape,
	},
	required: ["ok", "user"],
	additionalProperties: false,
} as const;

//////////////////////////////////////////////////////////////

export const loginBody = {
	type: "object",
	required: ["email", "password"],
	additionalProperties: false,
	properties: {
		email: {
			type: "string",
			format: "email",
			minLength: 5,
			maxLength: 255,
			examples: ["admin@example.com"],
		},
		password: {
			type: "string",
			minLength: 8,
			maxLength: 200,
			examples: ["12345678"],
		},
	},
} as const;

//////////////////////////////////////////////////////////////

export const loginResponse = {
	type: "object",
	properties: {
		ok: { type: "boolean" },
		user: userShape,
		expiresAt: { type: "string", format: "date-time" },
	},
	required: ["ok", "user", "expiresAt"],
	additionalProperties: false,
} as const;

//////////////////////////////////////////////////////////////

export const whoamiResponse = {
	type: "object",
	properties: {
		user: {
			type: ["object", "null"],
			properties: {
				id: { type: "string", examples: ["68e363879237288259f500f2"] },
				email: { type: "string", examples: ["bob@example.com"] },
				name: { type: ["string", "null"], examples: ["Bob"] },
			},
			required: ["id", "email"],
			additionalProperties: false,

			examples: [
				{
					id: "66fa8e5c9a2b3c0012cd45ab",
					email: "user@example.com",
					name: "Test User",
				},
				null,
			],
		},
		authenticated: { type: "boolean", examples: [true, false] },
	},
	required: ["authenticated"],
	additionalProperties: false,
	example: {
		user: {
			id: "66fa8e5c9a2b3c0012cd45ab",
			email: "user@example.com",
			name: "Test User",
		},
		authenticated: true,
	},
} as const;

//////////////////////////////////////////////////////////////

export const errorWhoamiResponse = {
	type: "object",
	properties: {
		error: { type: "string" },
	},
	required: ["error"],
	additionalProperties: false,
} as const;

export const basicOk = {
	type: "object",
	properties: { ok: { type: "boolean" } },
	required: ["ok"],
	additionalProperties: false,
} as const;

//////////////////////////////////////////////////////////////

export const logoutResponse = {
	type: "object",
	properties: {
		ok: { type: "boolean", examples: [true] },
		message: { type: "string", examples: ["User logged out successfully"] },
	},
	required: ["ok"],
	additionalProperties: false,
} as const;
