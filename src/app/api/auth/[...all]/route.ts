import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// expose toutes les routes Better Auth
export const { GET, POST } = toNextJsHandler(auth);
