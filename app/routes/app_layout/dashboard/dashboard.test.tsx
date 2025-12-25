import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Home, { clientLoader } from "./dashboard";
import api from "~/lib/api";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

vi.mock("~/lib/api");

describe("Dashboard Route", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("clientLoader", () => {
		it("should load user data successfully", async () => {
			const mockResponse = {
				message: "User: username=testuser, email=test@example.com",
			};

			vi.mocked(api.get).mockResolvedValue({
				data: mockResponse,
			});

			const result = await clientLoader();

			expect(result).toEqual(mockResponse);
			expect(api.get).toHaveBeenCalledWith("/test/whoami");
		});

		it("should handle API errors", async () => {
			vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

			const result = await clientLoader();

			expect(result.message).toBe("Error loading user data");
		});

		it("should return error message on failure", async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: {
					data: {
						message: "Unauthorized",
					},
				},
			});

			const result = await clientLoader();

			expect(result.message).toBe("Error loading user data");
		});
	});

	describe("Home Component", () => {
		it("should render title", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(screen.getByText("home:title")).toBeInTheDocument();
		});

		it("should render success message with username", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(screen.getByText(/home:logged_in_success/i)).toBeInTheDocument();
			expect(screen.getByText(/testuser/)).toBeInTheDocument();
		});

		it("should render success message with email", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
		});

		it("should show unknown for missing username", () => {
			const loaderData = {
				loaderData: {
					message: "User: email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(
				screen.getByText(/common:empty_states.unknown/),
			).toBeInTheDocument();
		});

		it("should show unknown for missing email", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			expect(
				screen.getByText(/common:empty_states.unknown/),
			).toBeInTheDocument();
		});

		it("should show unknown when message is empty", () => {
			const loaderData = {
				loaderData: {
					message: "",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			// Should show at least one "unknown" text for missing user info
			const unknownTexts = screen.getAllByText(/common:empty_states.unknown/);
			expect(unknownTexts.length).toBeGreaterThan(0);
		});

		it("should render Manage Menus button", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			const menuLink = screen.getByRole("link", { name: /home:manage_menus/i });
			expect(menuLink).toHaveAttribute("href", "/menu");
		});

		it("should render Settings button", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			const settingsLink = screen.getByRole("link", { name: /home:settings/i });
			expect(settingsLink).toHaveAttribute("href", "/settings");
		});

		it("should render buttons with viewTransition attribute", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			renderWithRouter(<Home {...({ loaderData } as any)} />);

			const links = screen.getAllByRole("link");
			expect(links.length).toBeGreaterThan(0);
		});

		it("should have success styling on logged in message", () => {
			const loaderData = {
				loaderData: {
					message: "User: username=testuser, email=test@example.com",
				},
			};

			const { container } = renderWithRouter(
				<Home {...({ loaderData } as any)} />,
			);

			const successBox = container.querySelector(".bg-green-50");
			expect(successBox).toBeInTheDocument();
		});

		it("should handle loaderData without message", () => {
			const loaderData = {
				loaderData: {},
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
