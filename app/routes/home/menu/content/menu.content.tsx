import { Link, useParams, useRevalidator } from "react-router";
import { FileX, MoreHorizontal, Pencil, PlusCircle, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import Title from "~/components/Title";
import api, { type ApiResponse } from "~/lib/api";
import type { Route } from "./+types/menu.content";
import { isAxiosError } from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type Row,
	type RowSelectionState,
} from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Checkbox } from "~/components/ui/checkbox";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import NewContentDialog from "~/components/NewContentDialog";

import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useMenuStore } from "~/stores";

type MenuType = {
	menuId: number;
	menuName: string;
	ownerUsername: string;
	selectedThemeId: number;
};

type SchemasType = {
	schemas_count: number;
	theme_schemas: RJSFSchema;
	ui_schemas: UiSchema;
};

export async function clientLoader({
	params,
}: Route.ClientLoaderArgs): Promise<ApiResponse & SchemasType> {
	// Default error response
	const defaultErrorResponse = {
		success: false,
		message: "An unexpected error occurred",
		data: null,
		timestamp: new Date().toISOString(),
		schemas_count: 0,
		theme_schemas: {},
		ui_schemas: {},
	};

	// Get menu details
	let menu: MenuType;
	try {
		const menuResponse = await api.get<ApiResponse>(
			`/v1/menu/${params.menuId}`,
		);
		if (!menuResponse.data.success) {
			return {
				success: menuResponse.data.success,
				message: menuResponse.data.message,
				data: menuResponse.data.data,
				timestamp: menuResponse.data.timestamp,
				schemas_count: 0,
				theme_schemas: {},
				ui_schemas: {},
			};
		}
		menu = menuResponse.data.data as MenuType;
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;
			return {
				success: errorResponse?.data?.success ?? false,
				message: errorResponse?.data?.message ?? "Failed to load menu data",
				data: null,
				timestamp: errorResponse?.data?.timestamp ?? new Date().toISOString(),
				schemas_count: 0,
				theme_schemas: {},
				ui_schemas: {},
			};
		}
		return defaultErrorResponse;
	}

	// Get the theme schema
	let themeSchemas = {
		schemas_count: 0,
		theme_schemas: {} as RJSFSchema,
		ui_schemas: {} as UiSchema,
	};
	try {
		const schemasResponse = await api.get<ApiResponse>(
			`/v1/theme/${menu.selectedThemeId}/schemas`,
			{
				params: {
					refs: params.contentName,
					uiSchema: "1",
				},
			},
		);

		themeSchemas = schemasResponse.data.success
			? (schemasResponse.data.data as SchemasType)
			: { schemas_count: 0, theme_schemas: {}, ui_schemas: {} };
	} catch (error) {
		// Continue with empty schemas if this fails
		console.log("Failed to load schemas:", error);
	}

	// Get the content data
	try {
		const contentResponse = await api.get<ApiResponse>(
			`/v1/menu/${params.menuId}/content/${params.contentName}`,
		);

		return {
			success: contentResponse.data.success,
			message: contentResponse.data.message,
			data: contentResponse.data.data,
			timestamp: contentResponse.data.timestamp,
			schemas_count: themeSchemas.schemas_count,
			theme_schemas: themeSchemas.theme_schemas,
			ui_schemas: themeSchemas.ui_schemas,
		} as ApiResponse & SchemasType;
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: false,
				message: errorResponse?.data?.message ?? "Failed to load content data",
				data: null,
				timestamp: errorResponse?.data?.timestamp ?? new Date().toISOString(),
				schemas_count: themeSchemas.schemas_count,
				theme_schemas: themeSchemas.theme_schemas,
				ui_schemas: themeSchemas.ui_schemas,
			};
		}

		return {
			success: false,
			message: "Failed to load content data",
			data: null,
			timestamp: new Date().toISOString(),
			schemas_count: themeSchemas.schemas_count,
			theme_schemas: themeSchemas.theme_schemas,
			ui_schemas: themeSchemas.ui_schemas,
		};
	}
}

export default function MenuContent({ loaderData }: Route.ComponentProps) {
	const { contentName, menuId } = useParams();
	const { success, message, data, theme_schemas, schemas_count, ui_schemas } =
		loaderData;

	const setMenuId = useMenuStore((state) => state.setMenuId);
	const setContentName = useMenuStore((state) => state.setContentName);

	useEffect(() => {
		setMenuId(menuId);
		setContentName(contentName);
	}, [menuId, contentName]);

	if (!success && schemas_count === 0) {
		return <div>{message}</div>;
	}

	const content: Array<any> = loaderData.data || [];

	const revalidator = useRevalidator();

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<any>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isBulkDelete, setIsBulkDelete] = useState(false);

	const columns: ColumnDef<any>[] = useMemo(() => {
		if (!content || content.length === 0) return [];

		const allKeys = new Set<string>();
		// Get all unique keys from all content items
		content.forEach((item) => {
			if (item && typeof item === "object") {
				Object.keys(item).forEach((key) => allKeys.add(key));
			}
		});

		// Create columns for each key without any specific ordering
		const keys = [...allKeys];

		// Create columns for each key
		const dataColumns = keys.map((key) => ({
			accessorKey: key,
			header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
			cell: ({ getValue }: { getValue: () => any }) => {
				const value = getValue();
				return renderCellValue(value, key, ui_schemas, contentName);
			},
		}));

		// Add actions column
		return [
			{
				id: "select",
				header: ({ table }) => {
					return (
						<div className="flex items-center justify-center">
							<Checkbox
								checked={
									table.getIsAllPageRowsSelected() ||
									(table.getIsSomePageRowsSelected() && "indeterminate")
								}
								onCheckedChange={(value) =>
									table.toggleAllPageRowsSelected(!!value)
								}
								aria-label="Select all"
							/>
						</div>
					);
				},
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							aria-label="Select row"
						/>
					</div>
				),
				enableSorting: false,
				enableHiding: false,
			},
			...dataColumns,
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					return <DropdownMenuAction row={row} onDelete={handleSingleDelete} />;
				},
			},
		] as ColumnDef<any>[];
	}, [content]);

	const table = useReactTable({
		data: content || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	// Function to handle single item deletion
	const handleSingleDelete = (item: any) => {
		setItemToDelete(item);
		setIsBulkDelete(false);
		setShowDeleteDialog(true);
	};

	// Function to handle bulk deletion
	const handleBulkDelete = () => {
		setIsBulkDelete(true);
		setShowDeleteDialog(true);
	};

	// Function to confirm and execute deletion
	// TODO: Fix api endpoints
	const confirmDelete = async () => {
		setIsDeleting(true);
		try {
			if (isBulkDelete) {
				// Get all selected items
				const selectedIds = Object.keys(rowSelection).map(
					(idx) => content[parseInt(idx)].id,
				);

				// Call API to delete multiple items
				await api.delete(`/v1/menu/${menuId}/content/${contentName}/bulk`, {
					data: { ids: selectedIds },
				});

				toast.success(`Successfully deleted ${selectedIds.length} items`);
				setRowSelection({});
			} else if (itemToDelete) {
				// Call API to delete single item
				await api.delete(
					`/v1/menu/${menuId}/content/${contentName}/${itemToDelete.id}`,
				);
				toast.success("Item deleted successfully");
			}

			// Refresh data (you might want to implement a better refresh strategy)
			revalidator.revalidate();
		} catch (error) {
			let errorMessage = "Failed to delete item(s)";
			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
			setItemToDelete(null);
		}
	};

	if (!content || content.length === 0) {
		return (
			<div className="flex flex-col gap-6">
				<Title title={`${contentName} Content`}>
					<NewContentDialog
						schema={theme_schemas}
						uiSchema={ui_schemas}
						contentName={contentName || ""}>
						<Button>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add New Content
						</Button>
					</NewContentDialog>
				</Title>

				<div className="flex flex-col gap-4 items-center justify-center p-8 text-center">
					<div className="text-muted-foreground">
						<FileX className="h-16 w-16 mx-auto mb-2" />
						<h3 className="text-lg font-medium">No content found</h3>
						<p>This menu doesn&apos;t have any content available.</p>

						<NewContentDialog
							schema={theme_schemas}
							uiSchema={ui_schemas}
							contentName={contentName || ""}>
							<Button
								variant="link"
								className="text-primary underline text-md font-normal">
								Create a new content
							</Button>
						</NewContentDialog>
					</div>
				</div>
			</div>
		);
	}

	// TODO: Make the table responsive
	// TODO: Add a search input to the table
	// TODO: Add a filter to the table
	// TODO: Add a sort to the table
	return (
		<div className="flex flex-col gap-6">
			<Title title={`${contentName} Content`}>
				<div className="flex items-center gap-2">
					{Object.keys(rowSelection).length > 0 && (
						<Button
							variant="destructive"
							size="sm"
							onClick={handleBulkDelete}
							disabled={isDeleting}>
							<Trash className="h-4 w-4 mr-2" />
							Delete Selected ({Object.keys(rowSelection).length})
						</Button>
					)}

					<NewContentDialog
						schema={theme_schemas}
						uiSchema={ui_schemas}
						contentName={contentName || ""}>
						<Button>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add New Content
						</Button>
					</NewContentDialog>
				</div>
			</Title>

			<div className="border rounded-md p4">
				{/* Content data table will be added here */}
				<div className="text-muted-foreground">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
												  )}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{/* TODO: Implement pagination from the backend, and adapt tanstack pagination to it */}
				{/* TODO: If there are more than 10 rows, show the pagination */}
				<div className="flex items-center justify-end space-x-2 p-4">
					{/* <div className="flex-1 text-sm text-muted-foreground">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div> */}
					{/* <div className="space-x-2"> */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
					{/* </div> */}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							{isBulkDelete
								? `This will permanently delete ${
										Object.keys(rowSelection).length
								  } selected items.`
								: "This will permanently delete this item."}
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={isDeleting}
							className="bg-destructive hover:bg-destructive/90">
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function DropdownMenuAction({
	row,
	onDelete,
}: {
	row: Row<any>;
	onDelete: (item: any) => void;
}) {
	const content = row.original;
	const { contentName, menuId } = useParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
				<DropdownMenuItem asChild>
					<Link
						to={`/menu/${menuId}/content/${contentName}/edit/${content.id}`}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					variant="destructive"
					onClick={() => onDelete(content)}>
					<Trash className="h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Custom cell renderer function to handle different data types
const renderCellValue = (
	value: any,
	columnKey: string,
	ui_schemas?: UiSchema,
	contentName?: string,
) => {
	// Handle null/undefined values
	if (value === null || value === undefined) {
		return <span className="text-muted-foreground">-</span>;
	}

	// Handle relation fields (objects with id and name properties)
	if (typeof value === "object" && value !== null) {
		// Check if this is a relation field based on UI schema (highest priority)
		// UI schema structure: ui_schemas[contentName][fieldName]
		const fieldUiSchema = contentName
			? ui_schemas?.[contentName]?.[columnKey]
			: undefined;
		if (fieldUiSchema?.["ui:options"]?.relationLabel) {
			const relationLabel = fieldUiSchema["ui:options"].relationLabel;
			const relationValue = fieldUiSchema["ui:options"].relationValue || "id";

			return (
				<div className="flex flex-col">
					<span className="fontmedium">
						{value[relationLabel] || value.name}
					</span>
					{/* <span className="text-xs text-muted-foreground">
						ID: {value[relationValue]}
					</span> */}
				</div>
			);
		}

		// Fallback: Check if this looks like a relation field (has id and name properties)
		if (value.id && value.name) {
			return (
				<div className="flex flex-col">
					<span className="font-medium">{value.name}</span>
					<span className="text-xs text-muted-foreground">ID: {value.id}</span>
				</div>
			);
		}

		// For other objects, show a summary
		const keys = Object.keys(value);
		if (keys.length <= 3) {
			// For small objects, show key-value pairs
			return (
				<div className="text-xs space-y-1">
					{keys.map((key) => (
						<div key={key} className="flex justify-between">
							<span className="text-muted-foreground">{key}:</span>
							<span>{String(value[key])}</span>
						</div>
					))}
				</div>
			);
		} else {
			// For larger objects, show a summary
			return (
				<span className="text-muted-foreground">{keys.length} properties</span>
			);
		}
	}

	// Handle arrays
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return <span className="text-muted-foreground">Empty</span>;
		}
		if (value.length <= 3) {
			return (
				<div className="text-xs space-y-1">
					{value.map((item, index) => (
						<div key={index}>
							{typeof item === "object" && item !== null && item.name
								? item.name
								: String(item)}
						</div>
					))}
				</div>
			);
		} else {
			return (
				<span className="text-muted-foreground">{value.length} items</span>
			);
		}
	}

	// Handle primitive values
	return <span>{String(value)}</span>;
};
