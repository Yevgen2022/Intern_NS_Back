import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAuthRepo } from "../repository/auth.repository";
import { createAuthService } from "../services/auth.service";

type RegisterBody = { email: string; password: string; name: string };
type LoginBody = { email: string; password: string };

export function createAuthController(fastify: FastifyInstance) {
	const service = createAuthService(fastify);
	const repo = createAuthRepo(fastify);

	// from config: cookie name + ready-made options
	const AUTH_COOKIE = fastify.config.AUTH_COOKIE ?? "auth";
	type SameSite = "lax" | "strict" | "none";

	///////////////////////////////////////////////
	type CookieOptions = {
		httpOnly: boolean;
		sameSite: SameSite;
		secure: boolean;
		path?: string;
	};

	const cookieOptions: CookieOptions = {
		httpOnly: true,
		sameSite: fastify.config.COOKIE_SAMESITE as SameSite,
		secure: Boolean(fastify.config.COOKIE_SECURE),
		path: fastify.config.COOKIE_PATH,
	};

	// safety: if sameSite === 'none', secure=true is required
	if (cookieOptions.sameSite === "none") {
		cookieOptions.secure = true;
	}
	///////////////////////////////////////////////

	const readToken = (req: FastifyRequest) =>
		(req.cookies?.[AUTH_COOKIE] as string | undefined) ?? undefined;

	return {
		// POST /register
		async register(
			req: FastifyRequest<{ Body: RegisterBody }>,
			reply: FastifyReply,
		) {
			const { email, password, name } = req.body;
			const user = await service.register(email, password, name);
			return reply.code(201).send({ ok: true, user });
		},

		// POST /login
		async login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
			const { email, password } = req.body;
			const { token, user, expiresAt } = await service.login(email, password);

			reply.setCookie(AUTH_COOKIE, token, {
				...cookieOptions,
				expires: expiresAt, // важливо: точно така ж дата, як у сесії
			});

			return reply.send({ ok: true, user, expiresAt });
		},

		// POST /logout
		async logout(req: FastifyRequest, reply: FastifyReply) {
			const token = readToken(req);
			if (token) {
				await repo.deleteSessionByToken(token); // ідемпотентно
			}
			reply.clearCookie(AUTH_COOKIE, cookieOptions);
			return reply.send({ ok: true });
		},

		// GET /whoami
		async whoami(req: FastifyRequest, reply: FastifyReply) {
			const token = readToken(req);
			const { user, valid } = await service.verify(token);

			if (!valid || !user) {
				return reply.send({ authenticated: false, user: null });
			}

			return reply.send({ authenticated: true, user });
		},
	};
}
