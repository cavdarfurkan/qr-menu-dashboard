import type { Route } from "./+types/theme.detail";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import { Link, useNavigate, useRevalidator, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import Title from "~/components/Title";
import { useState } from "react";
import type { ThemeType } from "./themes";
import { useUserStore } from "~/stores";
import { unregisterTheme } from "~/lib/auth-api";
import { toast } from "sonner";

type ThemeDetailResponse = ApiResponse & {
	data: ThemeType;
};

export async function clientLoader({
	params,
}: Route.ClientLoaderArgs): Promise<ThemeDetailResponse> {
	try {
		const response = await api.get<ApiResponse>(`/v1/theme/${params.id}`);

		if (!response.data.success || !response.data.data) {
			return {
				success: false,
				message:
					response.data.message ||
					i18n.t("error:error_getting_theme", {
						defaultValue: "Failed to load theme",
					}),
				data: null,
				timestamp: response.data.timestamp || Date.now().toString(),
			} as ThemeDetailResponse;
		}

		const themeData = response.data.data as any;

		// Ensure themeManifest exists - API might return it nested or flat
		// If themeManifest is missing, try to construct it from the data
		if (!themeData.themeManifest) {
			// Check if the data is already flat (name, description, etc. at root level)
			if (themeData.name || themeData.description) {
				themeData.themeManifest = {
					name: themeData.name || "",
					version: themeData.version || "",
					description: themeData.description || "",
					author: themeData.author || "",
					createdAt: themeData.createdAt || themeData.created_at || "",
					schemasLocation:
						themeData.schemasLocation || themeData.schemas_location || [],
				};
			}
		}

		return {
			...response.data,
			data: themeData,
		} as ThemeDetailResponse;
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message:
					errorResponse?.data?.message ??
					i18n.t("error:error_getting_theme", {
						defaultValue: "Failed to load theme",
					}),
				data: null,
				timestamp: errorResponse?.data.timestamp,
			} as ThemeDetailResponse;
		}

		return {
			success: false,
			message: i18n.t("error:unexpected_error"),
			data: null,
			timestamp: Date.now().toString(),
		} as ThemeDetailResponse;
	}
}

export default function ThemeDetail({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation(["theme", "common", "error"]);
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const { canUnregisterThemes } = useUserStore();
	const { id } = useParams();
	const [imageError, setImageError] = useState(false);
	const [isUnregistering, setIsUnregistering] = useState(false);

	if (!loaderData.success || !loaderData.data) {
		return (
			<div className="flex flex-col gap-4">
				<Button variant="outline" asChild>
					<Link to="/theme" viewTransition>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("common:buttons.back", { defaultValue: "Back" })}
					</Link>
				</Button>
				<Card>
					<CardHeader>
						<CardTitle>{t("error:error")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{loaderData.message}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const theme: ThemeType = loaderData.data;

	// Handle case where themeManifest might be missing or undefined
	// The API might return theme data in a different structure
	if (!theme?.themeManifest) {
		console.error("Theme data structure issue:", theme);
		return (
			<div className="flex flex-col gap-4">
				<Button variant="outline" asChild>
					<Link to="/theme" viewTransition>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("common:buttons.back", { defaultValue: "Back" })}
					</Link>
				</Button>
				<Card>
					<CardHeader>
						<CardTitle>{t("error:error")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							{t("error:error_getting_theme", {
								defaultValue: "Failed to load theme: Invalid theme data",
							})}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}
	const handleImageError = () => {
		setImageError(true);
	};

	const handleUnregister = async () => {
		const ownerUsername = theme.themeManifest?.author || theme.ownerUsername;

		if (!canUnregisterThemes(ownerUsername)) {
			toast.error(
				t("error:unauthorized_theme_unregistration", {
					defaultValue:
						"You are not allowed to unregister this theme. Developer, admin, or owner role is required.",
				}),
			);
			return;
		}

		// Get theme ID from route params or theme object
		const themeId = id ? parseInt(id, 10) : theme.id;

		if (!themeId || isNaN(themeId)) {
			toast.error(
				t("error:error_getting_theme", {
					defaultValue: "Invalid theme ID",
				}),
			);
			return;
		}

		setIsUnregistering(true);

		try {
			const result = await unregisterTheme(themeId);

			if (result.success) {
				toast.success(
					result.message ||
						t("theme:unregister.success", {
							defaultValue: "Theme unregistered successfully",
						}),
				);
				// Navigate back to themes list after successful unregistration
				navigate("/theme", { replace: true });
			} else {
				toast.error(
					result.message ||
						t("theme:unregister.error", {
							defaultValue: "Failed to unregister theme",
						}),
				);
			}
		} catch (err: any) {
			const message =
				err?.response?.data?.message ||
				t("theme:unregister.error", {
					defaultValue: "Failed to unregister theme",
				});
			toast.error(message);
		} finally {
			setIsUnregistering(false);
		}
	};

	const categoryLabels: Record<string, string> = {
		RESTAURANT: t("theme:categories.restaurant", {
			defaultValue: "Restaurant",
		}),
		CAFE: t("theme:categories.cafe", { defaultValue: "Cafe" }),
		BAR: t("theme:categories.bar", { defaultValue: "Bar" }),
		BAKERY: t("theme:categories.bakery", { defaultValue: "Bakery" }),
		FOOD_TRUCK: t("theme:categories.food_truck", {
			defaultValue: "Food Truck",
		}),
		OTHER: t("theme:categories.other", { defaultValue: "Other" }),
	};

	const ownerUsername = theme.themeManifest?.author || theme.ownerUsername;
	const canUnregister = canUnregisterThemes(ownerUsername);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<Button variant="outline" asChild className="w-fit">
					<Link to="/theme" viewTransition>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("common:buttons.back", { defaultValue: "Back" })}
					</Link>
				</Button>
				{canUnregister && (
					<Button
						variant="destructive"
						onClick={handleUnregister}
						disabled={isUnregistering}
						className="w-fit"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{isUnregistering
							? t("common:buttons.loading", { defaultValue: "Loading..." })
							: t("theme:unregister.action", {
									defaultValue: "Unregister theme",
								})}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Theme Image */}
				<Card>
					<CardHeader>
						<CardTitle>
							{t("theme:detail.preview", { defaultValue: "Preview" })}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{theme.thumbnailUrl && !imageError ? (
							<div className="w-full aspect-video overflow-hidden rounded-lg">
								<img
									src={theme.thumbnailUrl}
									alt={theme.themeManifest?.name || "Theme preview"}
									className="w-full h-full object-cover"
									onError={handleImageError}
								/>
							</div>
						) : (
							<div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
								<span className="text-gray-400 dark:text-gray-500">
									{t("common:labels.no_image", { defaultValue: "No image" })}
								</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Theme Information */}
				<Card>
					<CardHeader>
						<CardTitle>
							{t("theme:detail.information", { defaultValue: "Information" })}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
								{t("theme:detail.name", { defaultValue: "Name" })}
							</label>
							<p className="text-lg font-semibold">
								{theme.themeManifest?.name || "N/A"}
							</p>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
								{t("theme:detail.description", { defaultValue: "Description" })}
							</label>
							<p className="text-sm">
								{theme.themeManifest?.description || "N/A"}
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{t("theme:detail.author", { defaultValue: "Author" })}
								</label>
								<p className="text-sm">
									{theme.themeManifest?.author || "N/A"}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{t("theme:detail.version", { defaultValue: "Version" })}
								</label>
								<p className="text-sm">
									{theme.themeManifest?.version || "N/A"}
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{theme.category && (
								<Badge variant="secondary">
									{categoryLabels[theme.category] || theme.category}
								</Badge>
							)}
							{theme.isFree && (
								<Badge
									variant="default"
									className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									{t("common:labels.is_free")}
								</Badge>
							)}
						</div>

						{theme.themeManifest?.createdAt && (
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{t("theme:detail.created_at", { defaultValue: "Created At" })}
								</label>
								<p className="text-sm">
									{new Date(theme.themeManifest.createdAt).toLocaleDateString()}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
