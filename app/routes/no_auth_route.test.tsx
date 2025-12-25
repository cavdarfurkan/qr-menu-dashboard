import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NoAuthRoute from "./no_auth_route";
import * as AuthContext from "../auth_context";

// Mock the auth context
vi.mock("../auth_context", () => ({
	useAuth: vi.fn(),
}));

// Mock Navigate and Outlet
vi.mock("react-router", () => ({
	Navigate: ({ to }: { to: string }) => (
		<div data-testid="navigate">Redirecting to {to}</div>
	),
	Outlet: () => <div data-testid="outlet">Auth Content</div>,
	MemoryRouter: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe("NoAuthRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should redirect to home when authenticated", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: "valid-token",
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<NoAuthRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("navigate")).toHaveTextContent(
			"Redirecting to /",
		);
	});

	it("should render Outlet when not authenticated", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: null,
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<NoAuthRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("outlet")).toBeInTheDocument();
		expect(screen.getByTestId("outlet")).toHaveTextContent("Auth Content");
	});

	it("should not render auth content when authenticated", () => {
		(AuthContext.useAuth as any).mockReturnValue({
			accessToken: "some-token",
			setAccessToken: vi.fn(),
			logout: vi.fn(),
		});

		render(
			<MemoryRouter>
				<NoAuthRoute />
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
				<NoAuthRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("outlet")).toBeInTheDocument();
	});
});
