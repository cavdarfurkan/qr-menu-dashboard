import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Menu, { clientLoader } from "./menu";
import api from "~/lib/api";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

vi.mock("~/lib/api");

describe("Menu Route", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("clientLoader", () => {
		it("should load menus successfully", async () => {
			const mockMenus = [
				{ menuId: 1, menuName: "Menu 1", isLatest: true },
				{ menuId: 2, menuName: "Menu 2", isLatest: true },
			];

			vi.mocked(api.get).mockResolvedValue({
				data: {
					success: true,
					message: "Success",
					data: mockMenus,
					timestamp: new Date().toISOString(),
				},
			});

			const result = await clientLoader();

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockMenus);
		});

		it("should handle API errors", async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: {
					data: {
						success: false,
						message: "Failed to load menus",
						timestamp: new Date().toISOString(),
					},
				},
				isAxiosError: true,
			});

			const result = await clientLoader();

			expect(result.success).toBe(false);
			expect(result.message).toBe("Failed to load menus");
		});

		it("should handle unexpected errors", async () => {
			vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

			const result = await clientLoader();

			expect(result.success).toBe(false);
			expect(result.message).toBe("An unexpected error occurred");
		});
	});

	describe("Menu Component", () => {
		it("should render menu list", () => {
			const loaderData = {
				success: true,
				message: "Success",
				data: [
					{ menuId: 1, menuName: "Test Menu 1", isLatest: true },
					{ menuId: 2, menuName: "Test Menu 2", isLatest: true },
				],
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			expect(screen.getByText("Test Menu 1")).toBeInTheDocument();
			expect(screen.getByText("Test Menu 2")).toBeInTheDocument();
		});

		it("should render empty state when no menus", () => {
			const loaderData = {
				success: true,
				message: "Success",
				data: [],
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			expect(screen.getByText(/menu:no_menus/i)).toBeInTheDocument();
			expect(screen.getByText(/menu:create_first_menu/i)).toBeInTheDocument();
		});

		it("should render error message on failure", () => {
			const loaderData = {
				success: false,
				message: "Failed to load menus",
				data: null,
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			expect(screen.getByText("Failed to load menus")).toBeInTheDocument();
		});

		it("should render New Menu button", () => {
			const loaderData = {
				success: true,
				message: "Success",
				data: [{ menuId: 1, menuName: "Test Menu", isLatest: true }],
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			const newMenuButton = screen.getByRole("link", {
				name: /menu:new_menu/i,
			});
			expect(newMenuButton).toHaveAttribute("href", "/menu/create");
		});

		it("should render menu cards as links", () => {
			const loaderData = {
				success: true,
				message: "Success",
				data: [
					{ menuId: 1, menuName: "Test Menu 1", isLatest: true },
					{ menuId: 2, menuName: "Test Menu 2", isLatest: true },
				],
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			const links = screen.getAllByRole("link");
			// Filter out the "/menu/create" button and get only menu card links
			const menuLinks = links.filter(
				(link) =>
					link.getAttribute("href")?.startsWith("/menu/") &&
					link.getAttribute("href") !== "/menu/create",
			);

			// Assert exactly two menu links matching loaderData items
			expect(menuLinks).toHaveLength(2);

			// Derive expected hrefs from loaderData and verify they match
			const expectedHrefs = loaderData.data.map(
				(menu) => `/menu/${menu.menuId}`,
			);
			const actualHrefs = menuLinks
				.map((link) => link.getAttribute("href"))
				.sort();

			expect(actualHrefs).toEqual([...expectedHrefs].sort());
		});

		it("should render title", () => {
			const loaderData = {
				success: true,
				message: "Success",
				data: [],
				timestamp: new Date().toISOString(),
			};

			renderWithRouter(<Menu {...({ loaderData } as any)} />);

			expect(screen.getByText("menu:title")).toBeInTheDocument();
		});
	});
});
