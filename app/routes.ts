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

			// Menu routes
			...prefix("menu", [
				index("routes/home/menu/menu.tsx"),
				route(":id", "routes/home/menu/menu.detail.tsx"),
				route("create", "routes/home/menu/menu.create.tsx"),


				// Content routes
				...prefix(":menuId/content/:contentName", [
					index("routes/home/menu/content/menu.content.tsx"),
					route(
						"edit/:itemId",
						"routes/home/menu/content/menu.content.edit.tsx",
					),
				]),
			]),

			// Theme routes
			...prefix("theme", [
				index("routes/home/theme/themes.tsx"),
				route("register", "routes/home/theme/theme.register.tsx"),
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
