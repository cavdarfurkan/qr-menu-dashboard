import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCsrfToken, hasCsrfToken, fetchCsrfToken } from "./csrf";

describe("csrf", () => {
	beforeEach(() => {
		// Clear cookies before each test
		Object.defineProperty(document, "cookie", {
			writable: true,
			value: "",
		});
	});

	describe("getCsrfToken", () => {
		it("should return empty string when no CSRF token cookie exists", () => {
			const token = getCsrfToken();
			expect(token).toBe("");
		});

		it("should extract CSRF token from cookie", () => {
			document.cookie = "XSRF-TOKEN=test-csrf-token-123";
			const token = getCsrfToken();
			expect(token).toBe("test-csrf-token-123");
		});

		it("should decode URI encoded CSRF token", () => {
			document.cookie = "XSRF-TOKEN=test%20token%20with%20spaces";
			const token = getCsrfToken();
			expect(token).toBe("test token with spaces");
		});

		it("should extract CSRF token when multiple cookies exist", () => {
			document.cookie =
				"other-cookie=value; XSRF-TOKEN=my-token; another=cookie";
			const token = getCsrfToken();
			expect(token).toBe("my-token");
		});

		it("should handle cookie with spaces around equals sign", () => {
			document.cookie = "XSRF-TOKEN = token-with-spaces";
			const token = getCsrfToken();
			expect(token).toBe("token-with-spaces");
		});
	});

	describe("hasCsrfToken", () => {
		it("should return false when no CSRF token exists", () => {
			expect(hasCsrfToken()).toBe(false);
		});

		it("should return true when CSRF token exists", () => {
			document.cookie = "XSRF-TOKEN=test-token";
			expect(hasCsrfToken()).toBe(true);
		});

		it("should return false for empty CSRF token", () => {
			document.cookie = "XSRF-TOKEN=";
			expect(hasCsrfToken()).toBe(false);
		});
	});

	describe("fetchCsrfToken", () => {
		it("should fetch CSRF token from API", async () => {
			// The MSW handler will set the cookie
			await expect(fetchCsrfToken()).resolves.toBeUndefined();
		});

		it("should handle API errors gracefully", async () => {
			// Mock a failed API call
			const { http, HttpResponse } = await import("msw");
			const { server } = await import("~/test/mocks/server");

			server.use(
				http.get("http://localhost:8080/api/v1/auth/csrf", () => {
					return HttpResponse.json({ error: "Server error" }, { status: 500 });
				}),
			);

			await expect(fetchCsrfToken()).rejects.toThrow();
		});
	});
});
