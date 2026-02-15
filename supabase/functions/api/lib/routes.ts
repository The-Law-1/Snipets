import { FUNCTION_NAME } from "./env.ts";

export function normalizeRoute(pathname: string): string {
	const prefix = `/functions/v1/${FUNCTION_NAME}`;
	let route = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
	if (!route.startsWith("/")) {
		route = `/${route}`;
	}
	return route.replace(/\/+$/, "") || "/";
}
