// TODO: Change this component for theme selection dialog only

import type React from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import api from "~/lib/api";
import InfiniteScroll from "react-infinite-scroll-component";
import type { ThemeType } from "~/routes/home/theme/themes";

interface SelectThemeDialogProps {
	content: SelectThemeDialogContentProps;
	children: React.ReactNode;
}

export default function SelectThemeDialog({
	content,
	children,
}: SelectThemeDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			{isDialogOpen && (
				<SelectThemeDialogContent
					fetchUrl={content.fetchUrl}
					onClick={(id) => {
						setIsDialogOpen(false);
						return content.onClick(id);
					}}
				/>
			)}
		</Dialog>
	);
}

interface SelectThemeDialogContentProps {
	fetchUrl: string;
	onClick: (id: number) => void;
}

// FIX: Lazy load gets all the themes without scrolling
const SelectThemeDialogContent: React.FC<SelectThemeDialogContentProps> = ({
	fetchUrl,
	onClick,
}) => {
	const [themes, setThemes] = useState<ThemeType[]>([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Fetch one page
	const fetchItems = useCallback(async () => {
		if (loading || !hasMore) return;
		setLoading(true);

		try {
			const response = await api.get(fetchUrl, {
				params: { page: page, size: 20 },
			});
			const { content, totalPages } = response.data.data;

			setThemes((prev) => [...prev, ...content]);
			setHasMore(page + 1 < totalPages);
			setPage((prev) => prev + 1);
		} catch (err) {
			console.error("Failed to load items:", err);
		} finally {
			setLoading(false);
		}
	}, [page, hasMore, loading]);

	// Initial load
	useEffect(() => {
		fetchItems();
	}, []);

	// Auto-load if container isn't scrollable
	const tryAutoLoad = useCallback(() => {
		const el = containerRef.current;
		if (el && el.scrollHeight <= el.clientHeight && hasMore && !loading) {
			fetchItems();
		}
	}, [hasMore, loading, fetchItems]);

	// run after every load, and on resize
	useLayoutEffect(() => {
		tryAutoLoad();
	}, [themes.length, tryAutoLoad]);

	useEffect(() => {
		window.addEventListener("resize", tryAutoLoad);
		return () => window.removeEventListener("resize", tryAutoLoad);
	}, [tryAutoLoad]);

	return (
		<DialogContent className="w[400px] w[80vw]  min-w-[50vw] max-h-[80vh] p0 overflow-hidden flex flex-col overflow-y-auto">
			<DialogHeader>
				{/* TODO: Change title with prop */}
				<DialogTitle>All Themes</DialogTitle>
			</DialogHeader>
			<div
				id="scrollable-dialog-content"
				ref={containerRef}
				className="flex1 px4 py-2 hfull overflowy-auto gridgrid-cols-3gap-4"
			>
				<InfiniteScroll
					className="grid grid-cols-3 gap-4"
					next={fetchItems}
					hasMore={hasMore}
					loader={<h4>Loading...</h4>}
					dataLength={themes.length}
					scrollableTarget="scrollable-dialog-content"
				>
					{themes.map((theme, index) => (
						<ThemeCard
							key={index}
							id={theme.id}
							themeName={theme.themeManifest.name}
							themeDescription={theme.themeManifest.description}
							themeAuthor={theme.themeManifest.author}
							isFree={theme.isFree}
							onClick={onClick}
						/>
					))}
				</InfiniteScroll>
			</div>
		</DialogContent>
	);
};

interface ThemeCardProps {
	id: number;
	themeName: string;
	themeDescription: string;
	themeAuthor: string;
	isFree: boolean;
	onClick: (id: number) => void;
}

export function ThemeCard({
	id,
	themeName,
	themeDescription,
	themeAuthor,
	isFree,
	onClick,
}: ThemeCardProps) {
	return (
		<Card
			key={id}
			className="hover:shadow-lg transition-all duration-200 cursor-pointer"
			onClick={() => onClick(id)}
		>
			{/* <Link */}
			{/* 	to={href || "#"} */}
			{/* 	viewTransition */}
			{/* 	className="w-fullh-full" */}
			{/* > */}
			<CardHeader>
				<CardTitle>{themeName}</CardTitle>
				<p className="text-sm text-gray-500">{themeDescription}</p>
				<p className="text-xs text-gray-400">By {themeAuthor}</p>
				{isFree && (
					<span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
						Free
					</span>
				)}
			</CardHeader>
			{/* </Link> */}
		</Card>
	);
}
