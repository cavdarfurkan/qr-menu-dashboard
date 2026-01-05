import api, { type ApiResponse } from "~/lib/api";
import type { Route } from "./+types/themes";
import { isAxiosError } from "axios";
import {
	Link,
	useNavigate,
	useRevalidator,
	useSearchParams,
} from "react-router";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import { useCallback, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import Title from "~/components/Title";
import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import ThemeCard from "~/components/ThemeCard";
import { useUserStore } from "~/stores";
import { unregisterTheme } from "~/lib/auth-api";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export type ThemeType = {
	id: number;
	isFree: boolean;
	category?: string;
	thumbnailUrl?: string;
	ownerUsername?: string;
	themeManifest: {
		name: string;
		version: string;
		description: string;
		author: string;
		createdAt: string;
		schemasLocation: Array<{
			name: string;
			path: string;
			loader_location: string;
		}>;
	};
	themeSchemas: Record<string, any>;
};

type PaginationInfo = {
	totalPages: number;
	totalElements: number;
	number: number; // current page
	size: number; // page size
	first: boolean;
	last: boolean;
	empty: boolean;
	numberOfElements: number;
};

export async function clientLoader({
	request,
}: Route.ClientLoaderArgs): Promise<ApiResponse> {
	try {
		const url = new URL(request.url);
		const pageParam = url.searchParams.get("page") || "0";
		const sizeParam = url.searchParams.get("size");
		const categoryParam = url.searchParams.get("category");
		const myThemesParam = url.searchParams.get("myThemes") === "true";

		const params: Record<string, string> = {
			page: pageParam,
		};

		// Only add size param if it's explicitly set in the URL
		if (sizeParam) {
			params.size = sizeParam;
		}

		// Add category filter if provided
		if (categoryParam) {
			params.category = categoryParam;
		}

		// Use my-themes endpoint if filter is active
		const endpoint = myThemesParam ? "/v1/theme/my-themes" : "/v1/theme";
		const response = await api.get(endpoint, { params });
		return { ...response.data };
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message:
					errorResponse?.data?.message ?? i18n.t("error:error_getting_themes"),
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

export default function Themes({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation(["theme", "common", "error"]);
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const { canRegisterThemes, canUnregisterThemes } = useUserStore();
	const [searchParams] = useSearchParams();

	// Get filter values from URL
	const categoryParam = searchParams.get("category") || "ALL";
	const myThemesParam = searchParams.get("myThemes") === "true";

	const [selectedCategory, setSelectedCategory] = useState(categoryParam);
	const [myThemesOnly, setMyThemesOnly] = useState(myThemesParam);

	// Sync state with URL params when they change (e.g., browser back/forward)
	useEffect(() => {
		setSelectedCategory(categoryParam);
		setMyThemesOnly(myThemesParam);
	}, [categoryParam, myThemesParam]);

	// Update URL when filters change
	const updateFilters = useCallback(
		(category: string, myThemes: boolean) => {
			const url = new URL(window.location.href);

			// Reset to page 0 when filters change
			url.searchParams.set("page", "0");

			if (category && category !== "ALL") {
				url.searchParams.set("category", category);
			} else {
				url.searchParams.delete("category");
			}

			if (myThemes) {
				url.searchParams.set("myThemes", "true");
			} else {
				url.searchParams.delete("myThemes");
			}

			navigate(url.pathname + url.search, { replace: true });
		},
		[navigate],
	);

	// Handle category change
	const handleCategoryChange = (value: string) => {
		setSelectedCategory(value);
		updateFilters(value, myThemesOnly);
	};

	// Handle my themes toggle
	const handleMyThemesChange = (checked: boolean) => {
		setMyThemesOnly(checked);
		updateFilters(selectedCategory, checked);
	};

	if (!loaderData.success) {
		return <p> {loaderData.message} </p>;
	}

	const themes: Array<ThemeType> = loaderData.data.content;
	const pagination: PaginationInfo = {
		totalPages: loaderData.data.totalPages,
		totalElements: loaderData.data.totalElements,
		number: loaderData.data.number,
		size: loaderData.data.size,
		first: loaderData.data.first,
		last: loaderData.data.last,
		empty: loaderData.data.empty,
		numberOfElements: loaderData.data.numberOfElements,
	};

	const currentPage = pagination.number;
	const totalPages = pagination.totalPages;

	const categoryOptions = [
		{
			value: "ALL",
			label: t("theme:categories.all", { defaultValue: "All Categories" }),
		},
		{
			value: "RESTAURANT",
			label: t("theme:categories.restaurant", { defaultValue: "Restaurant" }),
		},
		{
			value: "CAFE",
			label: t("theme:categories.cafe", { defaultValue: "Cafe" }),
		},
		{ value: "BAR", label: t("theme:categories.bar", { defaultValue: "Bar" }) },
		{
			value: "BAKERY",
			label: t("theme:categories.bakery", { defaultValue: "Bakery" }),
		},
		{
			value: "FOOD_TRUCK",
			label: t("theme:categories.food_truck", { defaultValue: "Food Truck" }),
		},
		{
			value: "OTHER",
			label: t("theme:categories.other", { defaultValue: "Other" }),
		},
	];

	const handleUnregister = async (themeId: number, ownerUsername?: string) => {
		if (!canUnregisterThemes(ownerUsername)) {
			toast.error(
				t("error:unauthorized_theme_unregistration", {
					defaultValue:
						"You are not allowed to unregister this theme. Developer, admin, or owner role is required.",
				}),
			);
			return;
		}

		try {
			const result = await unregisterTheme(themeId);

			if (result.success) {
				toast.success(
					result.message ||
						t("theme:unregister.success", {
							defaultValue: "Theme unregistered successfully",
						}),
				);
				// Revalidate route data without full page refresh
				revalidator.revalidate();
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
		}
	};

	// Handle page change with proper navigation
	const handlePageChange = useCallback(
		(page: number) => {
			const url = new URL(window.location.href);
			url.searchParams.set("page", page.toString());

			// Use navigate with replace option to avoid adding to history stack
			navigate(url.pathname + url.search, { replace: true });
		},
		[navigate],
	);

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total pages is less than or equal to maxPagesToShow
			for (let i = 0; i < totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			// Always include first page
			pageNumbers.push(0);

			if (currentPage > 1) {
				// Add ellipsis if current page is far from the beginning
				if (currentPage > 2) {
					pageNumbers.push(-1); // -1 represents ellipsis
				}

				// Add one page before current page if not the first page
				pageNumbers.push(currentPage - 1);
			}

			// Add current page if not the first or last page
			if (currentPage !== 0 && currentPage !== totalPages - 1) {
				pageNumbers.push(currentPage);
			}

			if (currentPage < totalPages - 2) {
				// Add one page after current page if not the last page
				pageNumbers.push(currentPage + 1);

				// Add ellipsis if current page is far from the end
				if (currentPage < totalPages - 3) {
					pageNumbers.push(-1); // -1 represents ellipsis
				}
			}

			// Always include last page
			pageNumbers.push(totalPages - 1);
		}

		return pageNumbers;
	};

	const allowThemeRegistration = canRegisterThemes();

	return (
		<div className="flex flex-col gap-6">
			<Title title={t("theme:title")}>
				{allowThemeRegistration && (
					<Button asChild>
						<Link to="/theme/register" viewTransition>
							{t("theme:new_theme")}
						</Link>
					</Button>
				)}
			</Title>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
				<div className="flex items-center gap-2">
					<Label htmlFor="category-filter" className="text-sm font-medium">
						{t("theme:filters.category", { defaultValue: "Category" })}:
					</Label>
					<Select value={selectedCategory} onValueChange={handleCategoryChange}>
						<SelectTrigger id="category-filter" className="w-[180px]">
							<SelectValue
								placeholder={t("theme:filters.select_category", {
									defaultValue: "Select category",
								})}
							/>
						</SelectTrigger>
						<SelectContent>
							{categoryOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Checkbox
						id="my-themes-filter"
						checked={myThemesOnly}
						onCheckedChange={handleMyThemesChange}
					/>
					<Label
						htmlFor="my-themes-filter"
						className="text-sm font-medium cursor-pointer"
					>
						{t("theme:filters.my_themes", { defaultValue: "My Themes Only" })}
					</Label>
				</div>
			</div>

			{themes.length === 0 ? (
				<div className="text-gray-500 text-center py-8">
					{t("theme:no_themes")} <br />
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mxauto">
					{themes.map((theme: ThemeType) => {
						const ownerUsername = theme.themeManifest.author;
						const canUnregister = canUnregisterThemes(ownerUsername);

						return (
							<li key={theme.id} className="flex flex-col gap-2">
								<ThemeCard
									index={theme.id}
									themeName={theme.themeManifest.name}
									themeDescription={theme.themeManifest.description}
									themeAuthor={theme.themeManifest.author}
									isFree={theme.isFree}
									thumbnailUrl={theme.thumbnailUrl}
								/>
								{canUnregister && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleUnregister(theme.id, ownerUsername)}
										className="w-full"
									>
										{t("theme:unregister.action", {
											defaultValue: "Unregister theme",
										})}
									</Button>
								)}
							</li>
						);
					})}
				</ul>
			)}
			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								to="#"
								onClick={(e) => {
									e.preventDefault();
									if (!pagination.first) {
										handlePageChange(currentPage - 1);
									}
								}}
								className={
									pagination.first
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>

						{getPageNumbers().map((pageNumber, index) =>
							pageNumber === -1 ? (
								<PaginationItem key={`ellipsis-${index}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={pageNumber}>
									<PaginationLink
										to="#"
										isActive={pageNumber === currentPage}
										onClick={(e) => {
											e.preventDefault();
											handlePageChange(pageNumber);
										}}
										className="cursor-pointer"
									>
										{pageNumber + 1}
									</PaginationLink>
								</PaginationItem>
							),
						)}

						<PaginationItem>
							<PaginationNext
								to="#"
								onClick={(e) => {
									e.preventDefault();
									if (!pagination.last) {
										handlePageChange(currentPage + 1);
									}
								}}
								className={
									pagination.last
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
