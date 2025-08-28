import { Link } from "react-router";
import { Card, CardHeader, CardTitle } from "./ui/card";

interface ThemeCardProps {
	index: number;
	themeName: string;
	themeDescription: string;
	themeAuthor: string;
	isFree: boolean;
}

export default function ThemeCard({
	index,
	themeName,
	themeDescription,
	themeAuthor,
	isFree,
}: ThemeCardProps) {
	return (
		<Card
			key={index}
			className="hover:shadow-lg transition-all duration-200 cursor-pointer"
		>
			{/* TODO: Change the to (href) */}
			<Link
				to={`#`}
				viewTransition
				className="w-fullh-full"
			>
				<CardHeader>
					<CardTitle>{themeName}</CardTitle>
					<p className="text-sm text-gray-500">
						{themeDescription}
					</p>
					<p className="text-xs text-gray-400">
						By {themeAuthor}
					</p>
					{isFree && (
						<span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
							Free
						</span>
					)}
				</CardHeader>
			</Link>
		</Card>
	);
}
