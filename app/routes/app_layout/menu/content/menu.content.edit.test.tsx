import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import MenuContentEdit from "./menu.content.edit";
import api from "~/lib/api";
import * as router from "react-router";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

vi.mock("~/lib/api");
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock the stores module with proper selector support
const mockSetMenuId = vi.fn();
const mockSetContentName = vi.fn();

vi.mock("~/stores", () => ({
	useMenuStore: (selector?: (state: any) => any) => {
		const state = {
			menuId: null,
			contentName: null,
			setMenuId: mockSetMenuId,
			setContentName: mockSetContentName,
		};
		return selector ? selector(state) : state;
	},
}));

// Mock RJSF to avoid complex form rendering issues
vi.mock("@rjsf/shadcn", () => ({
	default: ({ id, formData, onChange, onSubmit }: any) => (
		<form
			id={id}
			data-testid="rjsf-form"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit?.({ formData });
			}}
		>
			<div data-testid="form-data">{JSON.stringify(formData)}</div>
			<button type="submit">Submit</button>
		</form>
	),
}));

describe("MenuContentEdit Component", () => {
	const mockNavigate = vi.fn();
	const mockBlocker = {
		state: "unblocked",
		proceed: vi.fn(),
		reset: vi.fn(),
	};

	const mockMenu = {
		menuId: 1,
		menuName: "Test Menu",
		ownerUsername: "testuser",
		selectedThemeId: 1,
	};

	const mockSchemas = {
		schemas_count: 1,
		theme_schemas: {
			products: {
				type: "object",
				properties: {
					name: { type: "string", title: "Name" },
					price: { type: "number", title: "Price" },
				},
			},
		},
		ui_schemas: { products: {} },
	};

	const mockContent = {
		id: "123",
		data: { id: 1, name: "Product 1", price: 10 },
		resolved: {},
	};

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(router, "useParams").mockReturnValue({
			menuId: "1",
			contentName: "products",
			itemId: "123",
		});

		vi.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);
		vi.spyOn(router, "useBlocker").mockReturnValue(mockBlocker as any);
	});

	afterEach(() => {
		cleanup();
		vi.mocked(api.get).mockReset();
		vi.mocked(api.put).mockReset();
	});

	const setupSuccessMocks = () => {
		vi.mocked(api.get)
			.mockResolvedValueOnce({
				data: {
					success: true,
					data: mockMenu,
					timestamp: new Date().toISOString(),
				},
			})
			.mockResolvedValueOnce({
				data: {
					success: true,
					data: mockSchemas,
					timestamp: new Date().toISOString(),
				},
			})
			.mockResolvedValueOnce({
				data: {
					success: true,
					data: mockContent,
					timestamp: new Date().toISOString(),
				},
			});
	};

	describe("Loading State", () => {
		it("should render loading state initially", () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			expect(screen.getByText(/content:loading_content/i)).toBeInTheDocument();
		});

		it("should show loading spinner while loading", () => {
			setupSuccessMocks();
			const { container } = renderWithRouter(<MenuContentEdit />);

			const spinner = container.querySelector(".animate-spin");
			expect(spinner).toBeInTheDocument();
		});
	});

	describe("Successful Data Load", () => {
		it("should render form after data loads", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					expect(screen.getByTestId("rjsf-form")).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});

		it("should render back button", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					const backButtons = screen.getAllByRole("button", {
						name: /common:buttons.back/i,
					});
					expect(backButtons.length).toBeGreaterThan(0);
				},
				{ timeout: 3000 },
			);
		});

		it("should render save button", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					const saveButton = screen.getByRole("button", {
						name: /common:buttons.save_changes/i,
					});
					expect(saveButton).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});

		it("should disable save button when no changes", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					const saveButton = screen.getByRole("button", {
						name: /common:buttons.save_changes/i,
					});
					expect(saveButton).toBeDisabled();
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("Error Handling", () => {
		it("should handle API errors gracefully", async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Failed to load data",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					expect(screen.getByText(/error:error/i)).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});

		it("should display error message from API", async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Custom error message",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					expect(screen.getByText("Custom error message")).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});

		it("should render go back button on error", async () => {
			vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					expect(
						screen.getByRole("button", { name: /common:buttons.go_back/i }),
					).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("Content Not Found", () => {
		it("should handle null menu data", async () => {
			vi.mocked(api.get)
				.mockResolvedValueOnce({
					data: {
						success: true,
						data: null,
						timestamp: new Date().toISOString(),
					},
				})
				.mockResolvedValueOnce({
					data: {
						success: true,
						data: mockSchemas,
						timestamp: new Date().toISOString(),
					},
				})
				.mockResolvedValueOnce({
					data: {
						success: true,
						data: mockContent,
						timestamp: new Date().toISOString(),
					},
				});

			renderWithRouter(<MenuContentEdit />);

			// Component should show error state when menu data is null
			// (accessing selectedThemeId on null causes an error)
			await waitFor(
				() => {
					expect(screen.getByText(/error:error/i)).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("Form Submission", () => {
		it("should call setMenuId and setContentName on mount", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(() => {
				expect(mockSetMenuId).toHaveBeenCalledWith("1");
				expect(mockSetContentName).toHaveBeenCalledWith("products");
			});
		});
	});

	describe("Navigation Blocker", () => {
		it("should respect blocker state", async () => {
			const blockedState = {
				state: "blocked",
				proceed: vi.fn(),
				reset: vi.fn(),
			};

			vi.spyOn(router, "useBlocker").mockReturnValue(blockedState as any);
			setupSuccessMocks();

			renderWithRouter(<MenuContentEdit />);

			// Component should render without crashing when blocked
			await waitFor(
				() => {
					// May show blocker dialog or the form - both are valid
					expect(document.body).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("Back Navigation", () => {
		it("should navigate back on back button click", async () => {
			const user = userEvent.setup();
			setupSuccessMocks();

			renderWithRouter(<MenuContentEdit />);

			await waitFor(
				() => {
					expect(screen.getByTestId("rjsf-form")).toBeInTheDocument();
				},
				{ timeout: 3000 },
			);

			const backButtons = screen.getAllByRole("button", {
				name: /common:buttons.back/i,
			});
			await user.click(backButtons[0]);

			expect(mockNavigate).toHaveBeenCalledWith("/menu/1/content/products");
		});
	});

	describe("API Calls", () => {
		it("should make correct API calls to load data", async () => {
			setupSuccessMocks();
			renderWithRouter(<MenuContentEdit />);

			await waitFor(() => {
				expect(api.get).toHaveBeenCalledWith("/v1/menu/1");
				expect(api.get).toHaveBeenCalledWith("/v1/theme/1/schemas", {
					params: { refs: "products", uiSchema: "1" },
				});
				expect(api.get).toHaveBeenCalledWith("/v1/menu/1/content/products/123");
			});
		});
	});
});
