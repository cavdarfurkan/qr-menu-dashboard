import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import * as router from "react-router";

// Mock the sidebar UI components - must be before the import
vi.mock("~/components/ui/sidebar", () => ({
	Sidebar: ({ children }: any) =>
		React.createElement("aside", { "data-testid": "sidebar" }, children),
	SidebarContent: ({ children }: any) =>
		React.createElement("div", { "data-testid": "sidebar-content" }, children),
	SidebarFooter: () =>
		React.createElement("footer", { "data-testid": "sidebar-footer" }),
	SidebarGroup: ({ children }: any) =>
		React.createElement("div", { "data-testid": "sidebar-group" }, children),
	SidebarGroupContent: ({ children }: any) =>
		React.createElement("div", null, children),
	SidebarHeader: ({ children }: any) =>
		React.createElement(
			"header",
			{ "data-testid": "sidebar-header" },
			children,
		),
	SidebarMenu: ({ children }: any) =>
		React.createElement(
			"nav",
			{ "data-testid": "sidebar-menu", role: "navigation" },
			children,
		),
	SidebarMenuButton: ({ children, isActive, tooltip }: any) =>
		React.createElement(
			"div",
			{
				"data-testid": "sidebar-menu-button",
				"data-active": isActive ? "true" : "false",
				"data-tooltip": tooltip,
			},
			children,
		),
	SidebarMenuItem: ({ children }: any) =>
		React.createElement(
			"div",
			{ "data-testid": "sidebar-menu-item" },
			children,
		),
	SidebarTrigger: () =>
		React.createElement(
			"button",
			{ "data-testid": "sidebar-trigger", type: "button" },
			"Toggle Sidebar",
		),
	useSidebar: () => ({
		state: "expanded",
		isMobile: false,
		setOpen: vi.fn(),
		open: true,
		openMobile: false,
		setOpenMobile: vi.fn(),
		toggleSidebar: vi.fn(),
	}),
	SidebarProvider: ({ children }: any) =>
		React.createElement("div", { "data-testid": "sidebar-provider" }, children),
}));

import { AppSidebar } from "./AppSidebar";

const renderWithPath = (component: React.ReactElement, pathname = "/") => {
	vi.spyOn(router, "useLocation").mockReturnValue({
		pathname,
		search: "",
		hash: "",
		state: null,
		key: "default",
	});
	return render(component);
};

describe("AppSidebar Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render sidebar", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		});

		it("should render sidebar header", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar-header")).toBeInTheDocument();
		});

		it("should render sidebar content", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar-content")).toBeInTheDocument();
		});

		it("should render sidebar footer", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar-footer")).toBeInTheDocument();
		});

		it("should render sidebar menu", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar-menu")).toBeInTheDocument();
		});

		it("should render app name in header", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByText("common:app_name")).toBeInTheDocument();
		});

		it("should render sidebar trigger button", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();
		});
	});

	describe("Navigation Items", () => {
		it("should render dashboard link", () => {
			renderWithPath(<AppSidebar />);
			// The translation mock returns the key, which may or may not have namespace
			expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
		});

		it("should render menu link", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByText(/^menu$/i)).toBeInTheDocument();
		});

		it("should render themes link", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByText(/themes/i)).toBeInTheDocument();
		});

		it("should render settings link", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByText(/settings/i)).toBeInTheDocument();
		});

		it("should render logout link", () => {
			renderWithPath(<AppSidebar />);
			expect(screen.getByText(/logout/i)).toBeInTheDocument();
		});

		it("should render five menu items", () => {
			renderWithPath(<AppSidebar />);
			const menuItems = screen.getAllByTestId("sidebar-menu-item");
			expect(menuItems.length).toBe(5);
		});
	});

	describe("Active State", () => {
		it("should mark dashboard as active when on home page", () => {
			renderWithPath(<AppSidebar />, "/");
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			expect(menuButtons[0]).toHaveAttribute("data-active", "true");
		});

		it("should mark menu as active when on menu page", () => {
			renderWithPath(<AppSidebar />, "/menu");
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			expect(menuButtons[1]).toHaveAttribute("data-active", "true");
		});

		it("should mark themes as active when on theme page", () => {
			renderWithPath(<AppSidebar />, "/theme");
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			expect(menuButtons[2]).toHaveAttribute("data-active", "true");
		});

		it("should mark settings as active when on settings page", () => {
			renderWithPath(<AppSidebar />, "/settings");
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			expect(menuButtons[3]).toHaveAttribute("data-active", "true");
		});

		it("should mark logout as active when on logout page", () => {
			renderWithPath(<AppSidebar />, "/logout");
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			expect(menuButtons[4]).toHaveAttribute("data-active", "true");
		});
	});

	describe("Tooltips", () => {
		it("should have tooltips on menu buttons", () => {
			renderWithPath(<AppSidebar />);
			const menuButtons = screen.getAllByTestId("sidebar-menu-button");
			// Each button should have a data-tooltip attribute
			menuButtons.forEach((button) => {
				expect(button).toHaveAttribute("data-tooltip");
			});
		});
	});

	describe("Links", () => {
		it("should render links with correct hrefs", () => {
			renderWithPath(<AppSidebar />);

			const links = screen.getAllByRole("link");
			const hrefs = links.map((link) => link.getAttribute("href"));

			expect(hrefs).toContain("/");
			expect(hrefs).toContain("/menu");
			expect(hrefs).toContain("/theme");
			expect(hrefs).toContain("/settings");
			expect(hrefs).toContain("/logout");
		});
	});
});
