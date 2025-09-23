import type { FastifyInstance } from "fastify";
import { createAuthRepo } from "../repository/auth.repository";
import { randomToken } from "../utils/crypto";
import { hashPassword, verifyPassword } from "../utils/password";

function ttlDate(sec: number) {
	return new Date(Date.now() + sec * 1000);
}

export function createAuthService(fastify: FastifyInstance) {
	const repo = createAuthRepo(fastify);
	const { SESSION_TTL_SEC } = fastify.config;

	return {
		// POST /register
		async register(email: string, password: string, name?: string) {
			const existing = await repo.findUserByEmail(email);
			if (existing) {
				throw fastify.httpErrors.conflict("Email already in use");
			}

			const passwordHash = await hashPassword(password);
			const user = await repo.createUser(email, passwordHash, name);

			return { id: user.id, email: user.email, name: user.name ?? null };
		},

		// POST /login
		async login(email: string, password: string) {
			const user = await repo.findUserByEmail(email);
			if (!user) {
				throw fastify.httpErrors.unauthorized("Invalid credentials");
			}

			const ok = await verifyPassword(password, user.passwordHash);
			if (!ok) {
				throw fastify.httpErrors.unauthorized("Invalid credentials");
			}

			// single-device only
			// await repo.revokeSessionsByUserId(user.id);

			const token = randomToken(32);
			const expiresAt = ttlDate(SESSION_TTL_SEC);

			await repo.createSession(user.id, token, expiresAt);

			return {
				token,
				user: { id: user.id, email: user.email, name: user.name ?? null },
				expiresAt,
			};
		},

		// verify session by token
		async verify(token?: string) {
			if (!token) return { user: null, valid: false } as const;

			// session from repository
			const session = await repo.findSessionByToken(token);
			const now = new Date();

			if (!session || session.expiresAt <= now) {
				return { user: null, valid: false } as const;
			}

			const user = await repo.getUserById(session.userId);
			if (!user) return { user: null, valid: false } as const;

			return {
				user: { id: user.id, email: user.email, name: user.name },
				valid: true as const,
				session,
			};
		},
	};
}
