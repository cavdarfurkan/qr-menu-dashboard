import type { Route } from "./+types/menu.detail";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Form, Link, useFetcher, useNavigate } from "react-router";
import Title from "~/components/Title";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import SelectThemeDialog from "~/components/SelectThemeDialog";

import RJSFForm from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	ArrowRight,
	FileText,
	FileX,
	MoreHorizontal,
	RefreshCw,
	Trash,
} from "lucide-react";
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
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

type MenuType = {
	menuId: number;
	menuName: string;
	ownerUsername: string;
	selectedThemeId: number;
};

type SchemasType = {
	schemas_count: number;
	theme_schemas: RJSFSchema;
};

type MenuDetailResponse = ApiResponse & SchemasType;

export async function clientLoader({
	params,
}: Route.ClientLoaderArgs): Promise<MenuDetailResponse> {
	try {
		const response = await api
			.get<ApiResponse>(`/v1/menu/${params.id}`)
			.then((res) => res.data);

		const schemasResponse = await api
			.get(`/v1/theme/${response.data.selectedThemeId}/schemas`)
			.then((res) => res.data.data as SchemasType);

		// console.log(response);
		// console.log(schemasResponse);

		return {
			...response,
			...schemasResponse,
		} as MenuDetailResponse;
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message: errorResponse?.data?.message ?? i18n.t("error:error_getting_menu"),
				data: null,
				timestamp: errorResponse?.data.timestamp,
				schemas_count: 0,
				theme_schemas: {},
			} as MenuDetailResponse;
		}

		return {
			success: false,
			message: i18n.t("error:unexpected_error"),
			data: null,
			timestamp: Date.now().toString(),
			schemas_count: 0,
			theme_schemas: {},
		} as MenuDetailResponse;
	}
}

export async function clientAction({
	request,
	params,
}: Route.ClientActionArgs): Promise<ApiResponse> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as unknown as { menuName: string };

	try {
		const response = await api.put(`/v1/menu/${params.id}`, {
			menuName: data.menuName,
		});

		return { ...response.data };
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message: errorResponse?.data?.message ?? i18n.t("error:error_updating_menu"),
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: i18n.t("error:unexpected_error"),
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

// TODO: Change menu theme
// TODO: Add content
// TODO: Build theme
export default function MenuDetail({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation(["menu", "common", "error"]);
	const response = loaderData as MenuDetailResponse;
	if (!response.success) {
		return <p> {response.message} </p>;
	}

	const menu: MenuType | undefined = response.data;
	if (menu === null || menu === undefined) {
		return;
	}

	const navigate = useNavigate();

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const schemas: SchemasType = {
		schemas_count: response.schemas_count,
		theme_schemas: response.theme_schemas,
	};

	const handleDeleteMenu = () => {
		setShowDeleteDialog(true);
	};

	const confirmDeleteMenu = async () => {
		setIsDeleting(true);
		try {
			await api.delete(`/v1/menu/delete/${menu.menuId}`);
			toast.success(t("menu:menu_deleted_success"));
			navigate("/menu", { replace: true, viewTransition: true });
		} catch (error) {
			let errorMessage = t("error:failed_to_delete_menu");
			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	// TODO: Add icons to menu actions
	return (
		<div className="flex flex-col gap-6">
			<Title title={menu.menuName.toUpperCase()}>
				<DropdownMenu>
					<DropdownMenuTrigger className="ml-auto" asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<span className="sr-only">{t("common:actions.open_menu")}</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{/* <DropdownMenuLabel className="font-semibold">Menu</DropdownMenuLabel> */}

						<DropdownMenuItem asChild>
							{/* TODO: Change link */}
							<Link to={`/menu/change-theme/${menu.menuId}`}>{t("menu:change_theme")}</Link>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							{/* TODO: Change link */}
							<Link to={`/menu/build/${menu.menuId}`}>{t("menu:build")}</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							variant="destructive"
							onClick={() => handleDeleteMenu()}>
							<Trash className="h-4 w-4" />
							{t("common:buttons.delete")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Title>

			<MenuDetails menu={menu} />
			<MenuContent schemas={schemas} menuId={menu.menuId.toString()} />

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("common:confirmations.are_you_sure")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("common:confirmations.delete_menu")} {t("common:confirmations.cannot_be_undone")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>{t("common:buttons.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							disabled={isDeleting}
							onClick={confirmDeleteMenu}>
							{isDeleting ? t("common:buttons.deleting") : t("common:buttons.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

const menuDetailsFormSchema = (t: (key: string) => string) => z.object({
	menuName: z.string().min(3, { error: t("validation:name_required") }),
	selectedThemeId: z.number({ error: t("validation:theme_required") }),
});

type MenuDetailsFormData = z.infer<ReturnType<typeof menuDetailsFormSchema>>;

// TODO: Rename: MenuDetails to MenuDetailsForm
function MenuDetails({ menu }: { menu: MenuType }) {
	const { t } = useTranslation(["common", "validation"]);
	const fetcher = useFetcher();

	const [error, setError] = useState<string | null>(null);
	const isLoading = fetcher.state !== "idle";
	const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);

	const form = useForm<MenuDetailsFormData>({
		resolver: zodResolver(menuDetailsFormSchema(t)),
		defaultValues: {
			menuName: menu.menuName,
			selectedThemeId: menu.selectedThemeId,
		},
	});

	// TODO: Add update endpoint to backend, then continue here
	const onSubmit = (data: MenuDetailsFormData) => {
		setError(null);
		console.log(data);
		// fetcher.submit(data, { method: "PUT", action: `/menu/${menu.menuId}` });
	};

	const handleThemeSelect = (id: number) => {
		setSelectedThemeId(id);
		form.setValue("selectedThemeId", id);
	};

	return (
		<FormProvider {...form}>
			<Form
				className="flex flex-col gap-2"
				method="post"
				replace
				viewTransition
				onSubmit={form.handleSubmit(onSubmit)}>
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
						{error}
					</div>
				)}
				{fetcher.data?.error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
						{fetcher.data.error}
					</div>
				)}

				<FormField
					control={form.control}
					name="menuName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("common:labels.menu_name")}</FormLabel>
							<FormControl>
								<Input
									id="menuName"
									type="text"
									placeholder={t("common:labels.menu_name")}
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="selectedThemeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("common:labels.select_theme")}</FormLabel>
							<FormControl>
								<div>
									<Input
										type="hidden"
										{...field}
										value={selectedThemeId || ""}
									/>
									<SelectThemeDialog
										content={{
											fetchUrl: "/v1/theme",
											onClick: handleThemeSelect,
										}}>
										<Button type="button" variant="outline" className="w-full">
											{selectedThemeId
												? t("common:labels.theme_selected", { id: selectedThemeId })
												: t("common:labels.select_theme")}
										</Button>
									</SelectThemeDialog>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="submit" className="wfull" disabled={isLoading}>
						{t("common:buttons.save")}
					</Button>
				</div>
			</Form>
		</FormProvider>
	);
}

// TODO: Rename: MenuContent to MenuContentList
function MenuContent({
	schemas,
	menuId,
}: {
	schemas: SchemasType;
	menuId: string;
}) {
	const { t } = useTranslation(["menu", "common"]);
	const navigate = useNavigate();

	if (schemas.schemas_count === 0) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center p-8 text-center">
				<div className="text-muted-foreground">
					<FileX className="h-16 w-16 mx-auto mb-2" />
					<h3 className="text-lg font-medium">{t("menu:no_schemas")}</h3>
					<p>{t("menu:no_schemas_description")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<Title title={t("menu:menu_content")} titleSize="lg">
				{/* TODO: Remove refresh schemas button (maybe) */}
				<Button variant="outline" size="sm">
					<RefreshCw className="h-4 w-4 mr-2" />
					{t("common:actions.refresh_schemas")}
				</Button>
			</Title>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Object.entries(schemas.theme_schemas).map(
					([key, schema]: [string, RJSFSchema]) => (
						<Link
							to={`/menu/${menuId}/content/${key}`}
							key={key}
							className="block">
							<Card className="hover:border-primary/50 transition-colors cursor-pointer">
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center">
										<FileText className="h-5 w-5 mr-2" />
										{key}
									</CardTitle>
									<CardDescription>
										{schema.description || t("common:messages.content_schema_description")}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground">
										{schema.properties
											? t("common:messages.properties_defined", { count: Object.keys(schema.properties).length })
											: t("common:messages.no_properties_defined")}
									</div>
								</CardContent>
								<CardFooter>
									{/* <Link
										className="ml-auto"
										to={`/menu/${menuId}/content/${key}`}
										onClick={(e) => e.stopPropagation()}
									> */}
									<Button variant="ghost" className="ml-auto">
										<ArrowRight className="h-4 w-4 mr-2" />
										{t("common:actions.view_content")}
									</Button>
									{/* </Link> */}
								</CardFooter>
							</Card>
						</Link>
					),
				)}
			</div>
		</div>
	);
}
