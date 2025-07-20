import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

// Root route will be handled by the protected route
export default [
	route("", "routes/protected_route.tsx", [
		layout("routes/home/layout.tsx", [
			index("routes/home/index.tsx"),

			...prefix("menu", [
				index("routes/home/menu.tsx"),
				route("create", "routes/home/menu.create.tsx"),
				route(":id", "routes/home/menu.detail.tsx"),
			]),

			route("settings", "routes/home/settings.tsx"),

			route("logout", "routes/auth/logout.tsx"),
		]),
	]),

	route("", "routes/no_auth_route.tsx", [
		layout("routes/auth/layout.tsx", [
			route("login", "routes/auth/login/index.tsx"),
			route("register", "routes/auth/register/index.tsx"),
		]),
	]),
] satisfies RouteConfig;
