import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import RegisterForm from "./register_form";
import * as router from "react-router";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("RegisterForm", () => {
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

	it("should render register form with all fields", () => {
		renderWithRouter(<RegisterForm />);

		expect(screen.getByText("auth:register.title")).toBeInTheDocument();
		expect(screen.getByLabelText("auth:register.username")).toBeInTheDocument();
		expect(screen.getByLabelText("auth:register.email")).toBeInTheDocument();
		expect(screen.getByLabelText("auth:register.password")).toBeInTheDocument();
		expect(
			screen.getByLabelText("auth:register.confirm_password"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /common:buttons.register/i }),
		).toBeInTheDocument();
	});

	it("should validate username minimum length", async () => {
		const user = userEvent.setup();
		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});

		// Fill in all fields except username with valid values
		await user.type(usernameInput, "ab"); // Invalid - too short
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "validpassword123");
		await user.type(confirmPasswordInput, "validpassword123");
		await user.click(submitButton);

		// Check that submit was NOT called due to validation error
		await waitFor(
			() => {
				expect(mockSubmit).not.toHaveBeenCalled();
			},
			{ timeout: 1000 },
		);
	});

	it("should validate email format", async () => {
		const user = userEvent.setup();
		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});

		// Fill in all fields except email with valid values
		await user.type(usernameInput, "validuser");
		await user.type(emailInput, "invalid-email"); // Invalid email format
		await user.type(passwordInput, "validpassword123");
		await user.type(confirmPasswordInput, "validpassword123");
		await user.click(submitButton);

		// Check that submit was NOT called due to validation error
		await waitFor(
			() => {
				expect(mockSubmit).not.toHaveBeenCalled();
			},
			{ timeout: 1000 },
		);
	});

	it("should validate password minimum length", async () => {
		const user = userEvent.setup();
		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});

		// Fill in all fields with valid values except password
		await user.type(usernameInput, "validuser");
		await user.type(emailInput, "user@example.com");
		await user.type(passwordInput, "short"); // Invalid - too short
		await user.type(confirmPasswordInput, "short");
		await user.click(submitButton);

		// Check that submit was NOT called due to validation error
		await waitFor(
			() => {
				expect(mockSubmit).not.toHaveBeenCalled();
			},
			{ timeout: 1000 },
		);
	});

	it("should validate password confirmation match", async () => {
		const user = userEvent.setup();
		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});

		await user.type(usernameInput, "validuser");
		await user.type(emailInput, "user@example.com");
		await user.type(passwordInput, "password123");
		await user.type(confirmPasswordInput, "differentpassword");
		await user.click(submitButton);

		await waitFor(() => {
			// The error message will be on the confirmPassword field
			const errorMessages = screen.getAllByText(
				/validation:passwords_dont_match/i,
			);
			expect(errorMessages.length).toBeGreaterThan(0);
		});
	});

	it("should submit form with valid data", async () => {
		const user = userEvent.setup();
		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);
		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});

		await user.type(usernameInput, "newuser");
		await user.type(emailInput, "newuser@example.com");
		await user.type(passwordInput, "password123");
		await user.type(confirmPasswordInput, "password123");
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockSubmit).toHaveBeenCalled();
		});
	});

	it("should display error message on failed registration", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: {
				success: false,
				message: "Username already exists",
			},
			state: "idle",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<RegisterForm />);

		expect(screen.getByText("Username already exists")).toBeInTheDocument();
	});

	it("should navigate to login on successful registration", async () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: {
				success: true,
				message: "Registration successful",
			},
			state: "idle",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<RegisterForm />);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login");
		});
	});

	it("should show loading state during submission", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "submitting",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<RegisterForm />);

		const submitButton = screen.getByRole("button", {
			name: /common:buttons.register/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it("should disable inputs during loading", () => {
		vi.spyOn(router, "useFetcher").mockReturnValue({
			data: null,
			state: "loading",
			submit: mockSubmit,
		} as any);

		renderWithRouter(<RegisterForm />);

		const usernameInput = screen.getByLabelText("auth:register.username");
		const emailInput = screen.getByLabelText("auth:register.email");
		const passwordInput = screen.getByLabelText("auth:register.password");
		const confirmPasswordInput = screen.getByLabelText(
			"auth:register.confirm_password",
		);

		expect(usernameInput).toBeDisabled();
		expect(emailInput).toBeDisabled();
		expect(passwordInput).toBeDisabled();
		expect(confirmPasswordInput).toBeDisabled();
	});

	it("should have link to login page", () => {
		renderWithRouter(<RegisterForm />);

		const loginLink = screen.getByRole("link", {
			name: /auth:register.log_in/i,
		});
		expect(loginLink).toHaveAttribute("href", "/login");
	});

	it("should render GitHub register button", () => {
		renderWithRouter(<RegisterForm />);

		expect(
			screen.getByRole("button", {
				name: /auth:register.register_with_github/i,
			}),
		).toBeInTheDocument();
	});
});
