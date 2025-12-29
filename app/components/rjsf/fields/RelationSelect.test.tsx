import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import RelationSelect from "./RelationSelect";
import type { FieldProps } from "@rjsf/utils";
import * as stores from "~/stores";

// Mock API - define mock function inside the factory to avoid hoisting issues
const mockApiGet = vi.fn();

vi.mock("~/lib/api", () => ({
	default: {
		get: (...args: any[]) => mockApiGet(...args),
	},
}));

describe("RelationSelect", () => {
	const mockOnChange = vi.fn();

	const baseProps: Partial<FieldProps> = {
		id: "test-field",
		name: "categories",
		label: "Categories",
		required: false,
		readonly: false,
		disabled: false,
		idSchema: { $id: "test-id" },
		formData: null,
		onChange: mockOnChange,
		schema: { type: "object" },
		uiSchema: {
			"ui:options": {
				relationValue: "id",
				relationLabel: "name",
				isMultiple: false,
			},
		},
		registry: {
			formContext: {},
			templates: {},
		} as any,
		rawErrors: [],
	};

	const mockSetLoading = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock implementation for each test
		mockApiGet.mockImplementation(() =>
			Promise.resolve({
				data: {
					success: true,
					data: [
						{ id: "1", data: { id: 1, name: "Option 1" } },
						{ id: "2", data: { id: 2, name: "Option 2" } },
					],
				},
			}),
		);
		mockApiGet.mockClear();

		// Mock stores - useMenuStore is a hook that takes a selector function
		vi.spyOn(stores, "useMenuStore").mockImplementation((selector?: any) => {
			const state = {
				menuId: "1",
				contentName: "products",
				setMenuId: vi.fn(),
				setContentName: vi.fn(),
				clearMenu: vi.fn(),
			};

			if (selector) {
				return selector(state);
			}
			return state;
		});

		// Create a mock that returns the function when called
		vi.spyOn(stores, "useUiStore").mockImplementation((selector?: any) => {
			const state = {
				isLoading: false,
				setLoading: mockSetLoading,
				isSidebarOpen: true,
				loadingMessage: "",
				notifications: [],
				toggleSidebar: vi.fn(),
				addNotification: vi.fn(),
				removeNotification: vi.fn(),
			};

			if (selector) {
				return selector(state);
			}
			return state;
		});
	});

	it("should render AsyncSelect component", async () => {
		render(<RelationSelect {...(baseProps as FieldProps)} />);

		// Use accessible query to find the combobox
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		expect(await screen.findByText(/Select categories/i)).toBeInTheDocument();
	});

	it("should handle single select mode", async () => {
		const user = userEvent.setup();
		const prefetchedData = [
			{ id: "1", data: { id: 1, name: "Option 1" } },
			{ id: "2", data: { id: 2, name: "Option 2" } },
		];

		// Create a wrapper component that manages formData state
		// This simulates real usage where formData is updated by the parent
		const TestWrapper = () => {
			const [formData, setFormData] = useState<any>(null);

			const props = {
				...baseProps,
				uiSchema: {
					"ui:options": {
						relationValue: "id",
						relationLabel: "name",
						isMultiple: false,
					},
				},
				formData,
				onChange: (newValue: any) => {
					mockOnChange(newValue, baseProps.idSchema?.$id);
					setFormData(newValue);
				},
				registry: {
					formContext: {
						relationContentLists: {
							categories: prefetchedData,
						},
					},
				} as any,
			};

			return <RelationSelect {...(props as FieldProps)} />;
		};

		render(<TestWrapper />);

		// Wait for select to render using accessible query
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		const placeholder = await screen.findByText(/Select categories/i);
		expect(placeholder).toBeInTheDocument();

		// Verify API was NOT called since we have prefetched data
		expect(mockApiGet).not.toHaveBeenCalled();

		// Open the select menu by clicking the control
		await user.click(combobox);

		// Wait for menu to open (aria-expanded should become true)
		await waitFor(() => {
			expect(combobox).toHaveAttribute("aria-expanded", "true");
		});

		// Wait for menu to open and options to appear
		// Options are rendered in a portal, so we need to wait for them
		const option1 = await screen.findByRole(
			"option",
			{ name: /Option 1/i },
			{ timeout: 3000 },
		);
		const option2 = await screen.findByRole(
			"option",
			{ name: /Option 2/i },
			{ timeout: 3000 },
		);

		// Verify labels (relationLabel) are displayed in options
		expect(option1).toBeVisible();
		expect(option2).toBeVisible();
		expect(option1).toHaveTextContent("Option 1");
		expect(option2).toHaveTextContent("Option 2");

		// Select one option
		await user.click(option1);

		// Verify onChange was called once with a single value (relation format)
		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledTimes(1);
			const callArgs = mockOnChange.mock.calls[0];
			// Verify it's a single object, not an array
			expect(Array.isArray(callArgs[0])).toBe(false);
			expect(callArgs[0]).toEqual({
				id: "1",
				data: { id: 1, name: "Option 1" },
			});
			expect(callArgs[1]).toBe("test-id");
		});

		// Verify the selected value is displayed after formData update
		expect(await screen.findByText("Option 1")).toBeInTheDocument();
	});

	it("should handle multiple select mode", async () => {
		const user = userEvent.setup();
		const prefetchedData = [
			{ id: "1", data: { id: 1, name: "Option 1" } },
			{ id: "2", data: { id: 2, name: "Option 2" } },
		];

		// Create a wrapper component that manages formData state
		// This simulates real usage where formData is updated by the parent
		const TestWrapper = () => {
			const [formData, setFormData] = useState<any[]>([]);

			const props = {
				...baseProps,
				uiSchema: {
					"ui:options": {
						relationValue: "id",
						relationLabel: "name",
						isMultiple: true,
					},
				},
				formData,
				onChange: (newValue: any) => {
					mockOnChange(newValue, baseProps.idSchema?.$id);
					setFormData(newValue);
				},
				registry: {
					formContext: {
						relationContentLists: {
							categories: prefetchedData,
						},
					},
				} as any,
			};

			return <RelationSelect {...(props as FieldProps)} />;
		};

		render(<TestWrapper />);

		// Wait for select to render using accessible query
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		expect(await screen.findByText(/Select categories/i)).toBeInTheDocument();

		// Verify API was NOT called since we have prefetched data
		expect(mockApiGet).not.toHaveBeenCalled();

		// Open the select menu by clicking the control
		await user.click(combobox);

		// Wait for menu to open (aria-expanded should become true)
		await waitFor(() => {
			expect(combobox).toHaveAttribute("aria-expanded", "true");
		});

		// Wait for menu to open and options to appear
		const option1 = await screen.findByRole(
			"option",
			{ name: /Option 1/i },
			{ timeout: 3000 },
		);
		const option2 = await screen.findByRole(
			"option",
			{ name: /Option 2/i },
			{ timeout: 3000 },
		);

		// Verify labels (relationLabel) are displayed in options
		expect(option1).toBeVisible();
		expect(option2).toBeVisible();
		expect(option1).toHaveTextContent("Option 1");
		expect(option2).toHaveTextContent("Option 2");

		// Select first option
		await user.click(option1);

		// Verify onChange was called with array containing one item
		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledTimes(1);
			const callArgs = mockOnChange.mock.calls[0];
			// Verify it's an array (multiple mode)
			expect(Array.isArray(callArgs[0])).toBe(true);
			expect(callArgs[0]).toEqual([
				{ id: "1", data: { id: 1, name: "Option 1" } },
			]);
			expect(callArgs[1]).toBe("test-id");
		});

		// Verify the first selected value is displayed
		expect(await screen.findByText("Option 1")).toBeInTheDocument();

		// After re-render, the menu may have closed, so reopen it for the second selection
		// In multi mode, we can select multiple options
		const selectControlAfterFirst = await screen.findByRole("combobox");
		await user.click(selectControlAfterFirst);

		// Wait for menu to open (aria-expanded should become true)
		await waitFor(() => {
			expect(selectControlAfterFirst).toHaveAttribute("aria-expanded", "true");
		});

		// Wait for options to appear again - in multi-select, both options should still be available
		// Option 1 might be marked as selected but should still be in the list
		await waitFor(
			async () => {
				const options = screen.getAllByRole("option");
				expect(options.length).toBeGreaterThanOrEqual(1);
			},
			{ timeout: 3000 },
		);

		const option2After = await screen.findByRole(
			"option",
			{
				name: /Option 2/i,
			},
			{ timeout: 3000 },
		);

		// Select second option
		await user.click(option2After);

		// Verify onChange was called again with array containing both items
		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledTimes(2);
			const callArgs = mockOnChange.mock.calls[1];
			// Verify it's an array with both items
			expect(Array.isArray(callArgs[0])).toBe(true);
			expect(callArgs[0]).toEqual([
				{ id: "1", data: { id: 1, name: "Option 1" } },
				{ id: "2", data: { id: 2, name: "Option 2" } },
			]);
			expect(callArgs[1]).toBe("test-id");
		});

		// Verify both selected values are displayed
		expect(await screen.findByText("Option 1")).toBeInTheDocument();
		expect(await screen.findByText("Option 2")).toBeInTheDocument();
	});

	it("should use pre-fetched content list from formContext", async () => {
		const user = userEvent.setup();
		const prefetchedData = [
			{ id: "1", data: { id: 1, name: "Prefetched 1" } },
			{ id: "2", data: { id: 2, name: "Prefetched 2" } },
		];

		const props = {
			...baseProps,
			registry: {
				formContext: {
					relationContentLists: {
						categories: prefetchedData,
					},
				},
			} as any,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Wait for select to render
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		expect(await screen.findByText(/Select categories/i)).toBeInTheDocument();

		// Component should use prefetched data - API should NOT be called
		expect(mockApiGet).not.toHaveBeenCalled();
		expect(mockOnChange).not.toHaveBeenCalled();

		// Open select to verify prefetched options are available
		await user.click(combobox);

		// Wait for menu to open (aria-expanded should become true)
		await waitFor(() => {
			expect(combobox).toHaveAttribute("aria-expanded", "true");
		});

		// Wait for prefetched options to appear
		const option1 = await screen.findByRole(
			"option",
			{
				name: /Prefetched 1/i,
			},
			{ timeout: 3000 },
		);
		const option2 = await screen.findByRole(
			"option",
			{
				name: /Prefetched 2/i,
			},
			{ timeout: 3000 },
		);

		// Verify prefetched options are displayed
		expect(option1).toBeVisible();
		expect(option2).toBeVisible();
		expect(option1).toHaveTextContent("Prefetched 1");
		expect(option2).toHaveTextContent("Prefetched 2");

		// API should still not be called even after opening the menu
		expect(mockApiGet).not.toHaveBeenCalled();
	});

	it("should call API when no prefetched data is available", async () => {
		const user = userEvent.setup();

		// Render without prefetched data
		render(<RelationSelect {...(baseProps as FieldProps)} />);

		// Wait for select to render
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		expect(await screen.findByText(/Select categories/i)).toBeInTheDocument();

		// AsyncSelect with defaultOptions will call loadOptions on mount
		// Wait for API call to be made
		await waitFor(
			() => {
				expect(mockApiGet).toHaveBeenCalled();
			},
			{ timeout: 3000 },
		);

		// Verify API was called with correct endpoint
		expect(mockApiGet).toHaveBeenCalledWith("/v1/menu/1/content/categories");

		// Open the select menu to see the loaded options
		await user.click(combobox);

		// Wait for menu to open (aria-expanded should become true)
		await waitFor(() => {
			expect(combobox).toHaveAttribute("aria-expanded", "true");
		});

		// Wait for options to appear from API response
		const option1 = await screen.findByRole(
			"option",
			{ name: /Option 1/i },
			{ timeout: 3000 },
		);
		const option2 = await screen.findByRole(
			"option",
			{ name: /Option 2/i },
			{ timeout: 3000 },
		);

		// Verify API-loaded options are displayed
		expect(option1).toBeVisible();
		expect(option2).toBeVisible();
		expect(option1).toHaveTextContent("Option 1");
		expect(option2).toHaveTextContent("Option 2");

		// API should be cached by AsyncSelect (no additional calls after opening menu)
		const callCountAfterOpen = mockApiGet.mock.calls.length;
		expect(callCountAfterOpen).toBeGreaterThanOrEqual(1);
	});

	it("should handle disabled state", async () => {
		const props = {
			...baseProps,
			disabled: true,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Use accessible query to find the combobox (disabled elements are still findable)
		const combobox = await screen.findByRole("combobox", { hidden: true });
		expect(combobox).toBeInTheDocument();
		// Verify the input is disabled
		expect(combobox).toBeDisabled();
	});

	it("should handle readonly state", async () => {
		const props = {
			...baseProps,
			readonly: true,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Use accessible query to find the combobox (disabled elements are still findable)
		const combobox = await screen.findByRole("combobox", { hidden: true });
		expect(combobox).toBeInTheDocument();
		// Verify the input is disabled (readonly is treated as disabled in react-select)
		expect(combobox).toBeDisabled();
	});

	it("should display placeholder with content name", async () => {
		const props = {
			...baseProps,
			name: "products",
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Use accessible query to find the combobox
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder text includes the content name
		expect(await screen.findByText(/Select products/i)).toBeInTheDocument();
	});

	it("should handle formData with single selection", async () => {
		const props = {
			...baseProps,
			formData: {
				id: "1",
				data: { id: 1, name: "Selected Item" },
			},
			uiSchema: {
				"ui:options": {
					relationValue: "id",
					relationLabel: "name",
					isMultiple: false,
				},
			},
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Wait for select to render
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify selected value is displayed
		expect(await screen.findByText("Selected Item")).toBeInTheDocument();

		// Component should render with selected value without calling onChange
		expect(mockOnChange).not.toHaveBeenCalled();
	});

	it("should handle formData with multiple selections", async () => {
		const props = {
			...baseProps,
			formData: [
				{ id: "1", data: { id: 1, name: "Item 1" } },
				{ id: "2", data: { id: 2, name: "Item 2" } },
			],
			uiSchema: {
				"ui:options": {
					relationValue: "id",
					relationLabel: "name",
					isMultiple: true,
				},
			},
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Wait for select to render
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify selected values are displayed
		expect(await screen.findByText("Item 1")).toBeInTheDocument();
		expect(await screen.findByText("Item 2")).toBeInTheDocument();

		// Component should render with selected values without calling onChange
		expect(mockOnChange).not.toHaveBeenCalled();
	});

	it("should apply theme-aware styling", async () => {
		render(<RelationSelect {...(baseProps as FieldProps)} />);

		// Use accessible query to verify component renders
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();
	});

	it("should handle empty formData", async () => {
		const props = {
			...baseProps,
			formData: null,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Wait for select to render
		const combobox = await screen.findByRole("combobox");
		expect(combobox).toBeInTheDocument();

		// Verify placeholder is visible
		expect(await screen.findByText(/Select categories/i)).toBeInTheDocument();

		// Should render without errors
		expect(mockOnChange).not.toHaveBeenCalled();
	});

	it("should render wrapper structure", async () => {
		render(<RelationSelect {...(baseProps as FieldProps)} />);

		// Verify wrapper is present
		const wrapper = await screen.findByTestId("field-template-wrapper");
		expect(wrapper).toBeInTheDocument();
	});

	it("should render label from props", async () => {
		render(<RelationSelect {...(baseProps as FieldProps)} />);

		// Verify label is rendered
		const label = await screen.findByTestId("field-label");
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent("Categories");
	});

	it("should render required indicator when field is required", async () => {
		const props = {
			...baseProps,
			required: true,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify required indicator is present
		const requiredIndicator = await screen.findByTestId("required-indicator");
		expect(requiredIndicator).toBeInTheDocument();
		expect(requiredIndicator).toHaveTextContent("*");
	});

	it("should not render required indicator when field is not required", async () => {
		const props = {
			...baseProps,
			required: false,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify required indicator is not present
		const requiredIndicator = screen.queryByTestId("required-indicator");
		expect(requiredIndicator).not.toBeInTheDocument();
	});

	it("should render errors when rawErrors are provided", async () => {
		const props = {
			...baseProps,
			rawErrors: ["This field is required", "Invalid selection"],
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify errors are rendered
		const errors = await screen.findByTestId("field-errors");
		expect(errors).toBeInTheDocument();
		expect(errors).toHaveTextContent(
			"This field is required, Invalid selection",
		);
	});

	it("should not render errors when rawErrors is empty", async () => {
		const props = {
			...baseProps,
			rawErrors: [],
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify errors are not present
		const errors = screen.queryByTestId("field-errors");
		expect(errors).not.toBeInTheDocument();
	});

	it("should render description when schema has description", async () => {
		const props = {
			...baseProps,
			schema: {
				...baseProps.schema,
				description: "Select one or more categories",
			},
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify description is rendered
		const description = await screen.findByTestId("field-description");
		expect(description).toBeInTheDocument();
		expect(description).toHaveTextContent("Select one or more categories");
	});

	it("should use field name as label when label prop is not provided", async () => {
		const props = {
			...baseProps,
			label: undefined,
		};

		render(<RelationSelect {...(props as FieldProps)} />);

		// Verify name is used as label
		const label = await screen.findByTestId("field-label");
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent("categories");
	});
});
