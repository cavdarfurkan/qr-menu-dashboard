import { useParams, useNavigate, useRevalidator } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import Title from "~/components/Title";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import RJSFForm from "@rjsf/shadcn";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import templates from "~/components/RJSFTemplates";
import widgets from "~/components/rjsf/Widgets";
import fields from "~/components/rjsf/Fields";
import { useMenuStore } from "~/stores";
import { useTranslation } from "react-i18next";

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

export default function MenuContentEdit() {
	const { t } = useTranslation(["content", "menu", "common", "error"]);
	const { menuId, contentName, itemId } = useParams();
	const navigate = useNavigate();

	const setMenuId = useMenuStore((state) => state.setMenuId);
	const setContentName = useMenuStore((state) => state.setContentName);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [menu, setMenu] = useState<MenuType | null>(null);
	const [schemas, setSchemas] = useState<SchemasType | null>(null);
	const [contentItem, setContentItem] = useState<any>(null);
	const [formData, setFormData] = useState<any>(null);
	const [relationContentLists, setRelationContentLists] = useState<
		Record<string, any[]>
	>({});

	useEffect(() => {
		setMenuId(menuId);
		setContentName(contentName);
	}, [menuId, contentName]);

	// Load menu details, schemas, and content item
	// TODO: Move this all to loader function
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Load menu details
				const menuResponse = await api.get<ApiResponse>(`/v1/menu/${menuId}`);
				if (!menuResponse.data.success) {
					throw new Error(menuResponse.data.message || "Failed to load menu");
				}
				const menuData = menuResponse.data.data as MenuType;
				setMenu(menuData);

				// Load theme schemas
				const schemasResponse = await api.get<ApiResponse>(
					`/v1/theme/${menuData.selectedThemeId}/schemas`,
					{
						params: {
							refs: contentName,
							uiSchema: "1",
						},
					},
				);

				let schemasData: SchemasType = {
					schemas_count: 0,
					theme_schemas: {},
					ui_schemas: {},
				};
				if (schemasResponse.data.success) {
					schemasData = schemasResponse.data.data as SchemasType;
					schemasData.ui_schemas = schemasData.ui_schemas || {};
					setSchemas(schemasData);
				}

				// Load content item
				const contentResponse = await api.get<ApiResponse>(
					`/v1/menu/${menuId}/content/${contentName}/${itemId}`,
				);

				if (contentResponse.data.success) {
					const itemData = contentResponse.data.data;
					setContentItem(itemData);

					// Get uiSchema to determine relation fields
					const currentUiSchema = schemasData.ui_schemas?.[contentName!] || {};

					// Find all relation fields from uiSchema
					const relationFields: { key: string; isMultiple: boolean }[] = [];
					Object.keys(currentUiSchema).forEach((key) => {
						const fieldUiSchema = currentUiSchema[key] as any;
						if (fieldUiSchema?.["ui:field"] === "relationSelect") {
							relationFields.push({
								key,
								isMultiple: !!fieldUiSchema?.["ui:options"]?.isMultiple,
							});
						}
					});

					// Fetch content lists for all relation fields to get UUIDs
					const fetchedContentLists: Record<string, any[]> = {};
					await Promise.all(
						relationFields.map(async ({ key }) => {
							try {
								const response = await api.get<ApiResponse>(
									`/v1/menu/${menuId}/content/${key}`,
								);
								if (
									response.data.success &&
									Array.isArray(response.data.data)
								) {
									fetchedContentLists[key] = response.data.data;
								}
							} catch (err) {
								console.error(`Failed to load content list for ${key}:`, err);
							}
						}),
					);

					// Save content lists to state for RelationSelect to use
					setRelationContentLists(fetchedContentLists);

					// Start with non-relation fields from itemData.data
					const transformedData: any = { ...itemData.data };

					// For each relation field, match resolved data with content list to get UUID
					relationFields.forEach(({ key, isMultiple }) => {
						const resolvedValue = itemData.resolved?.[key];
						const contentList = fetchedContentLists[key] || [];

						if (isMultiple) {
							// Multi-select: match each item by content ID to get UUID wrapper
							const items = Array.isArray(resolvedValue) ? resolvedValue : [];
							transformedData[key] = items
								.map((item: any) => {
									// Find matching item from content list by data.id
									const contentId = item.id || item.data?.id;
									return contentList.find(
										(listItem) => listItem.data?.id === contentId,
									);
								})
								.filter(Boolean);
						} else {
							// Single-select: match by content ID to get UUID wrapper
							const item = Array.isArray(resolvedValue)
								? resolvedValue[0]
								: resolvedValue;
							if (item) {
								const contentId = item.id || item.data?.id;
								const matched = contentList.find(
									(listItem) => listItem.data?.id === contentId,
								);
								transformedData[key] = matched || null;
							}
						}
					});

					setFormData(transformedData);
				} else {
					throw new Error(
						contentResponse.data.message || "Failed to load content item",
					);
				}
			} catch (error) {
				console.error("Error loading data:", error);
				if (isAxiosError(error)) {
					setError(error.response?.data?.message || "Failed to load data");
				} else {
					setError(
						error instanceof Error
							? error.message
							: "An unexpected error occurred",
					);
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (menuId && contentName && itemId) {
			loadData();
		}
	}, [menuId, contentName, itemId]);

	const handleChange = (data: any) => {
		// delete data.formData.category;
		// data.formData = {
		// 	...data.formData,
		// 	category: {
		// 		id: "123",
		// 		name: "name",
		// 		slug: "slug",
		// 	},
		// };
		// console.log(data.formData);
		setFormData(data.formData);
	};

	const handleSubmit = async (data: any) => {
		setIsSaving(true);
		try {
			const formData = data.formData;
			const currentUiSchema = schemas?.ui_schemas?.[contentName!] || {};

			const new_content: any = {};
			const relations: Record<string, string[]> = {};

			Object.keys(formData).forEach((key) => {
				const value = formData[key];
				const fieldUiSchema = currentUiSchema[key] as any;

				// Check for relationSelect field (lowercase 'r')
				if (fieldUiSchema?.["ui:field"] === "relationSelect") {
					const isMultiple = fieldUiSchema?.["ui:options"]?.isMultiple;

					if (isMultiple) {
						// Multi-select: extract UUIDs from array (or empty array if cleared)
						if (Array.isArray(value)) {
							relations[key] = value
								.filter((item: any) => item?.id) // Filter items that have id
								.map((item: any) => item.id);
						} else {
							relations[key] = []; // Cleared or invalid - send empty array
						}
						new_content[key] = []; // placeholder for backend
					} else {
						// Single select: extract UUID
						if (value && typeof value === "object" && value.id) {
							relations[key] = [value.id];
						} else {
							relations[key] = []; // Cleared - send empty array
						}
						new_content[key] = { id: "", slug: "", name: "" }; // placeholder for backend
					}
				} else {
					new_content[key] = value;
				}
			});

			await api.put(`/v1/menu/${menuId}/content/${contentName}/${itemId}`, {
				new_content,
				relations,
			});
			toast.success(t("content:content_updated"));
			navigate(`/menu/${menuId}/content/${contentName}`);
		} catch (error) {
			console.error("Error updating content:", error);
			let errorMessage = t("content:failed_to_update");
			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const handleBack = () => {
		navigate(`/menu/${menuId}/content/${contentName}`);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<Title title={t("menu:edit_content")}>
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common:buttons.back")}
					</Button>
				</Title>
				<div className="flex items-center justify-center p-8">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">{t("content:loading_content")}</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col gap-6">
				<Title title={t("menu:edit_content")}>
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common:buttons.back")}
					</Button>
				</Title>
				<Card>
					<CardHeader>
						<CardTitle className="text-destructive">
							{t("error:error")}
						</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={handleBack} variant="outline">
							{t("common:buttons.go_back")}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!menu || !schemas || !contentItem) {
		return (
			<div className="flex flex-col gap-6">
				<Title title={t("menu:edit_content")}>
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common:buttons.back")}
					</Button>
				</Title>
				<Card>
					<CardHeader>
						<CardTitle>{t("common:empty_states.not_found")}</CardTitle>
						<CardDescription>
							{t("error:requested_content_not_found")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={handleBack} variant="outline">
							{t("common:buttons.go_back")}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* <pre>contentItem: {JSON.stringify(contentItem, null, 2)}</pre> */}
			{/* <pre>formData: {JSON.stringify(formData, null, 2)}</pre> */}
			<Title title={t("menu:edit_content_title", { contentName })}>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common:buttons.back")}
					</Button>
					<Button
						type="submit"
						form="edit-content-form"
						disabled={isSaving}
						className="ml-auto"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								{t("common:buttons.saving")}
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								{t("common:buttons.save_changes")}
							</>
						)}
					</Button>
				</div>
			</Title>

			<Card>
				<CardHeader>
					<CardTitle>{t("menu:edit_content")}</CardTitle>
					<CardDescription>
						{t("menu:edit_content_description", {
							contentName,
							menuName: menu.menuName,
						})}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<RJSFForm
						id="edit-content-form"
						schema={schemas.theme_schemas[contentName!]}
						uiSchema={schemas.ui_schemas[contentName!]}
						validator={validator}
						formData={formData}
						formContext={{ relationContentLists }}
						onChange={handleChange}
						onSubmit={handleSubmit}
						templates={templates}
						fields={fields}
						widgets={widgets}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
