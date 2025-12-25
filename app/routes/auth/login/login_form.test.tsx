import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import LoginForm from "./login_form";
import * as router from "react-router";
import * as authContext from "~/auth_context";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock CSRF
vi.mock("~/lib/csrf", () => ({
	fetchCsrfToken: vi.fn(() => Promise.resolve()),
}));

describe("LoginForm", () => {
	const mockNavigate = vi.fn();
	const mockSetAccessToken = vi.fn();
	const mockSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "idle",
			submit: mockSubmit,
		} as any);

		vi.spyOn(authContext, "useAuth").mockReturnValue({
			accessToken: null,
			setAccessToken: mockSetAccessToken,
			logout: vi.fn(),
		});
	});

	it("should render login form with all fields", () => {
		renderWithRouter(<LoginForm />);

		expect(screen.getByText("auth:login.title")).toBeInTheDocument();
		expect(
			screen.getByLabelText("auth:login.username_or_email"),
		).toBeInTheDocument();
		expect(screen.getByLabelText("auth:login.password")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /common:buttons.login/i }),
		).toBeInTheDocument();
	});

	it("should validate username minimum length", async () => {
		const user = userEvent.setup();
		renderWithRouter(<LoginForm />);

		const usernameInput = screen.getByLabelText("auth:login.username_or_email");
		const passwordInput = screen.getByLabelText("auth:login.password");
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.login/i,
		});

		// Fill in valid password to isolate username validation
		await user.type(usernameInput, "ab");
		await user.type(passwordInput, "validpassword123");
		await user.click(submitButton);

		// Check that validation error message appears
		const errorMessage = await screen.findByText(
			/validation:username_or_email_min/i,
		);
		expect(errorMessage).toBeInTheDocument();
	});

	it("should validate password minimum length", async () => {
		const user = userEvent.setup();
		renderWithRouter(<LoginForm />);

		const usernameInput = screen.getByLabelText("auth:login.username_or_email");
		const passwordInput = screen.getByLabelText("auth:login.password");
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.login/i,
		});

		await user.type(usernameInput, "validuser");
		await user.type(passwordInput, "short");
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/validation:password_min/i)).toBeInTheDocument();
		});
	});

	it("should accept valid email format", async () => {
		const user = userEvent.setup();
		renderWithRouter(<LoginForm />);

		const usernameInput = screen.getByLabelText("auth:login.username_or_email");
		const passwordInput = screen.getByLabelText("auth:login.password");
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.login/i,
		});

		await user.type(usernameInput, "user@example.com");
		await user.type(passwordInput, "password123");
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockSubmit).toHaveBeenCalled();
		});
	});

	it("should accept valid username format", async () => {
		const user = userEvent.setup();
		renderWithRouter(<LoginForm />);

		const usernameInput = screen.getByLabelText("auth:login.username_or_email");
		const passwordInput = screen.getByLabelText("auth:login.password");
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.login/i,
		});

		await user.type(usernameInput, "validusername");
		await user.type(passwordInput, "password123");
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockSubmit).toHaveBeenCalled();
		});
	});

	it("should display error message on failed login", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: {
				success: false,
				message: "Invalid credentials",
			},
			state: "idle",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<LoginForm />);

		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	it("should show loading state during submission", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "submitting",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<LoginForm />);

		const submitButton = screen.getByRole("button", {
			name: /common:buttons.logging_in/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it("should disable inputs during loading", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "loading",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<LoginForm />);

		const usernameInput = screen.getByLabelText("auth:login.username_or_email");
		const passwordInput = screen.getByLabelText("auth:login.password");

		expect(usernameInput).toBeDisabled();
		expect(passwordInput).toBeDisabled();
	});

	it("should have link to register page", () => {
		renderWithRouter(<LoginForm />);

		const registerLink = screen.getByRole("link", {
			name: /auth:login.sign_up/i,
		});
		expect(registerLink).toHaveAttribute("href", "/register");
	});

	it("should have link to forgot password", () => {
		renderWithRouter(<LoginForm />);

		const forgotLink = screen.getByRole("link", {
			name: /auth:login.forgot_password/i,
		});
		expect(forgotLink).toHaveAttribute("href", "/forgot-password");
	});

	it("should render GitHub login button", () => {
		renderWithRouter(<LoginForm />);

		expect(
			screen.getByRole("button", { name: /auth:login.login_with_github/i }),
		).toBeInTheDocument();
	});
});
