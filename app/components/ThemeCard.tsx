import { Link } from "react-router";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface ThemeCardProps {
	index: number;
	themeName: string;
	themeDescription: string;
	themeAuthor: string;
	isFree: boolean;
	thumbnailUrl?: string;
	onClick?: (index: number) => void;
}

export default function ThemeCard({
	index,
	themeName,
	themeDescription,
	themeAuthor,
	isFree,
	thumbnailUrl,
	onClick,
}: ThemeCardProps) {
	const { t } = useTranslation(["common"]);
	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
	};

	const cardContent = (
		<>
			{thumbnailUrl && !imageError ? (
				<div className="w-full h-48 overflow-hidden rounded-t-lg">
					<img
						src={thumbnailUrl}
						alt={themeName}
						className="w-full h-full object-cover"
						onError={handleImageError}
					/>
				</div>
			) : (
				<div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
					<span className="text-gray-400 dark:text-gray-500 text-sm">
						{t("common:labels.no_image", { defaultValue: "No image" })}
					</span>
				</div>
			)}
			<CardHeader>
				<CardTitle>{themeName}</CardTitle>
				<p className="text-sm text-gray-500">{themeDescription}</p>
				<p className="text-xs text-gray-400">{themeAuthor}</p>
				{isFree && (
					<span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
						{t("common:labels.is_free")}
					</span>
				)}
			</CardHeader>
		</>
	);

	return (
		<Card
			key={index}
			data-testid={`theme-card-${themeName}`}
			className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
			onClick={() => onClick?.(index)}
		>
			{onClick ? (
				cardContent
			) : (
				<Link
					to={`/theme/${index}`}
					viewTransition
					className="w-full h-full block"
				>
					{cardContent}
				</Link>
			)}
		</Card>
	);
}
