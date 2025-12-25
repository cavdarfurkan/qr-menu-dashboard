import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import ThemeCard from "./ThemeCard";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("ThemeCard", () => {
	const defaultProps = {
		index: 1,
		themeName: "Modern Theme",
		themeDescription: "A modern and clean theme",
		themeAuthor: "John Doe",
		isFree: true,
	};

	it("should render theme information", () => {
		renderWithRouter(<ThemeCard {...defaultProps} />);

		expect(screen.getByText("Modern Theme")).toBeInTheDocument();
		expect(screen.getByText("A modern and clean theme")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("should render free badge when isFree is true", () => {
		renderWithRouter(<ThemeCard {...defaultProps} isFree={true} />);

		expect(screen.getByText("common:labels.is_free")).toBeInTheDocument();
	});

	it("should not render free badge when isFree is false", () => {
		renderWithRouter(<ThemeCard {...defaultProps} isFree={false} />);

		expect(screen.queryByText("common:labels.is_free")).not.toBeInTheDocument();
	});

	it("should call onClick handler when provided", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();

		renderWithRouter(<ThemeCard {...defaultProps} onClick={handleClick} />);

		const card = screen.getByTestId("theme-card-Modern Theme");
		expect(card).toBeInTheDocument();
		await user.click(card);
		expect(handleClick).toHaveBeenCalledWith(1);
	});

	it("should render as Link when no onClick provided", () => {
		renderWithRouter(<ThemeCard {...defaultProps} />);

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/theme/1");
	});

	it("should not render Link when onClick is provided", () => {
		const handleClick = vi.fn();
		renderWithRouter(<ThemeCard {...defaultProps} onClick={handleClick} />);

		const link = screen.queryByRole("link");
		expect(link).not.toBeInTheDocument();
	});

	it("should have hover effects class", () => {
		const { container } = renderWithRouter(<ThemeCard {...defaultProps} />);

		const card = container.querySelector('div[class*="hover:shadow-lg"]');
		expect(card).toBeInTheDocument();
	});

	it("should have cursor-pointer class", () => {
		const { container } = renderWithRouter(<ThemeCard {...defaultProps} />);

		const card = container.querySelector('div[class*="cursor-pointer"]');
		expect(card).toBeInTheDocument();
	});

	it("should render with correct index in link", () => {
		renderWithRouter(<ThemeCard {...defaultProps} index={5} />);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/theme/5");
	});

	it("should display all theme details", () => {
		renderWithRouter(
			<ThemeCard
				index={3}
				themeName="Premium Theme"
				themeDescription="Premium features included"
				themeAuthor="Jane Smith"
				isFree={false}
			/>,
		);

		expect(screen.getByText("Premium Theme")).toBeInTheDocument();
		expect(screen.getByText("Premium features included")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
	});
});
