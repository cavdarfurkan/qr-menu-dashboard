import { describe, it, expect } from "vitest";

describe("Test Environment", () => {
	it("should have window defined", () => {
		expect(typeof window).not.toBe("undefined");
	});

	it("should have document defined", () => {
		expect(typeof document).not.toBe("undefined");
	});

	it("should have localStorage defined", () => {
		expect(typeof window.localStorage).not.toBe("undefined");
	});

	it("should be able to use localStorage", () => {
		window.localStorage.setItem("test", "value");
		expect(window.localStorage.getItem("test")).toBe("value");
		window.localStorage.clear();
	});
});
