import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
	// Helper to get the spinner element (the one with animate-spin class)
	const getSpinner = (container: HTMLElement) =>
		container.querySelector(".animate-spin");

	it("should render with default size (medium)", () => {
		const { container } = render(<Loader />);

		const spinner = getSpinner(container);
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("width: 2.5rem"),
		);
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("height: 2.5rem"),
		);
	});

	it("should render with small size", () => {
		const { container } = render(<Loader size="small" />);

		const spinner = getSpinner(container);
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("width: 1.5rem"),
		);
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("height: 1.5rem"),
		);
	});

	it("should render with large size", () => {
		const { container } = render(<Loader size="large" />);

		const spinner = getSpinner(container);
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("width: 3.5rem"),
		);
		expect(spinner).toHaveAttribute(
			"style",
			expect.stringContaining("height: 3.5rem"),
		);
	});

	it("should render with message", () => {
		render(<Loader message="Loading data..." />);

		expect(screen.getByText("Loading data...")).toBeInTheDocument();
	});

	it("should not render message when not provided", () => {
		const { container } = render(<Loader />);

		const message = container.querySelector("p");
		expect(message).not.toBeInTheDocument();
	});

	it("should render fullScreen loader", () => {
		const { container } = render(<Loader fullScreen />);

		const loaderContainer = container.firstChild as HTMLElement;
		expect(loaderContainer).toHaveClass("fixed", "inset-0");
	});

	it("should not be fullScreen by default", () => {
		const { container } = render(<Loader />);

		const loaderContainer = container.firstChild as HTMLElement;
		expect(loaderContainer).not.toHaveClass("fixed");
	});

	it("should have animate-spin class on spinner", () => {
		const { container } = render(<Loader />);

		const spinner = getSpinner(container);
		expect(spinner).toBeInTheDocument();
		expect(spinner?.className).toContain("animate-spin");
	});

	it("should adjust message font size based on loader size", () => {
		const { container: smallContainer } = render(
			<Loader size="small" message="Small" />,
		);
		const smallMessage = smallContainer.querySelector("p");
		expect(smallMessage).toHaveStyle({ fontSize: "0.875rem" });

		const { container: mediumContainer } = render(
			<Loader size="medium" message="Medium" />,
		);
		const mediumMessage = mediumContainer.querySelector("p");
		expect(mediumMessage).toHaveStyle({ fontSize: "1rem" });
	});

	it("should render spinner with correct styling classes", () => {
		const { container } = render(<Loader />);

		const spinner = getSpinner(container);
		expect(spinner).toBeInTheDocument();
		expect(spinner?.className).toContain("rounded-full");
		expect(spinner?.className).toContain("border-solid");
	});
});
