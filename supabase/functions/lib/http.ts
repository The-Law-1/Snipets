export function getCorsHeaders(request: Request): HeadersInit {
	const configured = Deno.env.get("CORS_ALLOW_ORIGINS") || "*";
	const allowed = configured.split(",").map((value) => value.trim()).filter(Boolean);
	const origin = request.headers.get("origin") || "";

	if (origin === "" || !allowed.includes(origin)) {
		throw new Error("Origin not allowed");
	}

	let allowOrigin = "*";
	if (allowed.length > 0 && allowed[0] !== "*") {
		allowOrigin = allowed.includes(origin) ? origin : allowed[0];
	}

	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
		"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
		"Vary": "Origin",
	};
}

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	});
}

export async function parseJson<T>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		throw { status: 400, message: "Invalid JSON body" };
	}
}
