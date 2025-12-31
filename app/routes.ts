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
		layout("routes/app_layout/layout.tsx", [
			index("routes/app_layout/dashboard/dashboard.tsx"),

			// Menu routes
			...prefix("menu", [
				index("routes/app_layout/menu/menu.tsx"),
				route(":id", "routes/app_layout/menu/menu.detail.tsx"),
				route("create", "routes/app_layout/menu/menu.create.tsx"),

				// Content routes
				...prefix(":menuId/content/:contentName", [
					index("routes/app_layout/menu/content/menu.content.tsx"),
					route(
						"edit/:itemId",
						"routes/app_layout/menu/content/menu.content.edit.tsx",
					),
				]),
			]),

			// Theme routes
			...prefix("theme", [
				index("routes/app_layout/theme/themes.tsx"),
				route("register", "routes/app_layout/theme/theme.register.tsx"),
			]),

			// Settings routes
			...prefix("settings", [index("routes/app_layout/settings/settings.tsx")]),

			route("logout", "routes/auth/logout.tsx"),
		]),
	]),

	route("", "routes/no_auth_route.tsx", [
		layout("routes/auth/layout.tsx", [
			route("login", "routes/auth/login/index.tsx"),
			route("register", "routes/auth/register/index.tsx"),
			route("forgot-password", "routes/auth/forgot-password/index.tsx"),
			route("reset-password", "routes/auth/reset-password/index.tsx"),
		]),
	]),
] satisfies RouteConfig;
