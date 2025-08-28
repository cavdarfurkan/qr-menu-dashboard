import api, { type ApiResponse } from "~/lib/api";
import type { Route } from "./+types/themes";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import { useCallback } from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import Title from "~/components/Title";
import { Button } from "~/components/ui/button";

export type ThemeType = {
	id: number;
	isFree: boolean;
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

		const params: Record<string, string> = {
			page: pageParam,
		};

		// Only add size param if it's explicitly set in the URL
		if (sizeParam) {
			params.size = sizeParam;
		}

		const response = await api.get("/v1/theme", { params });
		return { ...response.data };
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message: errorResponse?.data?.message ?? "Error getting themes",
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: "An unexpected error occured",
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

export default function Themes({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();

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

	return (
		<div className="flex flex-col gap-6">
			<Title title="Themes">
				<Button asChild>
					<Link to="/theme/register" viewTransition>
						+ New Theme
					</Link>
				</Button>
			</Title>
			{themes.length === 0 ? (
				<div className="text-gray-500 text-center py-8">
					No themes found. <br />
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mxauto">
					{themes.map((theme: ThemeType) => (
						<ThemeCard key={theme.id} theme={theme} />
					))}
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
										className="cursor-pointer">
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

function ThemeCard({ theme }: { theme: ThemeType }) {
	return (
		<Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
			{/* <Link */}
			{/* 	to={href || "#"} */}
			{/* 	viewTransition */}
			{/* 	className="w-fullh-full" */}
			{/* > */}
			<CardHeader>
				<CardTitle>{theme.themeManifest.name}</CardTitle>
				<p className="text-sm text-gray-500">
					{theme.themeManifest.description}
				</p>
				<p className="text-xs text-gray-400">By {theme.themeManifest.author}</p>
				{theme.isFree && (
					<span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
						Free
					</span>
				)}
			</CardHeader>
			{/* </Link> */}
		</Card>
	);
}
