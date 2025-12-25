import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import NewContentDialog from "./NewContentDialog";
import * as router from "react-router";
import * as stores from "~/stores";

const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock API
vi.mock("~/lib/api", () => ({
	default: {
		post: vi.fn(() => Promise.resolve({ data: { success: true } })),
	},
}));

// Mock toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("NewContentDialog", () => {
	const mockSchema = {
		products: {
			type: "object",
			properties: {
				name: { type: "string", title: "Name" },
				price: { type: "number", title: "Price" },
			},
			required: ["name"],
		},
		categories: {
			type: "object",
			properties: {
				name: { type: "string", title: "Category Name" },
				description: { type: "string", title: "Description" },
			},
			required: ["name"],
		},
	};

	const mockUiSchema = {
		products: {},
		categories: {},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock useNavigate
		vi.spyOn(router, "useNavigate").mockReturnValue(vi.fn());
		// Mock useMenuStore
		vi.spyOn(stores, "useMenuStore").mockImplementation((selector?: any) => {
			const state = {
				menuId: "test-menu-id",
				contentName: undefined,
				setMenuId: vi.fn(),
				setContentName: vi.fn(),
				clearMenu: vi.fn(),
			};
			if (selector) {
				return selector(state);
			}
			return state;
		});
	});

	it("should render trigger button", () => {
		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={mockUiSchema}
				contentName="products"
			>
				<button>Add New</button>
			</NewContentDialog>,
		);

		expect(screen.getByRole("button", { name: "Add New" })).toBeInTheDocument();
	});

	it("should open dialog on trigger click", async () => {
		const user = userEvent.setup();

		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={mockUiSchema}
				contentName="products"
			>
				<button>Add New</button>
			</NewContentDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Add New" }));

		await waitFor(() => {
			expect(
				screen.getByText("content:new_content_dialog.title"),
			).toBeInTheDocument();
		});
	});

	it("should render RJSF form in dialog", async () => {
		const user = userEvent.setup();

		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={mockUiSchema}
				contentName="products"
			>
				<button>Add New</button>
			</NewContentDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Add New" }));

		await waitFor(() => {
			expect(
				screen.getByText("content:new_content_dialog.title"),
			).toBeInTheDocument();
		});
	});

	it("should handle form submission", async () => {
		const user = userEvent.setup();
		const api = await import("~/lib/api");
		const mockPost = vi.mocked(api.default.post);
		mockPost.mockResolvedValue({ data: { success: true } });

		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={mockUiSchema}
				contentName="products"
			>
				<button>Add New</button>
			</NewContentDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Add New" }));

		await waitFor(() => {
			expect(
				screen.getByText("content:new_content_dialog.title"),
			).toBeInTheDocument();
		});

		// Wait for form fields to be rendered
		await waitFor(() => {
			expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
		});

		// Fill in the form fields
		const nameInput = screen.getByLabelText(/Name/i);
		const priceInput = screen.getByLabelText(/Price/i);

		await user.type(nameInput, "Test Product");
		await user.type(priceInput, "29.99");

		// Submit the form
		const submitButton = screen.getByRole("button", {
			name: /common:buttons\.submit|Submit/i,
		});
		await user.click(submitButton);

		// Assert the API was called with the expected payload and endpoint
		await waitFor(() => {
			expect(mockPost).toHaveBeenCalledWith(
				"/v1/menu/test-menu-id/content",
				expect.objectContaining({
					collection: "products",
					content: expect.objectContaining({
						name: "Test Product",
						price: 29.99,
					}),
					relations: expect.any(Object),
				}),
			);
		});
	});

	it("should use correct contentName", async () => {
		const user = userEvent.setup();
		const api = await import("~/lib/api");
		const mockPost = vi.mocked(api.default.post);
		mockPost.mockResolvedValue({ data: { success: true } });

		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={mockUiSchema}
				contentName="categories"
			>
				<button>Add Category</button>
			</NewContentDialog>,
		);

		// 1. Assert trigger button renders
		const triggerButton = screen.getByRole("button", { name: "Add Category" });
		expect(triggerButton).toBeInTheDocument();

		// 2. Open the dialog
		await user.click(triggerButton);

		// 3. Assert dialog is open and contains contentName-related text
		await waitFor(() => {
			expect(
				screen.getByText("content:new_content_dialog.title"),
			).toBeInTheDocument();
		});

		// 4. Assert the correct schema fields are rendered for categories
		// Check for Category Name field (from categories schema)
		await waitFor(() => {
			expect(screen.getByLabelText(/Category Name/i)).toBeInTheDocument();
		});

		// Check for Description field (from categories schema)
		expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();

		// Verify products fields are NOT present (ensuring correct schema is used)
		expect(screen.queryByLabelText(/^Price$/i)).not.toBeInTheDocument();

		// 5. Fill the form
		const nameInput = screen.getByLabelText(/Category Name/i);
		const descriptionInput = screen.getByLabelText(/Description/i);

		await user.type(nameInput, "Test Category");
		await user.type(descriptionInput, "Test Description");

		// 6. Submit the form
		// The submit button text comes from translation: "common:buttons.submit"
		const submitButton = screen.getByRole("button", {
			name: /common:buttons\.submit|Submit/i,
		});
		await user.click(submitButton);

		// 7. Assert the API call includes contentName in the payload
		await waitFor(() => {
			expect(mockPost).toHaveBeenCalledWith(
				"/v1/menu/test-menu-id/content",
				expect.objectContaining({
					collection: "categories",
					content: expect.objectContaining({
						name: "Test Category",
						description: "Test Description",
					}),
					relations: expect.any(Object),
				}),
			);
		});
	});

	it("should handle undefined uiSchema", async () => {
		const user = userEvent.setup();

		renderWithRouter(
			<NewContentDialog
				schema={mockSchema}
				uiSchema={undefined}
				contentName="products"
			>
				<button>Add New</button>
			</NewContentDialog>,
		);

		// Assert trigger button exists
		const triggerButton = screen.getByRole("button", { name: "Add New" });
		expect(triggerButton).toBeInTheDocument();

		// Click the "Add New" button to open the dialog
		await user.click(triggerButton);

		// Await the dialog/modal to appear
		await waitFor(() => {
			expect(
				screen.getByText("content:new_content_dialog.title"),
			).toBeInTheDocument();
		});

		// Assert that form fields generated from mockSchema render without errors
		// Check for Name field (required string field)
		await waitFor(() => {
			expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
		});

		// Check for Price field (number field)
		expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();

		// Verify required field indicator is present for Name field
		// RJSF shows required fields with asterisks in the label
		const nameField = screen.getByLabelText(/Name/i);
		expect(nameField).toBeInTheDocument();
		// Check that the field is marked as required
		expect(nameField).toHaveAttribute("required");
		// Check for asterisk in the label (RJSF FieldTemplate adds "*" for required fields)
		// The label text will be "Name*" for required fields
		expect(screen.getByText(/Name\s*\*/i)).toBeInTheDocument();

		// Verify default UI schema behavior - default widgets/arrangement are present
		// String fields should render as text inputs
		expect(nameField).toHaveAttribute("type", "text");

		// Number fields render as text inputs by default in RJSF (validation happens at schema level)
		const priceField = screen.getByLabelText(/Price/i);
		expect(priceField).toBeInTheDocument();
		// RJSF uses text inputs for number fields by default, validation is schema-based
		expect(priceField).toHaveAttribute("type", "text");

		// Verify no runtime errors occurred - if we got here, the form rendered successfully
		// Additional verification: ensure form is interactive
		await user.type(nameField, "Test Product");
		expect(nameField).toHaveValue("Test Product");
	});

	it("should handle undefined contentName", () => {
		// The component should throw an error when contentName is undefined
		// because it's required for the form to function properly
		expect(() => {
			renderWithRouter(
				<NewContentDialog
					schema={mockSchema}
					uiSchema={mockUiSchema}
					contentName={undefined}
				>
					<button>Add New</button>
				</NewContentDialog>,
			);
		}).toThrow("contentName is required and cannot be empty");
	});
});
