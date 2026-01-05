import type { Route } from "./+types/menu.detail";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import { Button } from "~/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useBuildPolling } from "~/hooks/use-build-polling";
import {
	Form,
	Link,
	useFetcher,
	useNavigate,
	useRevalidator,
} from "react-router";
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
	ArrowLeft,
	ArrowRight,
	Check,
	Clock,
	FileText,
	FileX,
	Loader2,
	MoreHorizontal,
	RefreshCw,
	Trash,
	X,
	ExternalLink,
	AlertTriangle,
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
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
import { Badge } from "~/components/ui/badge";

type MenuType = {
	menuId: number;
	menuName: string;
	ownerUsername: string;
	selectedThemeId: number;
	customDomain?: string;
	published?: boolean;
	isLatest: boolean;
};

import type { BuildStatus, BuildState } from "~/hooks/use-build-polling";

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
				message:
					errorResponse?.data?.message ?? i18n.t("error:error_getting_menu"),
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
	const data = Object.fromEntries(formData) as unknown as {
		menuName: string;
		selectedThemeId: string;
		customDomain?: string;
	};

	try {
		const payload: {
			menu_name: string;
			selected_theme_id?: number;
			custom_domain?: string;
		} = {
			menu_name: data.menuName,
		};

		if (data.selectedThemeId) {
			payload.selected_theme_id = parseInt(data.selectedThemeId, 10);
		}

		if (data.customDomain) {
			payload.custom_domain = data.customDomain;
		}

		const response = await api.put(`/v1/menu/${params.id}`, payload);

		return { ...response.data };
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message:
					errorResponse?.data?.message ?? i18n.t("error:error_updating_menu"),
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
	const { t } = useTranslation(["menu", "common", "error", "home"]);
	const response = loaderData as MenuDetailResponse;
	if (!response.success) {
		return <p> {response.message} </p>;
	}

	const menu: MenuType | undefined = response.data;
	if (menu === null || menu === undefined) {
		return;
	}

	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const { buildState, initiateBuild } = useBuildPolling(menu.menuId);

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isBuilding, setIsBuilding] = useState(false);
	const [showBuildDialog, setShowBuildDialog] = useState(false);

	const schemas: SchemasType = {
		schemas_count: response.schemas_count,
		theme_schemas: response.theme_schemas,
	};

	// Show dialog when build is active
	useEffect(() => {
		if (buildState) {
			if (
				buildState.status === "PENDING" ||
				buildState.status === "PROCESSING"
			) {
				setShowBuildDialog(true);
			} else if (
				buildState.status === "DONE" ||
				buildState.status === "FAILED"
			) {
				// Show dialog for completion status
				setShowBuildDialog(true);
				// Auto-close after showing completion status
				const timer = setTimeout(() => {
					setShowBuildDialog(false);
				}, 3000);
				return () => clearTimeout(timer);
			}
		} else {
			// Build state cleared, close dialog
			setShowBuildDialog(false);
		}
	}, [buildState]);

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

	const handleBack = () => {
		navigate("/menu");
	};

	const handleRebuildMenu = async () => {
		setIsBuilding(true);
		try {
			const buildResponse = await api.post("/v1/menu/build", {
				menu_id: menu.menuId,
			});

			if (buildResponse.data.success) {
				const statusUrl = buildResponse.data.data.status_url;
				// Extract jobId from status_url (format: /api/v1/menu/job/{jobId})
				const jobIdMatch = statusUrl.match(/\/job\/([^/]+)$/);
				if (jobIdMatch) {
					const jobId = jobIdMatch[1];
					initiateBuild(menu.menuId, jobId);
					revalidator.revalidate();
				} else {
					toast.error(t("menu:build_error"));
				}
			} else {
				toast.error(buildResponse.data.message || t("menu:build_error"));
			}
		} catch (error) {
			let errorMessage = t("menu:build_error");
			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsBuilding(false);
		}
	};

	// TODO: Add icons to menu actions
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common:buttons.back")}
					</Button>
					<h2 className="text-xl font-semibold">
						{menu.menuName.toUpperCase()}
					</h2>
					{menu.published !== undefined && (
						<>
							{menu.published ? (
								<Badge variant="secondary">{t("home:published")}</Badge>
							) : (
								<Badge variant="outline">{t("home:unpublished")}</Badge>
							)}
						</>
					)}
					<div className="ml-auto">
						<DropdownMenu>
							<DropdownMenuTrigger className="ml-auto" asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<span className="sr-only">
										{t("common:actions.open_menu")}
									</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={handleRebuildMenu}
									disabled={
										isBuilding ||
										buildState?.status === "PENDING" ||
										buildState?.status === "PROCESSING"
									}
								>
									{isBuilding ||
									buildState?.status === "PENDING" ||
									buildState?.status === "PROCESSING"
										? t("menu:building")
										: t("menu:build_publish")}
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={async () => {
										try {
											const unpublishResponse = await api.post(
												`/v1/menu/${menu.menuId}/unpublish`,
											);

											if (unpublishResponse.data.success) {
												toast.success(t("menu:unpublish_success"));
												revalidator.revalidate();
											} else {
												toast.error(
													unpublishResponse.data.message ||
														t("menu:unpublish_error"),
												);
											}
										} catch (error) {
											let errorMessage = t("menu:unpublish_error");
											if (
												isAxiosError(error) &&
												error.response?.data?.message
											) {
												errorMessage = error.response.data.message;
											}
											toast.error(errorMessage);
										}
									}}
									disabled={!menu.published}
								>
									{t("menu:unpublish")}
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								<DropdownMenuItem
									variant="destructive"
									onClick={() => handleDeleteMenu()}
								>
									<Trash className="h-4 w-4" />
									{t("common:buttons.delete")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div className="h-px w-full bg-border" />
			</div>

			{!menu.isLatest && (
				<Card className="border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950">
					<CardHeader>
						<div className="flex items-start gap-3">
							<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
							<div className="flex-1">
								<CardTitle className="text-yellow-800 dark:text-yellow-200 text-base">
									{t("menu:needs_rebuild")}
								</CardTitle>
								<p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
									{t("menu:menu_not_latest")}
								</p>
							</div>
							<Button
								onClick={handleRebuildMenu}
								disabled={
									isBuilding ||
									buildState?.status === "PENDING" ||
									buildState?.status === "PROCESSING"
								}
								className="bg-yellow-600 hover:bg-yellow-700 text-white"
							>
								{isBuilding ||
								buildState?.status === "PENDING" ||
								buildState?.status === "PROCESSING" ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										{t("menu:building")}
									</>
								) : (
									t("menu:rebuild_menu")
								)}
							</Button>
						</div>
					</CardHeader>
				</Card>
			)}

			<MenuDetails menu={menu} />
			<MenuContent schemas={schemas} menuId={menu.menuId.toString()} />

			<Dialog
				open={showBuildDialog}
				onOpenChange={(open) => {
					// Only allow closing if build is done or failed
					if (
						!open &&
						(buildState?.status === "DONE" || buildState?.status === "FAILED")
					) {
						setShowBuildDialog(false);
					} else if (
						!open &&
						buildState?.status !== "DONE" &&
						buildState?.status !== "FAILED"
					) {
						// Prevent closing during build
						setShowBuildDialog(true);
					}
				}}
			>
				<DialogContent
					showCloseButton={
						buildState?.status === "DONE" || buildState?.status === "FAILED"
					}
				>
					<DialogHeader>
						<DialogTitle>{t("menu:build_publish")}</DialogTitle>
						<DialogDescription>
							{buildState?.status === "PENDING" &&
								t("menu:build_status_pending")}
							{buildState?.status === "PROCESSING" &&
								t("menu:build_status_processing")}
							{buildState?.status === "DONE" && t("menu:build_status_done")}
							{buildState?.status === "FAILED" && t("menu:build_status_failed")}
							{!buildState && t("menu:build_status_done")}
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center justify-center py-4">
						{buildState?.status === "PENDING" && (
							<Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
						)}
						{buildState?.status === "PROCESSING" && (
							<Loader2 className="h-8 w-8 text-primary animate-spin" />
						)}
						{(buildState?.status === "DONE" ||
							(!buildState && showBuildDialog)) && (
							<Check className="h-8 w-8 text-green-500" />
						)}
						{buildState?.status === "FAILED" && (
							<X className="h-8 w-8 text-red-500" />
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								if (
									buildState?.status === "DONE" ||
									buildState?.status === "FAILED"
								) {
									setShowBuildDialog(false);
								}
							}}
							disabled={
								buildState?.status !== "DONE" && buildState?.status !== "FAILED"
							}
						>
							{t("common:buttons.cancel")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("common:confirmations.are_you_sure")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("common:confirmations.delete_menu")}{" "}
							{t("common:confirmations.cannot_be_undone")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							{t("common:buttons.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							disabled={isDeleting}
							onClick={confirmDeleteMenu}
						>
							{isDeleting
								? t("common:buttons.deleting")
								: t("common:buttons.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

// Utility function to extract subdomain from user input
// Handles: protocol stripping, returns clean domain/subdomain
const extractSubdomain = (input: string): string => {
	if (!input) return "";

	// Trim whitespace
	let domain = input.trim();

	// Strip protocol (http:// or https://)
	domain = domain.replace(/^https?:\/\//i, "");

	// Remove trailing slash
	domain = domain.replace(/\/$/, "");

	// Return the clean domain/subdomain
	return domain.trim();
};

// Utility function to format domain for display (with https://)
const formatDomainForDisplay = (domain: string): string => {
	if (!domain?.trim()) return "";
	return `https://${domain.trim()}`;
};

// Utility function to extract subdomain from full domain
// If backend returns "subdomain.example.com", extract "subdomain"
const extractSubdomainFromFullDomain = (fullDomain: string): string => {
	if (!fullDomain) return "";

	// Strip protocol if present
	let domain = fullDomain.replace(/^https?:\/\//i, "").trim();

	// Extract subdomain (everything before the first dot)
	const parts = domain.split(".");
	if (parts.length > 1) {
		// Return the first part (subdomain)
		return parts[0];
	}

	// If no dots, return as-is (might already be just subdomain)
	return domain;
};

// Utility function to generate subdomain from menu name
const generateSubdomain = (menuName: string): string => {
	// Slugify menu name: lowercase, replace spaces with hyphens, remove special chars
	const slug = menuName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.substring(0, 30); // Limit length

	// Generate random 6-character suffix
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let randomSuffix = "";
	for (let i = 0; i < 6; i++) {
		randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return `${slug}-${randomSuffix}`;
};

const menuDetailsFormSchema = (t: (key: string) => string) =>
	z.object({
		menuName: z.string().min(3, { error: t("validation:name_required") }),
		selectedThemeId: z.number({ error: t("validation:theme_required") }),
		customDomain: z.string().optional(),
	});

type MenuDetailsFormData = z.infer<ReturnType<typeof menuDetailsFormSchema>>;

// TODO: Rename: MenuDetails to MenuDetailsForm
function MenuDetails({ menu }: { menu: MenuType }) {
	const { t } = useTranslation(["common", "validation", "menu"]);
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
	const revalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isRevalidatingRef = useRef(false);

	const [error, setError] = useState<string | null>(null);
	const isLoading = fetcher.state !== "idle";
	const [selectedThemeId, setSelectedThemeId] = useState<number | null>(
		menu.selectedThemeId,
	);
	const [selectedThemeName, setSelectedThemeName] = useState<string | null>(
		null,
	);
	// Extract subdomain from backend domain (if exists)
	// Backend returns full domain (e.g., "subdomain.example.com"), extract just subdomain
	const getSubdomainFromBackend = (domain: string | undefined): string => {
		if (!domain) return "";
		return extractSubdomainFromFullDomain(domain);
	};

	const [customDomain, setCustomDomain] = useState<string>(
		getSubdomainFromBackend(menu.customDomain) ||
			generateSubdomain(menu.menuName),
	);
	const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
	const [availabilityStatus, setAvailabilityStatus] = useState<
		"available" | "taken" | null
	>(null);

	// Fetch theme name when component mounts or theme changes
	useEffect(() => {
		if (menu.selectedThemeId) {
			api
				.get(`/v1/theme/${menu.selectedThemeId}`)
				.then((response) => {
					if (response.data.success) {
						setSelectedThemeName(response.data.data?.name || null);
					}
				})
				.catch(() => {
					// Silently fail - theme name is optional
				});
		}
	}, [menu.selectedThemeId]);

	// Update theme name when selectedThemeId changes
	useEffect(() => {
		if (selectedThemeId && selectedThemeId !== menu.selectedThemeId) {
			api
				.get(`/v1/theme/${selectedThemeId}`)
				.then((response) => {
					if (response.data.success) {
						setSelectedThemeName(response.data.data?.name || null);
					}
				})
				.catch(() => {
					// Silently fail - theme name is optional
				});
		}
	}, [selectedThemeId, menu.selectedThemeId]);

	// Handle fetcher response
	useEffect(() => {
		if (fetcher.data) {
			if (fetcher.data.success) {
				toast.success(t("menu:menu_updated_success"));
				// Prevent multiple rapid revalidations
				if (revalidateTimeoutRef.current) {
					clearTimeout(revalidateTimeoutRef.current);
				}
				if (!isRevalidatingRef.current) {
					isRevalidatingRef.current = true;
					revalidateTimeoutRef.current = setTimeout(() => {
						revalidator.revalidate();
						isRevalidatingRef.current = false;
					}, 300);
				}
			} else {
				setError(
					fetcher.data.message || String(t("error:error_updating_menu" as any)),
				);
			}
		}
	}, [fetcher.data, t, revalidator]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (revalidateTimeoutRef.current) {
				clearTimeout(revalidateTimeoutRef.current);
			}
		};
	}, []);

	const form = useForm<MenuDetailsFormData>({
		resolver: zodResolver(menuDetailsFormSchema(t as (key: string) => string)),
		defaultValues: {
			menuName: menu.menuName,
			selectedThemeId: menu.selectedThemeId,
			customDomain:
				getSubdomainFromBackend(menu.customDomain) ||
				generateSubdomain(menu.menuName),
		},
	});

	// Auto-generate domain if not set
	useEffect(() => {
		if (!menu.customDomain && !customDomain) {
			const generated = generateSubdomain(menu.menuName);
			setCustomDomain(generated);
			form.setValue("customDomain", generated);
		}
	}, [menu.customDomain, menu.menuName]);

	const handleGenerateDomain = () => {
		const generated = generateSubdomain(menu.menuName);
		setCustomDomain(generated);
		form.setValue("customDomain", generated);
		setAvailabilityStatus(null);
	};

	const handleCheckAvailability = async () => {
		const subdomain = extractSubdomain(customDomain);
		if (!subdomain) {
			return;
		}

		setIsCheckingAvailability(true);
		setAvailabilityStatus(null);
		try {
			const response = await api.get("/v1/menu/domain/available", {
				params: { domain: subdomain },
			});

			if (response.data.success) {
				const isAvailable = response.data.data.available;
				setAvailabilityStatus(isAvailable ? "available" : "taken");
			} else {
				// Backend returned success: false with an error message
				const errorMessage =
					response.data.message || t("menu:error_checking_availability");
				setAvailabilityStatus("taken");
				toast.error(errorMessage);
			}
		} catch (error) {
			setAvailabilityStatus("taken");
			if (isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message ||
					error.message ||
					t("menu:error_checking_availability");
				toast.error(errorMessage);
			} else {
				toast.error(t("menu:error_checking_availability"));
			}
		} finally {
			setIsCheckingAvailability(false);
		}
	};

	const onSubmit = (data: MenuDetailsFormData) => {
		setError(null);
		const formData = new FormData();
		formData.append("menuName", data.menuName);
		if (data.selectedThemeId) {
			formData.append("selectedThemeId", data.selectedThemeId.toString());
		}
		if (data.customDomain?.trim()) {
			const subdomain = extractSubdomain(data.customDomain);
			if (subdomain) {
				// Send only subdomain to backend (no suffix)
				formData.append("customDomain", subdomain);
			}
		}
		fetcher.submit(formData, { method: "post" });
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
				onSubmit={form.handleSubmit(onSubmit)}
			>
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
										}}
									>
										<Button type="button" variant="outline" className="w-full">
											{selectedThemeName
												? selectedThemeName
												: selectedThemeId
													? t("common:labels.theme_selected", {
															id: selectedThemeId,
														})
													: t("common:labels.select_theme")}
										</Button>
									</SelectThemeDialog>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="customDomain"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("menu:domain_name")}</FormLabel>
							<FormControl>
								<div className="space-y-2">
									<div className="flex gap-2">
										<Input
											{...field}
											value={customDomain}
											onChange={(e) => {
												// Extract subdomain from user input (strip protocol)
												const subdomain = extractSubdomain(e.target.value);
												setCustomDomain(subdomain);
												field.onChange(subdomain);
												setAvailabilityStatus(null);
											}}
											placeholder="new-menu-test"
											disabled={isLoading}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleGenerateDomain}
											disabled={isLoading}
										>
											{t("menu:generate_domain")}
										</Button>
									</div>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={handleCheckAvailability}
											disabled={
												isLoading ||
												isCheckingAvailability ||
												!customDomain.trim()
											}
											className="flex-1"
										>
											{isCheckingAvailability
												? t("menu:checking_availability")
												: t("menu:check_availability")}
										</Button>
									</div>
									{availabilityStatus && (
										<div
											className={`text-sm ${
												availabilityStatus === "available"
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{availabilityStatus === "available"
												? t("menu:domain_available")
												: t("menu:domain_taken")}
										</div>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{menu.customDomain && (
					<div className="flex items-center gap-2 p-3 bg-muted rounded-md">
						<ExternalLink className="h-4 w-4 text-muted-foreground" />
						<a
							href={formatDomainForDisplay(menu.customDomain)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline flex-1"
						>
							{t("menu:view_published_site")}
						</a>
						<span className="text-xs text-muted-foreground">
							({t("menu:open_in_new_tab")})
						</span>
					</div>
				)}

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
							className="block"
						>
							<Card className="hover:border-primary/50 transition-colors cursor-pointer">
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center">
										<FileText className="h-5 w-5 mr-2" />
										{key}
									</CardTitle>
									<CardDescription>
										{schema.description ||
											t("common:messages.content_schema_description")}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground">
										{schema.properties
											? t("common:messages.properties_defined", {
													count: Object.keys(schema.properties).length,
												})
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
