import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMenuStore } from "./useMenuStore";

describe("useMenuStore", () => {
	beforeEach(() => {
		// Reset store state before each test
		const { result } = renderHook(() => useMenuStore());
		act(() => {
			result.current.clearMenu();
		});
	});

	it("should have initial state with undefined values", () => {
		const { result } = renderHook(() => useMenuStore());

		expect(result.current.menuId).toBeUndefined();
		expect(result.current.contentName).toBeUndefined();
	});

	it("should set menuId", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setMenuId("123");
		});

		expect(result.current.menuId).toBe("123");
	});

	it("should set contentName", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setContentName("products");
		});

		expect(result.current.contentName).toBe("products");
	});

	it("should set both menuId and contentName", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setMenuId("456");
			result.current.setContentName("categories");
		});

		expect(result.current.menuId).toBe("456");
		expect(result.current.contentName).toBe("categories");
	});

	it("should clear menu state", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setMenuId("789");
			result.current.setContentName("items");
		});

		expect(result.current.menuId).toBe("789");
		expect(result.current.contentName).toBe("items");

		act(() => {
			result.current.clearMenu();
		});

		expect(result.current.menuId).toBeUndefined();
		expect(result.current.contentName).toBeUndefined();
	});

	it("should allow setting menuId to undefined", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setMenuId("123");
		});

		expect(result.current.menuId).toBe("123");

		act(() => {
			result.current.setMenuId(undefined);
		});

		expect(result.current.menuId).toBeUndefined();
	});

	it("should allow setting contentName to undefined", () => {
		const { result } = renderHook(() => useMenuStore());

		act(() => {
			result.current.setContentName("products");
		});

		expect(result.current.contentName).toBe("products");

		act(() => {
			result.current.setContentName(undefined);
		});

		expect(result.current.contentName).toBeUndefined();
	});

	it("should persist state across multiple hook instances", () => {
		const { result: result1 } = renderHook(() => useMenuStore());

		act(() => {
			result1.current.setMenuId("shared-id");
		});

		const { result: result2 } = renderHook(() => useMenuStore());

		expect(result2.current.menuId).toBe("shared-id");
	});
});
