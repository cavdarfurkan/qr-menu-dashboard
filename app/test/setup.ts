import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { server } from "./mocks/server";

// Ensure we're in jsdom environment
if (typeof window === "undefined") {
	throw new Error("Tests must run in jsdom environment");
}

// Make window globals available globally for tests
(globalThis as any).localStorage = window.localStorage;
(globalThis as any).sessionStorage = window.sessionStorage;
(globalThis as any).document = document;
(globalThis as any).window = window;
(globalThis as any).navigator = window.navigator;

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Reset handlers and cleanup after each test
afterEach(() => {
	server.resetHandlers();
	cleanup();
	if (typeof window !== "undefined" && window.localStorage) {
		window.localStorage.clear();
	}
	vi.clearAllMocks();
});

// Stop MSW server after all tests
afterAll(() => server.close());

// Mock i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (options) {
				// Simple interpolation for testing
				let result = key;
				Object.keys(options).forEach((optKey) => {
					result = result.replace(`{{${optKey}}}`, options[optKey]);
				});
				return result;
			}
			return key;
		},
		i18n: {
			changeLanguage: vi.fn(() => Promise.resolve()),
			language: "en",
		},
	}),
	Trans: ({ children }: any) => children,
	initReactI18next: {
		type: "3rdParty",
		init: () => {},
	},
}));

// Mock i18n module to prevent it from loading resources
vi.mock("~/i18n", () => ({
	default: {
		language: "en",
		changeLanguage: vi.fn(() => Promise.resolve()),
		t: (key: string) => key,
		use: vi.fn(() => ({
			use: vi.fn(() => ({
				init: vi.fn(() => Promise.resolve()),
			})),
		})),
	},
}));

// Mock React Router hooks (individual tests will override as needed)
// Note: Component mocks are defined as functions returning createElement calls
// to avoid JSX syntax in .ts files
import { createElement } from "react";

vi.mock("react-router", () => ({
	useParams: vi.fn(() => ({})),
	useNavigate: vi.fn(() => vi.fn()),
	useLocation: vi.fn(() => ({
		pathname: "/",
		search: "",
		hash: "",
		state: null,
		key: "default",
	})),
	useRevalidator: vi.fn(() => ({
		revalidate: vi.fn(),
		state: "idle",
	})),
	useBlocker: vi.fn(() => ({
		state: "unblocked",
		proceed: vi.fn(),
		reset: vi.fn(),
	})),
	useFetcher: vi.fn(() => ({
		data: null,
		state: "idle",
		submit: vi.fn(),
	})),
	Link: ({ to, children, ...props }: any) =>
		createElement("a", { href: to, ...props }, children),
	Navigate: ({ to }: any) =>
		createElement("div", { "data-testid": "navigate" }, `Redirecting to ${to}`),
	Outlet: () =>
		createElement("div", { "data-testid": "outlet" }, "Outlet Content"),
	MemoryRouter: ({ children }: any) => createElement("div", null, children),
	Form: ({ children, ...props }: any) => createElement("form", props, children),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
		resolvedTheme: "light",
	}),
	ThemeProvider: ({ children }: any) => children,
}));

// Setup DOM mocks only if in browser-like environment
if (typeof window !== "undefined") {
	// Mock window.matchMedia
	if (!window.matchMedia) {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	}

	// Ensure localStorage exists and is functional
	if (!window.localStorage) {
		const localStorageMock = (() => {
			let store: Record<string, string> = {};

			return {
				getItem: (key: string) => store[key] || null,
				setItem: (key: string, value: string) => {
					store[key] = value.toString();
				},
				removeItem: (key: string) => {
					delete store[key];
				},
				clear: () => {
					store = {};
				},
				get length() {
					return Object.keys(store).length;
				},
				key: (index: number) => {
					const keys = Object.keys(store);
					return keys[index] || null;
				},
			};
		})();

		Object.defineProperty(window, "localStorage", {
			value: localStorageMock,
			writable: true,
		});
	}
}

// Mock document.cookie if document exists
if (typeof document !== "undefined") {
	const cookieStore = new Map<string, string>();
	Object.defineProperty(document, "cookie", {
		get: () => {
			// Return all cookies joined by "; "
			return Array.from(cookieStore.entries())
				.map(([name, value]) => `${name}=${value}`)
				.join("; ");
		},
		set: (value: string) => {
			// Parse the incoming cookie string (format: "name=value" or "name=value; path=/; domain=example.com")
			// Extract just the name=value part (everything before the first semicolon or end of string)
			const cookieString = value.trim();
			const equalIndex = cookieString.indexOf("=");

			if (equalIndex === -1) {
				// Invalid cookie format, ignore
				return;
			}

			const name = cookieString.substring(0, equalIndex).trim();
			// Get the value part (everything after =, but stop at first semicolon if present)
			const valuePart = cookieString.substring(equalIndex + 1);
			const semicolonIndex = valuePart.indexOf(";");
			const cookieValue =
				semicolonIndex === -1
					? valuePart.trim()
					: valuePart.substring(0, semicolonIndex).trim();

			// Update existing cookie by name or add new one
			if (name) {
				cookieStore.set(name, cookieValue);
			}
		},
		configurable: true,
	});
}
