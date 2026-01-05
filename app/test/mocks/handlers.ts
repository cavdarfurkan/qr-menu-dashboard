import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:8080/api";

export const handlers = [
	// Auth endpoints
	http.post(`${BASE_URL}/v1/auth/login`, () => {
		return HttpResponse.json({
			success: true,
			message: "Login successful",
			data: {
				accessToken: "mock-access-token",
			},
			timestamp: new Date().toISOString(),
		});
	}),

	http.post(`${BASE_URL}/v1/auth/register`, () => {
		return HttpResponse.json({
			success: true,
			message: "Registration successful",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.get(`${BASE_URL}/v1/auth/csrf`, () => {
		return HttpResponse.json(
			{
				success: true,
				message: "CSRF token generated",
				data: null,
				timestamp: new Date().toISOString(),
			},
			{
				headers: {
					"Set-Cookie":
						"XSRF-TOKEN=mock-csrf-token; Path=/; SameSite=None; Secure",
				},
			},
		);
	}),

	http.post(`${BASE_URL}/v1/auth/refresh`, () => {
		return HttpResponse.json({
			success: true,
			message: "Token refreshed",
			data: {
				accessToken: "new-mock-access-token",
			},
			timestamp: new Date().toISOString(),
		});
	}),

	http.post(`${BASE_URL}/v1/auth/forgot-password`, () => {
		return HttpResponse.json({
			success: true,
			message: "Password reset email sent",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.post(`${BASE_URL}/v1/auth/reset-password`, () => {
		return HttpResponse.json({
			success: true,
			message: "Password reset successfully",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.post(`${BASE_URL}/v1/auth/change-password`, () => {
		return HttpResponse.json({
			success: true,
			message: "Password changed successfully",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	// Menu endpoints
	http.get(`${BASE_URL}/v1/menu/all`, () => {
		return HttpResponse.json({
			success: true,
			message: "Menus retrieved",
			data: [
				{ menuId: 1, menuName: "Test Menu 1", published: true, isLatest: true },
				{
					menuId: 2,
					menuName: "Test Menu 2",
					published: false,
					isLatest: false,
				},
			],
			timestamp: new Date().toISOString(),
		});
	}),

	http.get(`${BASE_URL}/v1/menu/:id`, ({ params }) => {
		return HttpResponse.json({
			success: true,
			message: "Menu retrieved",
			data: {
				menuId: Number(params.id),
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
				isLatest: true,
			},
			timestamp: new Date().toISOString(),
		});
	}),

	http.put(`${BASE_URL}/v1/menu/:id`, () => {
		return HttpResponse.json({
			success: true,
			message: "Menu updated",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.delete(`${BASE_URL}/v1/menu/delete/:id`, () => {
		return HttpResponse.json({
			success: true,
			message: "Menu deleted",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	// Theme endpoints
	http.get(`${BASE_URL}/v1/theme/:id/schemas`, () => {
		return HttpResponse.json({
			success: true,
			message: "Schemas retrieved",
			data: {
				schemas_count: 1,
				theme_schemas: {
					products: {
						type: "object",
						properties: {
							name: { type: "string" },
							price: { type: "number" },
						},
					},
				},
				ui_schemas: {
					products: {},
				},
			},
			timestamp: new Date().toISOString(),
		});
	}),

	// Content endpoints
	http.get(`${BASE_URL}/v1/menu/:menuId/content/:contentName`, () => {
		return HttpResponse.json({
			success: true,
			message: "Content retrieved",
			data: [
				{
					id: "123e4567-e89b-12d3-a456-426614174000",
					data: { id: 1, name: "Product 1", price: 10 },
				},
				{
					id: "123e4567-e89b-12d3-a456-426614174001",
					data: { id: 2, name: "Product 2", price: 20 },
				},
			],
			timestamp: new Date().toISOString(),
		});
	}),

	http.get(`${BASE_URL}/v1/menu/:menuId/content/:contentName/:itemId`, () => {
		return HttpResponse.json({
			success: true,
			message: "Content item retrieved",
			data: {
				id: "123e4567-e89b-12d3-a456-426614174000",
				data: { id: 1, name: "Product 1", price: 10 },
				resolved: {},
			},
			timestamp: new Date().toISOString(),
		});
	}),

	http.post(`${BASE_URL}/v1/menu/:menuId/content`, () => {
		return HttpResponse.json({
			success: true,
			message: "Content created",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.put(`${BASE_URL}/v1/menu/:menuId/content/:contentName/:itemId`, () => {
		return HttpResponse.json({
			success: true,
			message: "Content updated",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),

	http.delete(
		`${BASE_URL}/v1/menu/:menuId/content/:contentName/:itemId`,
		() => {
			return HttpResponse.json({
				success: true,
				message: "Content deleted",
				data: null,
				timestamp: new Date().toISOString(),
			});
		},
	),

	http.delete(`${BASE_URL}/v1/menu/:menuId/content/:contentName/bulk`, () => {
		return HttpResponse.json({
			success: true,
			message: "Content deleted",
			data: null,
			timestamp: new Date().toISOString(),
		});
	}),
];
