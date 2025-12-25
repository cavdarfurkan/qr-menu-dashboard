import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUiStore } from "./useUiStore";

describe("useUiStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Reset the store state before each test
		const store = useUiStore.getState();
		useUiStore.setState({
			isSidebarOpen: true,
			isLoading: false,
			loadingMessage: "",
			notifications: [],
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it("should have initial state", () => {
		const { result } = renderHook(() => useUiStore());

		expect(result.current.isSidebarOpen).toBe(true);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.loadingMessage).toBe("");
		expect(result.current.notifications).toEqual([]);
	});

	it("should toggle sidebar", () => {
		const { result } = renderHook(() => useUiStore());

		expect(result.current.isSidebarOpen).toBe(true);

		act(() => {
			result.current.toggleSidebar();
		});

		expect(result.current.isSidebarOpen).toBe(false);

		act(() => {
			result.current.toggleSidebar();
		});

		expect(result.current.isSidebarOpen).toBe(true);
	});

	it("should set loading state", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.setLoading(true);
		});

		expect(result.current.isLoading).toBe(true);

		act(() => {
			result.current.setLoading(false);
		});

		expect(result.current.isLoading).toBe(false);
	});

	it("should add notification", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "success",
				message: "Test notification",
			});
		});

		expect(result.current.notifications).toHaveLength(1);
		expect(result.current.notifications[0].type).toBe("success");
		expect(result.current.notifications[0].message).toBe("Test notification");
		expect(result.current.notifications[0].id).toBeDefined();
	});

	it("should add multiple notifications", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "success",
				message: "First notification",
			});
			result.current.addNotification({
				type: "error",
				message: "Second notification",
			});
		});

		expect(result.current.notifications).toHaveLength(2);
	});

	it("should remove notification by id", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "info",
				message: "Test notification",
			});
		});

		expect(result.current.notifications).toHaveLength(1);
		const notificationId = result.current.notifications[0].id;

		act(() => {
			result.current.removeNotification(notificationId);
		});

		expect(result.current.notifications).toHaveLength(0);
	});

	it("should auto-remove notification after duration", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "success",
				message: "Auto-remove notification",
				duration: 3000,
			});
		});

		expect(result.current.notifications).toHaveLength(1);

		// Fast-forward time and run all timers
		act(() => {
			vi.advanceTimersByTime(3000);
			vi.runAllTimers();
		});

		expect(result.current.notifications).toHaveLength(0);
	});

	it("should not auto-remove notification without duration", async () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "warning",
				message: "Persistent notification",
			});
		});

		expect(result.current.notifications).toHaveLength(1);

		// Fast-forward time
		act(() => {
			vi.advanceTimersByTime(10000);
		});

		expect(result.current.notifications).toHaveLength(1);
	});

	it("should handle different notification types", () => {
		const { result } = renderHook(() => useUiStore());

		const types: Array<"success" | "error" | "warning" | "info"> = [
			"success",
			"error",
			"warning",
			"info",
		];

		act(() => {
			types.forEach((type) => {
				result.current.addNotification({
					type,
					message: `${type} notification`,
				});
			});
		});

		expect(result.current.notifications).toHaveLength(4);
		types.forEach((type, index) => {
			expect(result.current.notifications[index].type).toBe(type);
		});
	});

	it("should generate unique ids for notifications", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "info",
				message: "First",
			});
		});

		// Advance time to ensure Date.now() returns a different value
		act(() => {
			vi.advanceTimersByTime(1);
		});

		act(() => {
			result.current.addNotification({
				type: "info",
				message: "Second",
			});
		});

		const id1 = result.current.notifications[0].id;
		const id2 = result.current.notifications[1].id;

		expect(id1).not.toBe(id2);
	});

	it("should handle removing non-existent notification gracefully", () => {
		const { result } = renderHook(() => useUiStore());

		act(() => {
			result.current.addNotification({
				type: "info",
				message: "Test",
			});
		});

		expect(result.current.notifications).toHaveLength(1);

		act(() => {
			result.current.removeNotification("non-existent-id");
		});

		expect(result.current.notifications).toHaveLength(1);
	});
});
