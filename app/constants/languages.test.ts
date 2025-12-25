import { describe, it, expect } from "vitest";
import { languages } from "./languages";

describe("languages", () => {
	it("should have correct structure", () => {
		expect(languages).toBeDefined();
		expect(typeof languages).toBe("object");
	});

	it("should contain English language", () => {
		expect(languages.en).toBe("English");
	});

	it("should contain Turkish language", () => {
		expect(languages.tr).toBe("Türkçe");
	});

	it("should contain Polish language", () => {
		expect(languages.pl).toBe("Polski");
	});

	it("should have correct language codes as keys", () => {
		const keys = Object.keys(languages);
		expect(keys).toContain("en");
		expect(keys).toContain("tr");
		expect(keys).toContain("pl");
	});

	it("should be a const object", () => {
		// TypeScript const assertion ensures immutability at compile time
		// Runtime check that it's an object
		expect(Object.isFrozen(languages)).toBe(false); // const assertion doesn't freeze at runtime
		expect(languages).toEqual({
			en: "English",
			tr: "Türkçe",
			pl: "Polski",
		});
	});

	it("should have string values", () => {
		Object.values(languages).forEach((value) => {
			expect(typeof value).toBe("string");
		});
	});
});
