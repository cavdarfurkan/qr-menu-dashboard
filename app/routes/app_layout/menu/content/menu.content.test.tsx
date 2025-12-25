import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import MenuContent, { clientLoader } from "./menu.content";
import api from "~/lib/api";
import * as router from "react-router";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Helper to create mock route props for MenuContent
const createMenuContentProps = (loaderData: any) => ({
	loaderData,
	params: { menuId: "1", contentName: "products" },
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
			id: "routes/app_layout.menu.content",
			params: { menuId: "1", contentName: "products" } as Record<
				string,
				string | undefined
			>,
			pathname: "/menu/1/content/products",
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

describe("MenuContent Route", () => {
	const mockRevalidate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(router, "useParams").mockReturnValue({
			menuId: "1",
			contentName: "products",
		});

		vi.spyOn(router, "useRevalidator").mockReturnValue({
			revalidate: mockRevalidate,
			state: "idle",
		});
	});

	describe("clientLoader", () => {
		it("should load menu, schemas, and content successfully", async () => {
			const mockMenu = {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			};

			const mockSchemas = {
				schemas_count: 1,
				theme_schemas: { products: { type: "object" } },
				ui_schemas: { products: {} },
			};

			const mockContent = [
				{ id: "1", data: { id: 1, name: "Product 1", price: 10 } },
				{ id: "2", data: { id: 2, name: "Product 2", price: 20 } },
			];

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

			const result = await clientLoader({
				params: { menuId: "1", contentName: "products" },
			} as any);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockContent);
			expect(result.schemas_count).toBe(1);
		});

		it("should handle menu loading failure", async () => {
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
				params: { menuId: "999", contentName: "products" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Menu not found");
		});

		it("should continue with empty schemas on schema loading failure", async () => {
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
				.mockRejectedValueOnce(new Error("Schema error"))
				.mockResolvedValueOnce({
					data: {
						success: true,
						data: [],
						timestamp: new Date().toISOString(),
					},
				});

			const result = await clientLoader({
				params: { menuId: "1", contentName: "products" },
			} as any);

			expect(result.schemas_count).toBe(0);
		});

		it("should handle content loading failure", async () => {
			const mockMenu = {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			};

			const mockSchemas = {
				schemas_count: 1,
				theme_schemas: { products: { type: "object" } },
				ui_schemas: { products: {} },
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
				})
				.mockRejectedValueOnce({
					response: {
						data: {
							success: false,
							message: "Content not found",
							timestamp: new Date().toISOString(),
						},
					},
					isAxiosError: true,
				});

			const result = await clientLoader({
				params: { menuId: "1", contentName: "products" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Content not found");
		});

		it("should handle unexpected errors during content loading", async () => {
			const mockMenu = {
				menuId: 1,
				menuName: "Test Menu",
				ownerUsername: "testuser",
				selectedThemeId: 1,
			};

			const mockSchemas = {
				schemas_count: 1,
				theme_schemas: { products: { type: "object" } },
				ui_schemas: { products: {} },
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
				})
				.mockRejectedValueOnce(new Error("Unexpected error"));

			const result = await clientLoader({
				params: { menuId: "1", contentName: "products" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Failed to load content data");
		});

		it("should return menu not successful if menu response fails", async () => {
			vi.mocked(api.get).mockResolvedValueOnce({
				data: {
					success: false,
					message: "Menu error",
					data: null,
					timestamp: new Date().toISOString(),
				},
			});

			const result = await clientLoader({
				params: { menuId: "1", contentName: "products" },
			} as any);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Menu error");
		});
	});

	describe("MenuContent Component", () => {
		const defaultLoaderData = {
			success: true,
			message: "Success",
			data: [
				{ id: "1", data: { id: 1, name: "Product 1", price: 10 } },
				{ id: "2", data: { id: 2, name: "Product 2", price: 20 } },
			],
			timestamp: new Date().toISOString(),
			schemas_count: 1,
			theme_schemas: { products: { type: "object" } },
			ui_schemas: { products: {} },
		};

		describe("Empty State", () => {
			it("should render empty state when no content", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [],
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(
					screen.getByText(/common:empty_states.no_content_found/i),
				).toBeInTheDocument();
				expect(
					screen.getByText(/content:no_content_description/i),
				).toBeInTheDocument();
			});

			it("should render add new content button in empty state", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [],
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(
					screen.getByText(/content:add_new_content/i),
				).toBeInTheDocument();
			});

			it("should render create new content link in empty state", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [],
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(
					screen.getByText(/content:create_new_content/i),
				).toBeInTheDocument();
			});

			it("should render FileX icon in empty state", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [],
				};

				const { container } = renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				// Check for the icon container
				const icon = container.querySelector("svg");
				expect(icon).toBeInTheDocument();
			});
		});

		describe("Content Table", () => {
			it("should render content table when data exists", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				expect(screen.getByText("Product 1")).toBeInTheDocument();
				expect(screen.getByText("Product 2")).toBeInTheDocument();
			});

			it("should render table with checkboxes for selection", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				expect(checkboxes.length).toBeGreaterThan(0);
			});

			it("should render header checkbox for select all", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				expect(checkboxes[0]).toHaveAttribute(
					"aria-label",
					"common:actions.select_all",
				);
			});

			it("should render row checkboxes with correct aria-label", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				const rowCheckboxes = checkboxes.filter(
					(cb) => cb.getAttribute("aria-label") === "common:actions.select_row",
				);
				expect(rowCheckboxes.length).toBe(2);
			});

			it("should render actions column header", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				expect(screen.getByText("common:actions.actions")).toBeInTheDocument();
			});

			it("should render title with content name", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				expect(screen.getByText(/menu:content_title/i)).toBeInTheDocument();
			});
		});

		describe("Row Selection", () => {
			it("should show delete selected button when items are selected", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[1]); // Click first item checkbox

				await waitFor(() => {
					expect(screen.getByText(/menu:delete_selected/i)).toBeInTheDocument();
				});
			});

			it("should select all rows when header checkbox is clicked", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[0]); // Click select all

				await waitFor(() => {
					const rowCheckboxes = screen.getAllByRole("checkbox");
					// All checkboxes should be checked
					rowCheckboxes.forEach((cb) => {
						expect(cb).toBeChecked();
					});
				});
			});

			it("should handle select all toggle", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[0]); // Select all

				// Verify selection happened
				await waitFor(() => {
					const rowCheckboxes = screen.getAllByRole("checkbox");
					expect(rowCheckboxes[0]).toBeChecked();
				});
			});
		});

		describe("Pagination", () => {
			it("should render pagination controls", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				expect(
					screen.getByText(/common:buttons.previous/i),
				).toBeInTheDocument();
				expect(screen.getByText(/common:buttons.next/i)).toBeInTheDocument();
			});

			it("should disable previous button on first page", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const prevButton = screen.getByRole("button", {
					name: /common:buttons.previous/i,
				});
				expect(prevButton).toBeDisabled();
			});
		});

		describe("Error State", () => {
			it("should render error message on failure", () => {
				const loaderData = {
					success: false,
					message: "Failed to load content",
					data: null,
					timestamp: new Date().toISOString(),
					schemas_count: 0,
					theme_schemas: {},
					ui_schemas: {},
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(screen.getByText("Failed to load content")).toBeInTheDocument();
			});
		});

		describe("Actions Dropdown", () => {
			it("should render actions dropdown for each row", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button");
				const dropdownTriggers = actionButtons.filter(
					(btn) =>
						btn.querySelector("svg") &&
						btn.getAttribute("class")?.includes("h-8"),
				);

				expect(dropdownTriggers.length).toBe(2); // One per row
			});

			it("should open dropdown when action button is clicked", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				// Find action buttons (ones with MoreHorizontal icon)
				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				await waitFor(() => {
					expect(screen.getByText(/common:buttons.edit/i)).toBeInTheDocument();
					expect(
						screen.getByText(/common:buttons.delete/i),
					).toBeInTheDocument();
				});
			});

			it("should render edit link in dropdown", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				await waitFor(() => {
					const editLink = screen.getByRole("menuitem", {
						name: /common:buttons.edit/i,
					});
					expect(editLink).toHaveAttribute(
						"href",
						"/menu/1/content/products/edit/1",
					);
				});
			});
		});

		describe("Delete Confirmation", () => {
			it("should open delete dialog when single delete is clicked", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				// Open dropdown
				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				// Click delete
				const deleteButton = await screen.findByRole("menuitem", {
					name: /common:buttons.delete/i,
				});
				await user.click(deleteButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});
			});

			it("should show delete item description in dialog", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				const deleteButton = await screen.findByRole("menuitem", {
					name: /common:buttons.delete/i,
				});
				await user.click(deleteButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.delete_item/i),
					).toBeInTheDocument();
					expect(
						screen.getByText(/common:confirmations.cannot_be_undone/i),
					).toBeInTheDocument();
				});
			});

			it("should close delete dialog on cancel", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				const deleteButton = await screen.findByRole("menuitem", {
					name: /common:buttons.delete/i,
				});
				await user.click(deleteButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				const cancelButton = screen.getByRole("button", {
					name: /common:buttons.cancel/i,
				});
				await user.click(cancelButton);

				await waitFor(() => {
					expect(
						screen.queryByText(/common:confirmations.are_you_sure/i),
					).not.toBeInTheDocument();
				});
			});

			it("should delete single item on confirm", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				const deleteMenuItem = await screen.findByRole("menuitem", {
					name: /common:buttons.delete/i,
				});
				await user.click(deleteMenuItem);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				// Find the confirm delete button in dialog
				const dialogButtons = screen.getAllByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(dialogButtons[dialogButtons.length - 1]);

				await waitFor(() => {
					expect(api.delete).toHaveBeenCalledWith(
						"/v1/menu/1/content/products/1",
					);
				});
			});

			it("should call revalidate after successful delete", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const actionButtons = screen.getAllByRole("button", {
					name: /common:actions.open_menu/i,
				});
				await user.click(actionButtons[0]);

				const deleteMenuItem = await screen.findByRole("menuitem", {
					name: /common:buttons.delete/i,
				});
				await user.click(deleteMenuItem);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				const dialogButtons = screen.getAllByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(dialogButtons[dialogButtons.length - 1]);

				await waitFor(() => {
					expect(mockRevalidate).toHaveBeenCalled();
				});
			});
		});

		describe("Bulk Delete", () => {
			it("should open bulk delete dialog when delete selected is clicked", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				// Select an item
				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[1]);

				// Click delete selected button
				const deleteSelectedButton =
					await screen.findByText(/menu:delete_selected/i);
				await user.click(deleteSelectedButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});
			});

			it("should show bulk delete description with count", async () => {
				const user = userEvent.setup();

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				// Select multiple items
				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[0]); // Select all

				const deleteSelectedButton =
					await screen.findByText(/menu:delete_selected/i);
				await user.click(deleteSelectedButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.delete_items/i),
					).toBeInTheDocument();
				});
			});

			it("should call bulk delete API when confirmed", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				// Select all items
				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[0]);

				const deleteSelectedButton =
					await screen.findByText(/menu:delete_selected/i);
				await user.click(deleteSelectedButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				const dialogButtons = screen.getAllByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(dialogButtons[dialogButtons.length - 1]);

				await waitFor(() => {
					expect(api.delete).toHaveBeenCalled();
				});
			});

			it("should clear selection after successful bulk delete", async () => {
				const user = userEvent.setup();
				vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				const checkboxes = screen.getAllByRole("checkbox");
				await user.click(checkboxes[0]); // Select all

				const deleteSelectedButton =
					await screen.findByText(/menu:delete_selected/i);
				await user.click(deleteSelectedButton);

				await waitFor(() => {
					expect(
						screen.getByText(/common:confirmations.are_you_sure/i),
					).toBeInTheDocument();
				});

				const dialogButtons = screen.getAllByRole("button", {
					name: /common:buttons.delete/i,
				});
				await user.click(dialogButtons[dialogButtons.length - 1]);

				await waitFor(() => {
					// Delete selected button should disappear after deletion
					expect(
						screen.queryByText(/menu:delete_selected/i),
					).not.toBeInTheDocument();
				});
			});
		});

		describe("Cell Rendering", () => {
			it("should render numeric values", () => {
				renderWithRouter(
					<MenuContent {...createMenuContentProps(defaultLoaderData)} />,
				);

				expect(screen.getByText("10")).toBeInTheDocument();
				expect(screen.getByText("20")).toBeInTheDocument();
			});

			it("should render null values as dash", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [
						{ id: "1", data: { id: 1, name: "Product 1", description: null } },
					],
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(screen.getByText("-")).toBeInTheDocument();
			});

			it("should render resolved relation data", () => {
				const loaderData = {
					...defaultLoaderData,
					data: [
						{
							id: "1",
							data: { id: 1, name: "Product 1" },
							resolved: { category: { name: "Category 1" } },
						},
					],
				};

				renderWithRouter(
					<MenuContent {...createMenuContentProps(loaderData)} />,
				);

				expect(screen.getByText("Product 1")).toBeInTheDocument();
				// Category is rendered as JSON in a pre tag, so we need to check for the text content
				expect(screen.getByText(/Category 1/)).toBeInTheDocument();
			});
		});
	});
});
