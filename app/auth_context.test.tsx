import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth_context";
import type { ReactNode } from "react";

describe("AuthContext", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	const wrapper = ({ children }: { children: ReactNode }) => (
		<AuthProvider>{children}</AuthProvider>
	);

	it("should initialize with null token when localStorage is empty", () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		expect(result.current.accessToken).toBeNull();
	});

	it("should initialize with token from localStorage", () => {
		window.localStorage.setItem("accessToken", "existing-token");

		const { result } = renderHook(() => useAuth(), { wrapper });

		expect(result.current.accessToken).toBe("existing-token");
	});

	it("should set access token", () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("new-token");
		});

		expect(result.current.accessToken).toBe("new-token");
	});

	it("should save token to localStorage when set", () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("stored-token");
		});

		expect(window.localStorage.getItem("accessToken")).toBe("stored-token");
	});

	it("should logout and clear token", async () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("token-to-clear");
		});

		expect(result.current.accessToken).toBe("token-to-clear");

		await act(async () => {
			await result.current.logout();
		});

		expect(result.current.accessToken).toBeNull();
	});

	it("should remove token from localStorage on logout", async () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("token-to-remove");
		});

		expect(window.localStorage.getItem("accessToken")).toBe("token-to-remove");

		await act(async () => {
			await result.current.logout();
		});

		expect(window.localStorage.getItem("accessToken")).toBeNull();
	});

	it("should provide context values when used within provider", () => {
		// Note: The AuthContext is created with a default value, so useContext will never return null.
		// The check `if (!context)` in useAuth will never be true since the context always has a value.
		// Instead, we test that the hook returns the expected shape within a provider.
		const { result } = renderHook(() => useAuth(), { wrapper });

		expect(result.current).toHaveProperty("accessToken");
		expect(result.current).toHaveProperty("setAccessToken");
		expect(result.current).toHaveProperty("logout");
		expect(typeof result.current.setAccessToken).toBe("function");
		expect(typeof result.current.logout).toBe("function");
	});

	it("should update localStorage when token changes", () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("first-token");
		});

		expect(window.localStorage.getItem("accessToken")).toBe("first-token");

		act(() => {
			result.current.setAccessToken("second-token");
		});

		expect(window.localStorage.getItem("accessToken")).toBe("second-token");
	});

	it("should handle multiple setAccessToken calls", () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.setAccessToken("token1");
			result.current.setAccessToken("token2");
			result.current.setAccessToken("token3");
		});

		expect(result.current.accessToken).toBe("token3");
		expect(window.localStorage.getItem("accessToken")).toBe("token3");
	});
});
