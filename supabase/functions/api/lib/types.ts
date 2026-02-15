export type RouteContext = {
	request: Request;
	url: URL;
	route: string;
	segments: string[];
	corsHeaders: HeadersInit;
};

export type RouteHandler = (ctx: RouteContext) => Promise<Response | null>;
