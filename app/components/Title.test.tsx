import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Title from "./Title";

describe("Title", () => {
	it("should render title text", () => {
		render(<Title title="Test Title" />);

		expect(screen.getByText("Test Title")).toBeInTheDocument();
	});

	it("should render with default size (xl)", () => {
		render(<Title title="Default Size" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("text-xl");
	});

	it("should render with small size", () => {
		render(<Title title="Small Title" titleSize="sm" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("text-sm");
	});

	it("should render with medium size", () => {
		render(<Title title="Medium Title" titleSize="md" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("text-md");
	});

	it("should render with large size", () => {
		render(<Title title="Large Title" titleSize="lg" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("text-lg");
	});

	it("should render with xl size", () => {
		render(<Title title="XL Title" titleSize="xl" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("text-xl");
	});

	it("should render children in actions area", () => {
		render(
			<Title title="Title with Actions">
				<button>Action Button</button>
			</Title>,
		);

		expect(
			screen.getByRole("button", { name: "Action Button" }),
		).toBeInTheDocument();
	});

	it("should render multiple children", () => {
		render(
			<Title title="Multiple Actions">
				<button>Action 1</button>
				<button>Action 2</button>
			</Title>,
		);

		expect(
			screen.getByRole("button", { name: "Action 1" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Action 2" }),
		).toBeInTheDocument();
	});

	it("should render without children", () => {
		render(<Title title="No Actions" />);

		expect(screen.getByText("No Actions")).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("should render Separator component", () => {
		const { container } = render(<Title title="With Separator" />);

		// Separator component renders a div with specific role or class
		const separator = container.querySelector(
			'[data-orientation="horizontal"]',
		);
		expect(separator).toBeInTheDocument();
	});

	it("should have correct heading level", () => {
		render(<Title title="Heading Level" />);

		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toBeInTheDocument();
	});

	it("should apply font-semibold class", () => {
		render(<Title title="Bold Title" />);

		const heading = screen.getByRole("heading");
		expect(heading).toHaveClass("font-semibold");
	});
});
