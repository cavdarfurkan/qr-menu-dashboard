import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Home, { clientLoader } from "./dashboard";
import api from "~/lib/api";
import { fetchCurrentUser } from "~/lib/auth-api";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

vi.mock("~/lib/api");
vi.mock("~/lib/auth-api");
vi.mock("~/stores", () => ({
	useUserStore: () => ({
		setUser: vi.fn(),
	}),
}));

describe("Dashboard Route", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("clientLoader", () => {
		it("should load user data successfully", async () => {
			const mockUserResponse = {
				success: true,
				message: "User retrieved",
				data: {
					id: 1,
					username: "testuser",
					email: "test@example.com",
					roles: ["USER"],
				},
				timestamp: new Date().toISOString(),
			};

			const mockMenusResponse = {
				success: true,
				message: "Menus retrieved",
				data: [
					{
						menuId: 1,
						menuName: "Test Menu 1",
						published: true,
						isLatest: true,
					},
					{
						menuId: 2,
						menuName: "Test Menu 2",
						published: false,
						isLatest: true,
					},
				],
				timestamp: new Date().toISOString(),
			};

			vi.mocked(fetchCurrentUser).mockResolvedValueOnce(mockUserResponse);
			vi.mocked(api.get).mockResolvedValueOnce({
				data: mockMenusResponse,
			});

			const result = await clientLoader();

			expect(result).toEqual({
				user: mockUserResponse,
				menus: mockMenusResponse,
			});
			expect(fetchCurrentUser).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith("/v1/menu/all");
		});

		it("should handle API errors", async () => {
			vi.mocked(fetchCurrentUser).mockRejectedValueOnce(
				new Error("Network error"),
			);
			vi.mocked(api.get).mockRejectedValueOnce(new Error("Network error"));

			const result = await clientLoader();

			expect(result.user.success).toBe(false);
			expect(result.user.message).toBe("Error loading user data");
			expect(result.menus.success).toBe(false);
			expect(result.menus.data).toEqual([]);
		});

		it("should return error message on failure", async () => {
			vi.mocked(fetchCurrentUser).mockRejectedValueOnce({
				response: {
					data: {
						message: "Unauthorized",
					},
				},
			});
			vi.mocked(api.get).mockRejectedValueOnce({
				response: {
					data: {
						message: "Unauthorized",
					},
				},
			});

			const result = await clientLoader();

			expect(result.user.success).toBe(false);
			expect(result.user.message).toBe("Error loading user data");
			expect(result.menus.success).toBe(false);
		});
	});

	describe("Home Component", () => {
		const createLoaderData = (overrides = {}) => ({
			loaderData: {
				user: {
					success: true,
					message: "User retrieved",
					data: {
						id: 1,
						username: "testuser",
						email: "test@example.com",
						roles: ["USER"],
					},
					timestamp: new Date().toISOString(),
				},
				menus: {
					success: true,
					data: [
						{
							menuId: 1,
							menuName: "Test Menu 1",
							published: true,
							isLatest: true,
						},
						{
							menuId: 2,
							menuName: "Test Menu 2",
							published: false,
							isLatest: true,
						},
					],
				},
				...overrides,
			},
		});

		it("should render title", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			expect(screen.getByText("home:title")).toBeInTheDocument();
		});

		it("should render success message with username", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			expect(screen.getByText(/home:logged_in_success/i)).toBeInTheDocument();
			expect(screen.getByText(/testuser/)).toBeInTheDocument();
		});

		it("should render success message with email", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
		});

		it("should show unknown for missing username", () => {
			const loaderData = createLoaderData({
				user: {
					success: true,
					data: {
						id: 1,
						username: undefined,
						email: "test@example.com",
						roles: ["USER"],
					},
				},
			});

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(
				screen.getByText(/common:empty_states.unknown/),
			).toBeInTheDocument();
		});

		it("should show unknown for missing email", () => {
			const loaderData = createLoaderData({
				user: {
					success: true,
					data: {
						id: 1,
						username: "testuser",
						email: undefined,
						roles: ["USER"],
					},
				},
			});

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(
				screen.getByText(/common:empty_states.unknown/),
			).toBeInTheDocument();
		});

		it("should show unknown when user data is missing", () => {
			const loaderData = createLoaderData({
				user: {
					success: true,
					data: undefined,
				},
			});

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			// Should show at least one "unknown" text for missing user info
			const unknownTexts = screen.getAllByText(/common:empty_states.unknown/);
			expect(unknownTexts.length).toBeGreaterThan(0);
		});

		it("should render View All Menus link in QuickActionsWidget", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			const menuLink = screen.getByRole("link", {
				name: /home:view_all_menus/i,
			});
			expect(menuLink).toHaveAttribute("href", "/menu");
		});

		it("should render Settings button in QuickActionsWidget", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			const settingsLink = screen.getByRole("link", { name: /home:settings/i });
			expect(settingsLink).toHaveAttribute("href", "/settings");
		});

		it("should render all QuickActionsWidget buttons", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			// New Menu button
			expect(
				screen.getByRole("link", { name: /menu:new_menu/i }),
			).toHaveAttribute("href", "/menu/create");

			// Manage Themes button
			expect(
				screen.getByRole("link", { name: /home:manage_themes/i }),
			).toHaveAttribute("href", "/theme");

			// View All Menus button
			expect(
				screen.getByRole("link", { name: /home:view_all_menus/i }),
			).toHaveAttribute("href", "/menu");

			// Settings button
			expect(
				screen.getByRole("link", { name: /home:settings/i }),
			).toHaveAttribute("href", "/settings");
		});

		it("should render buttons with viewTransition attribute", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			const links = screen.getAllByRole("link");
			expect(links.length).toBeGreaterThan(0);
		});

		it("should have success styling on logged in message", () => {
			const { container } = renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			const successBox = container.querySelector(".bg-green-50");
			expect(successBox).toBeInTheDocument();
		});

		it("should render StatsWidget with correct counts", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			// Check that stats widget title is rendered
			expect(screen.getByText("home:stats_widget_title")).toBeInTheDocument();

			// Check that stat labels are rendered
			expect(screen.getByText("home:total_menus")).toBeInTheDocument();
			expect(screen.getByText("home:published_menus")).toBeInTheDocument();
			expect(screen.getByText("home:unpublished_menus")).toBeInTheDocument();

			// Check that counts are displayed (2 total, 1 published, 1 unpublished)
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("should render QuickActionsWidget", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			expect(screen.getByText("home:quick_actions_title")).toBeInTheDocument();
		});

		it("should render MenuPreviewWidget with published menus", () => {
			renderWithRouter(
				<Home {...({ loaderData: createLoaderData() } as any)} />,
			);

			expect(screen.getByText("home:menu_preview_title")).toBeInTheDocument();
			expect(screen.getByText("Test Menu 1")).toBeInTheDocument();
			// Test Menu 2 should not be visible as it's unpublished
			expect(screen.queryByText("Test Menu 2")).not.toBeInTheDocument();
		});

		it("should render MenuPreviewWidget empty state when no published menus", () => {
			const loaderData = createLoaderData({
				menus: {
					success: true,
					data: [
						{ menuId: 1, menuName: "Test Menu 1", published: false },
						{ menuId: 2, menuName: "Test Menu 2", published: false },
					],
				},
			});

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(screen.getByText("home:menu_preview_title")).toBeInTheDocument();
			expect(screen.getByText("home:no_published_menus")).toBeInTheDocument();
		});

		it("should handle loaderData without user data", () => {
			const loaderData = {
				loaderData: {
					user: {
						success: false,
						data: undefined,
					},
					menus: { success: false, data: [] },
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			// Should show at least one "unknown" text
			const unknownTexts = screen.getAllByText(/common:empty_states.unknown/);
			expect(unknownTexts.length).toBeGreaterThan(0);
		});

		it("should handle null loaderData", () => {
			const loaderData = {
				loaderData: null,
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(screen.getByText("home:title")).toBeInTheDocument();
		});
	});
});
