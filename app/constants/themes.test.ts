import { describe, it, expect } from "vitest";
import { THEME_VALUES, THEME_CONFIG } from "./themes";

describe("themes", () => {
	describe("THEME_VALUES", () => {
		it("should have LIGHT value", () => {
			expect(THEME_VALUES.LIGHT).toBe("light");
		});

		it("should have DARK value", () => {
			expect(THEME_VALUES.DARK).toBe("dark");
		});

		it("should have SYSTEM value", () => {
			expect(THEME_VALUES.SYSTEM).toBe("system");
		});

		it("should have exactly 3 theme values", () => {
			const keys = Object.keys(THEME_VALUES);
			expect(keys).toHaveLength(3);
		});

		it("should have correct keys", () => {
			const keys = Object.keys(THEME_VALUES);
			expect(keys).toContain("LIGHT");
			expect(keys).toContain("DARK");
			expect(keys).toContain("SYSTEM");
		});

		it("should have string values", () => {
			Object.values(THEME_VALUES).forEach((value) => {
				expect(typeof value).toBe("string");
			});
		});
	});

	describe("THEME_CONFIG", () => {
		it("should have ATTRIBUTE property", () => {
			expect(THEME_CONFIG.ATTRIBUTE).toBe("class");
		});

		it("should have STORAGE_KEY property", () => {
			expect(THEME_CONFIG.STORAGE_KEY).toBe("theme");
		});

		it("should have exactly 2 config properties", () => {
			const keys = Object.keys(THEME_CONFIG);
			expect(keys).toHaveLength(2);
		});

		it("should have correct config keys", () => {
			const keys = Object.keys(THEME_CONFIG);
			expect(keys).toContain("ATTRIBUTE");
			expect(keys).toContain("STORAGE_KEY");
		});

		it("should have string values", () => {
			Object.values(THEME_CONFIG).forEach((value) => {
				expect(typeof value).toBe("string");
			});
		});

		it("should use class attribute for theme switching", () => {
			expect(THEME_CONFIG.ATTRIBUTE).toBe("class");
		});

		it("should use theme as storage key", () => {
			expect(THEME_CONFIG.STORAGE_KEY).toBe("theme");
		});
	});

	describe("constants immutability", () => {
		it("should export const objects", () => {
			expect(THEME_VALUES).toBeDefined();
			expect(THEME_CONFIG).toBeDefined();
		});

		it("should have consistent structure", () => {
			expect(THEME_VALUES).toEqual({
				LIGHT: "light",
				DARK: "dark",
				SYSTEM: "system",
			});

			expect(THEME_CONFIG).toEqual({
				ATTRIBUTE: "class",
				STORAGE_KEY: "theme",
			});
		});
	});
});
