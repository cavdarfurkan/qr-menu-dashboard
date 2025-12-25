import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectThemeDialog from "./SelectThemeDialog";
import api from "~/lib/api";

vi.mock("~/lib/api");

// Mock react-infinite-scroll-component
vi.mock("react-infinite-scroll-component", () => ({
	default: ({ children, loader }: any) => (
		<div data-testid="infinite-scroll">{children}</div>
	),
}));

describe("SelectThemeDialog Component", () => {
	const mockOnClick = vi.fn();
	const defaultProps = {
		content: {
			fetchUrl: "/v1/theme",
			onClick: mockOnClick,
		},
		children: <button>Open Dialog</button>,
	};

	const mockThemes = [
		{
			id: 1,
			isFree: true,
			themeManifest: {
				name: "Theme 1",
				description: "Description 1",
				author: "Author 1",
			},
		},
		{
			id: 2,
			isFree: false,
			themeManifest: {
				name: "Theme 2",
				description: "Description 2",
				author: "Author 2",
			},
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(api.get).mockResolvedValue({
			data: {
				success: true,
				data: {
					content: mockThemes,
					totalPages: 1,
				},
			},
		});
	});

	describe("Rendering", () => {
		it("should render trigger button", () => {
			render(<SelectThemeDialog {...defaultProps} />);

			expect(
				screen.getByRole("button", { name: /Open Dialog/i }),
			).toBeInTheDocument();
		});

		it("should not render dialog content initially", () => {
			render(<SelectThemeDialog {...defaultProps} />);

			expect(screen.queryByText(/theme:all_themes/i)).not.toBeInTheDocument();
		});
	});

	describe("Dialog Interaction", () => {
		it("should open dialog when trigger is clicked", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText(/theme:all_themes/i)).toBeInTheDocument();
			});
		});

		it("should fetch themes when dialog opens", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(api.get).toHaveBeenCalledWith("/v1/theme", {
					params: { page: 0, size: 20 },
				});
			});
		});

		it("should render themes when loaded", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
				expect(screen.getByText("Theme 2")).toBeInTheDocument();
			});
		});

		it("should close dialog when theme is selected", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
			});

			// Click on a theme card using stable selector
			const themeCard = screen.getByTestId("theme-card-Theme 1");
			await user.click(themeCard);

			// Verify onClick was called
			await waitFor(() => {
				expect(mockOnClick).toHaveBeenCalled();
			});

			// Verify dialog closed
			await waitFor(() => {
				expect(screen.queryByText("Theme 1")).not.toBeInTheDocument();
			});
		});

		it("should call onClick with theme id when theme is selected", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
			});

			// Find and click the first theme card
			const themeCards = screen.getAllByText("Theme 1");
			const card = themeCards[0].closest('[class*="cursor-pointer"]');
			if (card) {
				await user.click(card);
			}

			await waitFor(() => {
				expect(mockOnClick).toHaveBeenCalledWith(1);
			});
		});
	});

	describe("Theme Display", () => {
		it("should display theme names", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
				expect(screen.getByText("Theme 2")).toBeInTheDocument();
			});
		});

		it("should display theme descriptions", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Description 1")).toBeInTheDocument();
				expect(screen.getByText("Description 2")).toBeInTheDocument();
			});
		});

		it("should display theme authors", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Author 1")).toBeInTheDocument();
				expect(screen.getByText("Author 2")).toBeInTheDocument();
			});
		});
	});

	describe("Error Handling", () => {
		it("should handle API errors gracefully", async () => {
			const user = userEvent.setup();
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			// Dialog should still open
			await waitFor(() => {
				expect(screen.getByText(/theme:all_themes/i)).toBeInTheDocument();
			});

			consoleSpy.mockRestore();
		});
	});

	describe("Pagination", () => {
		it("should request first page on initial load", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(api.get).toHaveBeenCalledWith("/v1/theme", {
					params: { page: 0, size: 20 },
				});
			});
		});

		it("should handle multiple pages of themes", async () => {
			const user = userEvent.setup();

			vi.mocked(api.get).mockResolvedValue({
				data: {
					success: true,
					data: {
						content: mockThemes,
						totalPages: 3,
					},
				},
			});

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByTestId("infinite-scroll")).toBeInTheDocument();
			});
		});

		it("should stop loading when all pages are fetched", async () => {
			const user = userEvent.setup();

			vi.mocked(api.get).mockResolvedValue({
				data: {
					success: true,
					data: {
						content: mockThemes,
						totalPages: 1,
					},
				},
			});

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
			});

			// Only one API call should be made for single page
			expect(api.get).toHaveBeenCalledTimes(1);
		});
	});

	describe("Dialog Title", () => {
		it("should display all themes title", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByText(/theme:all_themes/i)).toBeInTheDocument();
			});
		});
	});

	describe("Infinite Scroll", () => {
		it("should render infinite scroll container", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				expect(screen.getByTestId("infinite-scroll")).toBeInTheDocument();
			});
		});
	});

	describe("Custom Trigger", () => {
		it("should render custom trigger element", () => {
			const customProps = {
				...defaultProps,
				children: <span data-testid="custom-trigger">Custom Trigger</span>,
			};

			render(<SelectThemeDialog {...customProps} />);

			expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
		});
	});

	describe("Theme Free Status", () => {
		it("should display free indicator for free themes", async () => {
			const user = userEvent.setup();

			render(<SelectThemeDialog {...defaultProps} />);

			await user.click(screen.getByRole("button", { name: /Open Dialog/i }));

			await waitFor(() => {
				// Both themes should be rendered
				expect(screen.getByText("Theme 1")).toBeInTheDocument();
				expect(screen.getByText("Theme 2")).toBeInTheDocument();
			});

			// Verify Theme 1 (isFree: true) shows the free indicator
			const theme1Card = screen.getByTestId("theme-card-Theme 1");
			expect(
				within(theme1Card).getByText(/common:labels\.is_free/i),
			).toBeInTheDocument();

			// Verify Theme 2 (isFree: false) doesn't show the free indicator
			const theme2Card = screen.getByTestId("theme-card-Theme 2");
			expect(
				within(theme2Card).queryByText(/common:labels\.is_free/i),
			).not.toBeInTheDocument();
		});
	});
});
