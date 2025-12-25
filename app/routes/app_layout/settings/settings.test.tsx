import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Settings from "./settings";
import * as stores from "~/stores";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
	}),
}));

describe("Settings Route", () => {
	const mockSetActiveSection = vi.fn();
	const mockCancelChanges = vi.fn();
	const mockSaveChanges = vi.fn();
	const mockSetLanguage = vi.fn();
	const mockSetSelectedLanguage = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(stores, "useSettingsStore").mockReturnValue({
			activeSection: "account_details",
			setActiveSection: mockSetActiveSection,
			cancelChanges: mockCancelChanges,
			saveChanges: mockSaveChanges,
			hasUnsavedChanges: () => false,
			language: "en",
			selectedLanguage: "en",
			setLanguage: mockSetLanguage,
			setSelectedLanguage: mockSetSelectedLanguage,
			savedSettings: { language: "en" },
			pendingChanges: {},
			cancelLanguageChange: vi.fn(),
		} as any);
	});

	describe("Settings Component", () => {
		it("should render settings title", () => {
			renderWithRouter(<Settings />);

			expect(screen.getByText("home:settings")).toBeInTheDocument();
		});

		it("should render save and cancel buttons", () => {
			renderWithRouter(<Settings />);

			expect(
				screen.getByRole("button", { name: /common:buttons.save/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /common:buttons.cancel/i }),
			).toBeInTheDocument();
		});

		it("should disable save button when no unsaved changes", () => {
			renderWithRouter(<Settings />);

			const saveButton = screen.getByRole("button", {
				name: /common:buttons.save/i,
			});
			expect(saveButton).toBeDisabled();
		});

		it("should disable cancel button when no unsaved changes", () => {
			renderWithRouter(<Settings />);

			const cancelButton = screen.getByRole("button", {
				name: /common:buttons.cancel/i,
			});
			expect(cancelButton).toBeDisabled();
		});

		it("should enable buttons when there are unsaved changes", () => {
			const mockPendingChanges = { language: "tr" as const };
			vi.spyOn(stores, "useSettingsStore").mockReturnValue({
				activeSection: "account_details",
				setActiveSection: mockSetActiveSection,
				cancelChanges: mockCancelChanges,
				saveChanges: mockSaveChanges,
				hasUnsavedChanges: () => Object.keys(mockPendingChanges).length > 0,
				language: "en",
				selectedLanguage: "en",
				setLanguage: mockSetLanguage,
				setSelectedLanguage: mockSetSelectedLanguage,
				savedSettings: { language: "en" },
				pendingChanges: mockPendingChanges,
				cancelLanguageChange: vi.fn(),
			} as any);

			renderWithRouter(<Settings />);

			const saveButton = screen.getByRole("button", {
				name: /common:buttons.save/i,
			});
			const cancelButton = screen.getByRole("button", {
				name: /common:buttons.cancel/i,
			});

			expect(saveButton).not.toBeDisabled();
			expect(cancelButton).not.toBeDisabled();
		});

		it("should call saveChanges when save is clicked", async () => {
			const user = userEvent.setup();

			const mockPendingChanges = { language: "tr" as const };
			vi.spyOn(stores, "useSettingsStore").mockReturnValue({
				activeSection: "account_details",
				setActiveSection: mockSetActiveSection,
				cancelChanges: mockCancelChanges,
				saveChanges: mockSaveChanges,
				hasUnsavedChanges: () => Object.keys(mockPendingChanges).length > 0,
				language: "en",
				selectedLanguage: "en",
				setLanguage: mockSetLanguage,
				setSelectedLanguage: mockSetSelectedLanguage,
				savedSettings: { language: "en" },
				pendingChanges: mockPendingChanges,
				cancelLanguageChange: vi.fn(),
			} as any);

			renderWithRouter(<Settings />);

			const saveButton = screen.getByRole("button", {
				name: /common:buttons.save/i,
			});
			await user.click(saveButton);

			expect(mockSaveChanges).toHaveBeenCalled();
		});

		it("should call cancelChanges when cancel is clicked", async () => {
			const user = userEvent.setup();

			const mockPendingChanges = { language: "tr" as const };
			vi.spyOn(stores, "useSettingsStore").mockReturnValue({
				activeSection: "account_details",
				setActiveSection: mockSetActiveSection,
				cancelChanges: mockCancelChanges,
				saveChanges: mockSaveChanges,
				hasUnsavedChanges: () => Object.keys(mockPendingChanges).length > 0,
				language: "en",
				selectedLanguage: "en",
				setLanguage: mockSetLanguage,
				setSelectedLanguage: mockSetSelectedLanguage,
				savedSettings: { language: "en" },
				pendingChanges: mockPendingChanges,
				cancelLanguageChange: vi.fn(),
			} as any);

			renderWithRouter(<Settings />);

			const cancelButton = screen.getByRole("button", {
				name: /common:buttons.cancel/i,
			});
			await user.click(cancelButton);

			expect(mockCancelChanges).toHaveBeenCalled();
		});

		describe("Settings Sections", () => {
			it("should render account details section tab", () => {
				renderWithRouter(<Settings />);

				// Tab should be rendered
				const tabs = screen.getAllByRole("tab");
				expect(tabs.length).toBeGreaterThan(0);
			});

			it("should render organization section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:organization.title/i),
				).toBeInTheDocument();
			});

			it("should render security section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:security.title/i),
				).toBeInTheDocument();
			});

			it("should render privacy section tab", () => {
				renderWithRouter(<Settings />);

				expect(screen.getByText(/settings:privacy.title/i)).toBeInTheDocument();
			});

			it("should render billing section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:billing_and_subscription.title/i),
				).toBeInTheDocument();
			});

			it("should render appearance section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:appearance.title/i),
				).toBeInTheDocument();
			});

			it("should render language section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:language.title/i),
				).toBeInTheDocument();
			});

			it("should render notifications section tab", () => {
				renderWithRouter(<Settings />);

				expect(
					screen.getByText(/settings:notifications.title/i),
				).toBeInTheDocument();
			});
		});

		describe("Account Details Section", () => {
			it("should render form inputs", () => {
				renderWithRouter(<Settings />);

				// Should have some inputs in the default section
				const inputs = screen.getAllByRole("textbox");
				expect(inputs.length).toBeGreaterThan(0);
			});
		});

		describe("Mobile View", () => {
			it("should render mobile select dropdown", () => {
				renderWithRouter(<Settings />);

				// There should be a select trigger for mobile view
				const selectTriggers = screen.getAllByRole("combobox");
				expect(selectTriggers.length).toBeGreaterThan(0);
			});
		});

		describe("Section Navigation", () => {
			it("should render tabs for navigation", () => {
				renderWithRouter(<Settings />);

				const tabs = screen.getAllByRole("tab");
				expect(tabs.length).toBeGreaterThan(0);
			});

			it("should call setActiveSection when tab is clicked", async () => {
				const user = userEvent.setup();

				renderWithRouter(<Settings />);

				const tabs = screen.getAllByRole("tab");
				expect(tabs.length).toBeGreaterThan(1);
				await user.click(tabs[1]);
				expect(mockSetActiveSection).toHaveBeenCalled();
			});
		});
	});

	// Additional section tests - simplified to check rendering works
	describe("Section Rendering", () => {
		it("should render settings page without crashing", () => {
			renderWithRouter(<Settings />);
			expect(screen.getByText("home:settings")).toBeInTheDocument();
		});

		it("should render mobile select for section navigation", () => {
			renderWithRouter(<Settings />);
			const selects = screen.getAllByRole("combobox");
			expect(selects.length).toBeGreaterThan(0);
		});
	});
});
