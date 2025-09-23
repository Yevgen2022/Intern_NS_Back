import { randomBytes } from "node:crypto";

export const randomToken = (len = 32) => randomBytes(len).toString("base64url");
