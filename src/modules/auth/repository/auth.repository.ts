import type { FastifyInstance } from "fastify";

export function createAuthRepo(fastify: FastifyInstance) {
	const db = fastify.prisma;

	return {
		// Users
		findUserByEmail(email: string) {
			return db.user.findUnique({ where: { email } });
		},

		getUserById(id: string) {
			return db.user.findUnique({
				where: { id },
				select: { id: true, email: true, name: true },
			});
		},

		createUser(email: string, passwordHash: string, name?: string) {
			return db.user.create({ data: { email, passwordHash, name } });
		},

		// Sessions (single-login)
		async createSession(userId: string, token: string, expiresAt: Date) {
			return db.session.upsert({
				where: { userId }, // <= унікальне поле у схемі
				update: { token, expiresAt, createdAt: new Date() },
				create: { userId, token, expiresAt },
			});
		},

		findSessionByToken(token: string) {
			return db.session.findUnique({ where: { token } });
		},

		//  if there is no token
		async deleteSessionByToken(token: string) {
			await db.session.deleteMany({ where: { token } });
			return null;
		},

		// deleteExpiredSessions(now = new Date()) {
		//     return db.session.deleteMany({ where: { expiresAt: { lt: now } } });
		// },
	};
}
