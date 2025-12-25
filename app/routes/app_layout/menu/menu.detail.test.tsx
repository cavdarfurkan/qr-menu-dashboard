import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import MenuDetail, { clientLoader, clientAction } from "./menu.detail";
import api from "~/lib/api";
import * as router from "react-router";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Helper to create mock route props for MenuDetail
const createMenuDetailProps = (loaderData: any) => ({
	loaderData,
	params: { id: "1" },
	matches: [
		{
			id: "root",
			params: {} as Record<string, string | undefined>,
			pathname: "/",
			data: undefined,
			loaderData: undefined,
			handle: undefined as unknown,
		},
		{
			id: "routes/protected_route",
			params: {} as Record<string, string | undefined>,
			pathname: "/",
			data: undefined,
			loaderData: undefined,
			handle: undefined as unknown,
		},
		{
			id: "routes/app_layout",
			params: {} as Record<string, string | undefined>,
			pathname: "/menu",
			data: undefined,
			loaderData: undefined,
			handle: undefined as unknown,
		},
		{
			id: "routes/app_layout.menu.detail",
			params: { id: "1" } as Record<string, string | undefined>,
			pathname: "/menu/1",
			data: undefined,
			loaderData: undefined,
			handle: undefined as unknown,
		},
	] as any,
});

vi.mock("~/lib/api");
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("MenuDetail Route", () => {
	const mockNavigate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "idle",
			submit: vi.fn(),
		} as any);
	});

	describe("clientLoader", () => {
		it("should load menu and schemas successfully", async () => {
			const mockMenu = {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			};

			const mockSchemas = {
				schemas_count: 2,
				theme_schemas: {
					products: {
						type: "object",
						properties: { name: { type: "string" } },
					},
					categories: {
						type: "object",
						properties: { title: { type: "string" } },
					},
				},
			};

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
				});

			const result = await clientLoader({
				params: { id: "1" },
			} as any);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockMenu);
			expect(result.schemas_count).toBe(2);
		});

		it("should handle API errors", async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Menu not found",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			const result = await clientLoader({
				params: { id: "999" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Menu not found");
		});

		it("should handle unexpected errors", async () => {
			vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

			const result = await clientLoader({
				params: { id: "1" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.schemas_count).toBe(0);
		});

		it("should return empty schemas on schema loading failure", async () => {
			const mockMenu = {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			};

			vi.mocked(api.get)
				.mockResolvedValueOnce({
					data: {
						success: true,
						data: mockMenu,
						timestamp: new Date().toISOString(),
					},
				})
				.mockRejectedValueOnce(new Error("Schema error"));

			const result = await clientLoader({
				params: { id: "1" },
			} as any);

			// The loader should still work but with empty schemas
			expect(result.schemas_count).toBe(0);
		});
	});

	describe("clientAction", () => {
		it("should update menu name successfully", async () => {
			vi.mocked(api.put).mockResolvedValue({
				data: {
					success: true,
					message: "Menu updated",
					data: null,
					timestamp: new Date().toISOString(),
				},
			});

			const formData = new FormData();
			formData.append("menuName", "Updated Menu Name");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
				params: { id: "1" },
			} as any);

			expect(result.success).toBe(true);
			expect(vi.mocked(api.put)).toHaveBeenCalledWith("/v1/menu/1", {
				menuName: "Updated Menu Name",
			});
		});

		it("should handle update errors", async () => {
			vi.mocked(api.put).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Update failed",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			const formData = new FormData();
			formData.append("menuName", "New Name");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
				params: { id: "1" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Update failed");
		});

		it("should handle unexpected update errors", async () => {
			vi.mocked(api.put).mockRejectedValue(new Error("Unexpected"));

			const formData = new FormData();
			formData.append("menuName", "New Name");

			const result = await clientAction({
				request: {
					formData: () => Promise.resolve(formData),
				} as any,
				params: { id: "1" },
			} as any);

			expect(result.success).toBe(false);
		});
	});

	describe("MenuDetail Component", () => {
		const defaultLoaderData = {
			success: true,
			message: "Success",
			data: {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			},
			timestamp: new Date().toISOString(),
			schemas_count: 2,
			theme_schemas: {
				products: { type: "object", properties: { name: { type: "string" } } },
				categories: {
					type: "object",
					properties: { title: { type: "string" } },
				},
			},
		};

		it("should render menu details with uppercase name", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			expect(screen.getByText("TEST MENU")).toBeInTheDocument();
		});

		it("should render error message on failure", () => {
			const loaderData = {
				success: false,
				message: "Failed to load menu",
				data: null,
				timestamp: new Date().toISOString(),
				schemas_count: 0,
				theme_schemas: {},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			expect(screen.getByText("Failed to load menu")).toBeInTheDocument();
		});

		it("should render content schemas when available", () => {
			const loaderData = {
				...defaultLoaderData,
				theme_schemas: {
					products: {
						type: "object",
						description: "Product schema",
						properties: { name: { type: "string" } },
					},
					categories: {
						type: "object",
						description: "Category schema",
						properties: { title: { type: "string" } },
					},
				},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			expect(screen.getByText("products")).toBeInTheDocument();
			expect(screen.getByText("categories")).toBeInTheDocument();
		});

		it("should render schema descriptions", () => {
			const loaderData = {
				...defaultLoaderData,
				theme_schemas: {
					products: {
						type: "object",
						description: "Product schema description",
						properties: { name: { type: "string" } },
					},
				},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			expect(
				screen.getByText("Product schema description"),
			).toBeInTheDocument();
		});

		it("should render no schemas message when schemas_count is 0", () => {
			const loaderData = {
				...defaultLoaderData,
				schemas_count: 0,
				theme_schemas: {},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			const noSchemasElements = screen.getAllByText(/menu:no_schemas/i);
			expect(noSchemasElements.length).toBeGreaterThan(0);
		});

		it("should render no schemas description", () => {
			const loaderData = {
				...defaultLoaderData,
				schemas_count: 0,
				theme_schemas: {},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			expect(
				screen.getByText(/menu:no_schemas_description/i),
			).toBeInTheDocument();
		});

		it("should render menu actions dropdown trigger", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		it("should render menu content section title", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			expect(screen.getByText(/menu:menu_content/i)).toBeInTheDocument();
		});

		it("should render refresh schemas button", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			expect(
				screen.getByText(/common:actions.refresh_schemas/i),
			).toBeInTheDocument();
		});

		it("should render view content buttons for each schema", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			const viewButtons = screen.getAllByText(/common:actions.view_content/i);
			expect(viewButtons.length).toBe(2); // products and categories
		});

		it("should render properties count for schemas", () => {
			const loaderData = {
				...defaultLoaderData,
				theme_schemas: {
					products: {
						type: "object",
						properties: {
							name: { type: "string" },
							price: { type: "number" },
						},
					},
				},
			};

			renderWithRouter(<MenuDetail {...createMenuDetailProps(loaderData)} />);

			expect(
				screen.getByText(/common:messages.properties_defined/i),
			).toBeInTheDocument();
		});

		it("should render menu name input with current value", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			const input = screen.getByDisplayValue("Test Menu");
			expect(input).toBeInTheDocument();
		});

		it("should render save button in form", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			const saveButton = screen.getByRole("button", {
				name: /common:buttons.save/i,
			});
			expect(saveButton).toBeInTheDocument();
		});

		it("should render theme selection area", () => {
			renderWithRouter(
				<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
			);

			// There should be buttons in the form including theme selection
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		describe("Delete Menu Dialog", () => {
			it("should open delete dialog when delete is triggered", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				// Find and click the dropdown trigger
				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				// Click delete menu option
				const deleteOption = await screen.findByText(/common:buttons.delete/i);
				await user.click(deleteOption);

				// Dialog should appear
				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});
			});

			it("should close delete dialog on cancel", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				// Open dropdown and click delete
				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				const deleteOption = await screen.findByText(/common:buttons.delete/i);
				await user.click(deleteOption);

				// Wait for dialog
				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				// Click cancel
				const cancelButton = screen.getByRole("button", {
					name: /common:buttons.cancel/i,
				});
				await user.click(cancelButton);

				// Dialog should close
				await waitFor(() => {
					expect(
						screen.queryByText(/common:confirmations.are_you_sure/i),
					).not.toBeInTheDocument();
				});
			});

			it("should delete menu on confirm", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				// Open dropdown and click delete
				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				const deleteOption = await screen.findByText(/common:buttons.delete/i);
				await user.click(deleteOption);

				// Wait for dialog and click confirm
				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				// Find the delete button in the dialog using scoped selector
				const dialog = screen.getByRole("alertdialog");
				const confirmDelete = within(dialog).getByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(confirmDelete);

				await waitFor(() => {
					expect(api.delete).toHaveBeenCalledWith("/v1/menu/delete/1");
				});
			});

			it("should navigate to menu list after successful delete", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				const deleteOption = await screen.findByText(/common:buttons.delete/i);
				await user.click(deleteOption);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				// Find the delete button in the dialog using scoped selector
				const dialog = screen.getByRole("alertdialog");
				const confirmDelete = within(dialog).getByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(confirmDelete);

				await waitFor(() => {
					expect(mockNavigate).toHaveBeenCalledWith("/menu", {
						replace: true,
						viewTransition: true,
					});
				});
			});
		});

		describe("Dropdown Menu", () => {
			it("should render change theme link", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				await waitFor(() => {
					expect(screen.getByText(/menu:change_theme/i)).toBeInTheDocument();
				});
			});

			it("should render build link", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				const dropdownTrigger = screen.getByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(dropdownTrigger);

				await waitFor(() => {
					expect(screen.getByText(/menu:build/i)).toBeInTheDocument();
				});
			});
		});

		describe("Content Schema Cards", () => {
			it("should render schema cards as links", () => {
				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				const links = screen.getAllByRole("link");
				const contentLinks = links.filter((link) =>
					link.getAttribute("href")?.includes("/content/"),
				);

				expect(contentLinks.length).toBeGreaterThan(0);
			});

			it("should link to correct content path", () => {
				renderWithRouter(
					<MenuDetail {...createMenuDetailProps(defaultLoaderData)} />,
				);

				const links = screen.getAllByRole("link");
				const productLink = links.find(
					(link) => link.getAttribute("href") === "/menu/1/content/products",
				);

				expect(productLink).toBeInTheDocument();
			});
		});
	});
});
