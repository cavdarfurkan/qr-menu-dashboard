import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import MenuCreate, { clientAction } from "./menu.create";
import api from "~/lib/api";
import * as router from "react-router";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

vi.mock("~/lib/api");

describe("MenuCreate Route", () => {
	const mockNavigate = vi.fn();
	const mockSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "idle",
			submit: mockSubmit,
		} as any);
	});

	describe("clientAction", () => {
		it("should create menu successfully", async () => {
			vi.mocked(api.post).mockResolvedValue({
				data: {
					success: true,
					message: "Menu created",
					data: { menuId: 1 },
					timestamp: new Date().toISOString(),
				},
			});

			const formData = new FormData();
			formData.append("name", "New Menu");
			formData.append("selectedThemeId", "1");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
			} as any);

			expect(result.success).toBe(true);
			expect(api.post).toHaveBeenCalledWith("/v1/menu/create", {
				menu_name: "New Menu",
				selected_theme_id: "1",
			});
		});

		it("should handle API errors", async () => {
			vi.mocked(api.post).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Menu name already exists",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			const formData = new FormData();
			formData.append("name", "Existing Menu");
			formData.append("selectedThemeId", "1");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Menu name already exists");
		});

		it("should handle unexpected errors", async () => {
			vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

			const formData = new FormData();
			formData.append("name", "Test Menu");
			formData.append("selectedThemeId", "1");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
			} as any);

			expect(result.success).toBe(false);
		});
	});

	describe("MenuCreate Component", () => {
		it("should render back button", () => {
			renderWithRouter(<MenuCreate />);

			expect(screen.getByText(/common:buttons.back/i)).toBeInTheDocument();
		});

		it("should render menu name input", () => {
			renderWithRouter(<MenuCreate />);

			// Look for any textbox
			const inputs = screen.getAllByRole("textbox");
			expect(inputs.length).toBeGreaterThan(0);
		});

		it("should render select theme button", () => {
			renderWithRouter(<MenuCreate />);

			// There should be buttons for theme selection
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(1);
		});

		it("should render submit button", () => {
			renderWithRouter(<MenuCreate />);

			expect(
				screen.getByRole("button", { name: /common:buttons.submit/i }),
			).toBeInTheDocument();
		});

		it("should render cancel button", () => {
			renderWithRouter(<MenuCreate />);

			expect(
				screen.getByRole("button", { name: /common:buttons.cancel/i }),
			).toBeInTheDocument();
		});

		describe("Form Validation", () => {
			it("should not submit with invalid data", async () => {
				const user = userEvent.setup();

				renderWithRouter(<MenuCreate />);

				const inputs = screen.getAllByRole("textbox");
				if (inputs[0]) {
					await user.type(inputs[0], "ab"); // Too short
				}

				const submitButton = screen.getByRole("button", {
					name: /common:buttons.submit/i,
				});
				await user.click(submitButton);

				// Form should not be submitted due to validation
				expect(mockSubmit).not.toHaveBeenCalled();
			});
		});

		describe("Form Submission", () => {
			it("should navigate to menu list on successful creation", async () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: {
						success: true,
						message: "Menu created",
						data: { menuId: 1 },
					},
					state: "idle",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				await waitFor(() => {
					expect(mockNavigate).toHaveBeenCalledWith("/menu", { replace: true });
				});
			});

			it("should display error message on failure", async () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: {
						success: false,
						message: "Failed to create menu",
					},
					state: "idle",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				expect(screen.getByText("Failed to create menu")).toBeInTheDocument();
			});
		});

		describe("Loading State", () => {
			it("should disable inputs when loading", () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: null,
					state: "submitting",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				const inputs = screen.getAllByRole("textbox");
				expect(inputs[0]).toBeDisabled();
			});

			it("should disable submit button when loading", () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: null,
					state: "submitting",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				const submitButton = screen.getByRole("button", {
					name: /common:buttons.submit/i,
				});
				expect(submitButton).toBeDisabled();
			});

			it("should disable cancel button when loading", () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: null,
					state: "loading",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				const cancelButton = screen.getByRole("button", {
					name: /common:buttons.cancel/i,
				});
				expect(cancelButton).toBeDisabled();
			});
		});

		describe("Theme Selection", () => {
			it("should render select theme dialog trigger", () => {
				renderWithRouter(<MenuCreate />);

				const themeButton = screen.getByRole("button", {
					name: /common:labels.select_theme/i,
				});
				expect(themeButton).toBeInTheDocument();
			});

			it("should be a button type (not submit)", () => {
				renderWithRouter(<MenuCreate />);

				const themeButton = screen.getByRole("button", {
					name: /common:labels.select_theme/i,
				});
				expect(themeButton).toHaveAttribute("type", "button");
			});
		});

		describe("Back Button Navigation", () => {
			it("should render back button with link", () => {
				renderWithRouter(<MenuCreate />);

				// BackButton component renders a link
				const backLink = screen.getByText(/common:buttons.back/i);
				expect(backLink).toBeInTheDocument();
			});
		});

		describe("Error Display", () => {
			it("should display fetcher error if present", () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: {
						error: "Some fetcher error",
					},
					state: "idle",
					submit: mockSubmit,
				} as any);

				renderWithRouter(<MenuCreate />);

				expect(screen.getByText("Some fetcher error")).toBeInTheDocument();
			});

			it("should have error styling", () => {
				vi.spyOn(router, "useFetcher").mockReturnValue({
					data: {
						success: false,
						message: "Error message",
					},
					state: "idle",
					submit: mockSubmit,
				} as any);

				const { container } = renderWithRouter(<MenuCreate />);

				const errorBox = container.querySelector(".bg-red-50");
				expect(errorBox).toBeInTheDocument();
			});
		});
	});
});
