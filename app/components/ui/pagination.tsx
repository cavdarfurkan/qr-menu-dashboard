import * as React from "react";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			role="navigation"
			aria-label="pagination"
			data-slot="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("flex flex-row items-center gap-1", className)}
			{...props}
		/>
	);
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
	React.ComponentProps<typeof Link>;

function PaginationLink({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<Link
			aria-current={isActive ? "page" : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			className={cn(
				buttonVariants({
					variant: isActive ? "outline" : "ghost",
					size,
				}),
				className,
			)}
			{...props}
		/>
	);
	// OLD
	// return (
	//   <a
	//     aria-current={isActive ? "page" : undefined}
	//     data-slot="pagination-link"
	//     data-active={isActive}
	//     className={cn(
	//       buttonVariants({
	//         variant: isActive ? "outline" : "ghost",
	//         size,
	//       }),
	//       className
	//     )}
	//     {...props}
	//   />
	// )
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	const { t } = useTranslation(["ui_components"]);

	return (
		<PaginationLink
			aria-label={t("ui_components:pagination.previous_aria_label")}
			size="default"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			{...props}
		>
			<ChevronLeftIcon />
			<span className="hidden sm:block">
				{t("ui_components:pagination.previous")}
			</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	const { t } = useTranslation(["ui_components"]);

	return (
		<PaginationLink
			aria-label={t("ui_components:pagination.next_aria_label")}
			size="default"
			className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
			{...props}
		>
			<span className="hidden sm:block">
				{t("ui_components:pagination.next")}
			</span>
			<ChevronRightIcon />
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	const { t } = useTranslation(["ui_components"]);

	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn("flex size-9 items-center justify-center", className)}
			{...props}
		>
			<MoreHorizontalIcon className="size-4" />
			<span className="sr-only">
				{t("ui_components:pagination.more_pages_aria_label")}
			</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
};
