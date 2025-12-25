import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import * as ReactRouter from "react-router";
import BackButton from "./BackButton";
import { createElement } from "react";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			changeLanguage: vi.fn(() => Promise.resolve()),
			language: "en",
		},
	}),
}));

// Store captured Link props for verification
let capturedLinkProps: any = null;

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("BackButton", () => {
	beforeEach(() => {
		capturedLinkProps = null;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render with back text", () => {
		renderWithRouter(<BackButton />);

		expect(
			screen.getByText("common:buttons.back_to_dashboard"),
		).toBeInTheDocument();
	});

	it("should render as a link", () => {
		renderWithRouter(<BackButton />);

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/");
	});

	it("should have correct button variant", () => {
		const { container } = renderWithRouter(<BackButton />);

		// Button with variant="link" should have specific classes
		const button = container.querySelector("a");
		expect(button).toHaveClass("inline-flex");
	});

	it("should render ArrowLeft icon", () => {
		const { container } = renderWithRouter(<BackButton />);

		// Check for SVG element (icon)
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("should forward viewTransition prop to Link component", () => {
		// Create a mock Link that captures props
		const MockLink = vi.fn(({ to, children, ...props }: any) => {
			capturedLinkProps = { to, ...props };
			return createElement("a", { href: to, ...props }, children);
		});

		// Override the global mock for this test to capture props
		vi.spyOn(ReactRouter, "Link").mockImplementation(MockLink as any);

		renderWithRouter(<BackButton />);

		expect(capturedLinkProps).not.toBeNull();
		expect(capturedLinkProps).toHaveProperty("viewTransition", true);
		expect(capturedLinkProps).toHaveProperty("to", "/");
	});
});
