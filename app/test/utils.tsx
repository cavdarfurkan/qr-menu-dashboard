import { render, type RenderOptions, screen } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "~/auth_context";
import userEvent from "@testing-library/user-event";

interface AllTheProvidersProps {
	children: ReactNode;
	initialEntries?: string[];
}

function AllTheProviders({
	children,
	initialEntries = ["/"],
}: AllTheProvidersProps) {
	return (
		<MemoryRouter initialEntries={initialEntries}>
			<AuthProvider>{children}</AuthProvider>
		</MemoryRouter>
	);
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	initialEntries?: string[];
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
	const { initialEntries, ...renderOptions } = options || {};

	return render(ui, {
		wrapper: ({ children }) => (
			<AllTheProviders initialEntries={initialEntries}>
				{children}
			</AllTheProviders>
		),
		...renderOptions,
	});
};

export * from "@testing-library/react";
export { customRender as render };

// Mock data factories
export const mockMenuData = (overrides = {}) => ({
	menuId: 1,
	menuName: "Test Menu",
	ownerUsername: "testuser",
	selectedThemeId: 1,
	...overrides,
});

/** Accepts top-level overrides (e.g., id) and nested data overrides separately. */
export const mockContentData = (
	topLevelOverrides = {},
	dataOverrides = {},
) => ({
	id: "123e4567-e89b-12d3-a456-426614174000",
	...topLevelOverrides,
	data: {
		id: 1,
		name: "Test Item",
		slug: "test-item",
		...dataOverrides,
	},
});

export const mockThemeSchema = () => ({
	type: "object",
	properties: {
		name: { type: "string", title: "Name" },
		description: { type: "string", title: "Description" },
	},
	required: ["name"],
});

export const mockApiResponse = (data: any, success = true) => ({
	success,
	message: success ? "Success" : "Error",
	data,
	timestamp: new Date().toISOString(),
});

// Helper functions
export const waitForLoadingToFinish = () =>
	new Promise((resolve) => setTimeout(resolve, 0));

export const fillForm = async (
	fields: Record<string, string>,
	user: ReturnType<typeof userEvent.setup>,
) => {
	for (const [name, value] of Object.entries(fields)) {
		// Try to find input by label text first (most semantic)
		// If label doesn't match field name, try by role with name
		let input: HTMLElement;
		try {
			input = screen.getByLabelText(name);
		} catch {
			// Fallback to finding by role if label text doesn't match
			// This will throw if element is not found, removing silent skip behavior
			input = screen.getByRole("textbox", { name });
		}
		await user.clear(input);
		await user.type(input, value);
	}
};
