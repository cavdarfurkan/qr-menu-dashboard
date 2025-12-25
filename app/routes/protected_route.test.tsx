import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router";
import ProtectedRoute from "./protected_route";
import * as AuthContext from "../auth_context";

// Mock the auth context
vi.mock("../auth_context", () => ({
	useAuth: vi.fn(),
}));

// Mock Navigate component
vi.mock("react-router", () => ({
	Navigate: ({ to }: { to: string }) => (
		<div data-testid="navigate">Redirecting to {to}</div>
	),
	Outlet: () => <div data-testid="outlet">Protected Content</div>,
	MemoryRouter: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should redirect to login when no access token", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: null,
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<ProtectedRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("navigate")).toHaveTextContent(
			"Redirecting to /login",
		);
	});

	it("should render Outlet when authenticated", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: "valid-token",
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<ProtectedRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("outlet")).toBeInTheDocument();
		expect(screen.getByTestId("outlet")).toHaveTextContent("Protected Content");
	});

	it("should not render protected content when not authenticated", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: null,
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<ProtectedRoute />
			</MemoryRouter>,
		);

		expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
	});

	it("should handle empty string token as falsy", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: "",
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<ProtectedRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("navigate")).toBeInTheDocument();
	});
});
