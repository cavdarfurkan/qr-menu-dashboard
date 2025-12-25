import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import api from "./api";

describe("api", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("axios instance configuration", () => {
		it("should have correct base URL", () => {
			expect(api.defaults.baseURL).toBe("http://localhost:8080/api");
		});

		it("should have correct default headers", () => {
			expect(api.defaults.headers["Content-Type"]).toBe("application/json");
		});
	});

	describe("request interceptor", () => {
		it("should add Authorization header when access token exists", async () => {
			localStorage.setItem("accessToken", "test-token-123");

			const config = {
				headers: {} as Record<string, string>,
			};

			// Get the request interceptor and call it
			const interceptors = (api.interceptors.request as any).handlers;
			const interceptor = interceptors[0];
			const result = interceptor.fulfilled(config);

			expect(result.headers.Authorization).toBe("Bearer test-token-123");
		});

		it("should not add Authorization header when no token exists", async () => {
			const config = {
				headers: {} as Record<string, string>,
			};

			const interceptors = (api.interceptors.request as any).handlers;
			const interceptor = interceptors[0];
			const result = interceptor.fulfilled(config);

			expect(result.headers.Authorization).toBeUndefined();
		});

		it("should add CSRF token header when cookie exists", async () => {
			// Save original cookie value
			const originalCookie = document.cookie;
			try {
				document.cookie = "XSRF-TOKEN=csrf-token-123";

				const config = {
					headers: {} as Record<string, string>,
				};

				const interceptors = (api.interceptors.request as any).handlers;
				const interceptor = interceptors[0];
				const result = interceptor.fulfilled(config);

				expect(result.headers["X-XSRF-TOKEN"]).toBe("csrf-token-123");
			} finally {
				// Restore original cookie state by clearing XSRF-TOKEN
				document.cookie =
					"XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			}
		});
	});

	describe("response interceptor - token refresh", () => {
		it("should pass through non-401 errors", async () => {
			const error = {
				response: { status: 404 },
				config: {
					url: "/some-endpoint",
					headers: {},
				},
			};

			const interceptors = (api.interceptors.response as any).handlers;
			const interceptor = interceptors[0];

			await expect(interceptor.rejected(error)).rejects.toEqual(error);
		});

		it("should not retry if already retried", async () => {
			const error = {
				response: { status: 401 },
				config: {
					url: "/some-endpoint",
					headers: {},
					_retry: true,
				},
			};

			const interceptors = (api.interceptors.response as any).handlers;
			const interceptor = interceptors[0];

			await expect(interceptor.rejected(error)).rejects.toEqual(error);
		});

		it("should skip refresh when skipRefreshingToken is true", async () => {
			const error = {
				response: { status: 401 },
				config: {
					url: "/some-endpoint",
					headers: {},
					skipRefreshingToken: true,
				},
			};

			const interceptors = (api.interceptors.response as any).handlers;
			const interceptor = interceptors[0];

			await expect(interceptor.rejected(error)).rejects.toEqual(error);
		});

		it("should reject when no config in error", async () => {
			const error = {
				response: { status: 401 },
				config: undefined,
			};

			const interceptors = (api.interceptors.response as any).handlers;
			const interceptor = interceptors[0];

			await expect(interceptor.rejected(error)).rejects.toEqual(error);
		});

		it("should logout on refresh failure", async () => {
			localStorage.setItem("accessToken", "old-token");

			// The actual refresh will fail since MSW returns a valid response but
			// we're testing the logout flow
			const error = {
				response: { status: 401 },
				config: {
					url: "/auth/refresh",
					headers: {},
				},
			};

			const interceptors = (api.interceptors.response as any).handlers;
			const interceptor = interceptors[0];

			try {
				await interceptor.rejected(error);
			} catch (e) {
				// Expected to throw
			}

			// Token should be removed after failed refresh
			expect(localStorage.getItem("accessToken")).toBeNull();
		});
	});
});
