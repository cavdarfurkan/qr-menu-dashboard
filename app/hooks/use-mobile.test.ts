import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
	const MOBILE_BREAKPOINT = 768;

	beforeEach(() => {
		// Reset window size
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return false for desktop width", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);
	});

	it("should return true for mobile width", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(true);
	});

	it("should return true for width exactly at breakpoint - 1", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: MOBILE_BREAKPOINT - 1,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(true);
	});

	it("should return false for width at breakpoint", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: MOBILE_BREAKPOINT,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);
	});

	it("should update when matchMedia change event fires for mobile", () => {
		let changeListener: ((e: any) => void) | null = null;

		const mockMql = {
			matches: false,
			media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn((event, cb) => {
				if (event === "change") changeListener = cb;
			}),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		};

		vi.spyOn(window, "matchMedia").mockReturnValue(
			mockMql as unknown as MediaQueryList,
		);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);

		// Simulate matchMedia change event by updating innerWidth and calling listener
		act(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 500,
			});
			if (changeListener) changeListener({ matches: true });
		});

		expect(result.current).toBe(true);
	});

	it("should update when matchMedia change event fires for desktop", () => {
		let changeListener: ((e: any) => void) | null = null;

		const mockMql = {
			matches: true,
			media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn((event, cb) => {
				if (event === "change") changeListener = cb;
			}),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		};

		vi.spyOn(window, "matchMedia").mockReturnValue(
			mockMql as unknown as MediaQueryList,
		);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(true);

		// Simulate matchMedia change event by updating innerWidth and calling listener
		act(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 1024,
			});
			if (changeListener) changeListener({ matches: false });
		});

		expect(result.current).toBe(false);
	});

	it("should cleanup event listener on unmount", () => {
		const mockRemoveEventListener = vi.fn();

		const mockMql = {
			matches: false,
			media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: mockRemoveEventListener,
			dispatchEvent: vi.fn(),
		};

		vi.spyOn(window, "matchMedia").mockReturnValue(
			mockMql as unknown as MediaQueryList,
		);

		const { unmount } = renderHook(() => useIsMobile());

		unmount();

		expect(mockRemoveEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("should use matchMedia API", () => {
		const matchMediaSpy = vi.spyOn(window, "matchMedia");

		renderHook(() => useIsMobile());

		expect(matchMediaSpy).toHaveBeenCalledWith(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
		);
	});
});
