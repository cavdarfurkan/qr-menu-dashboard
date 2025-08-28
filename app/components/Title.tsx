import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";

interface TitleProps {
	title: string;
	titleSize?: "sm" | "md" | "lg" | "xl";
	children?: React.ReactNode;
}

export default function Title({
	title,
	titleSize = "xl",
	children = null,
}: TitleProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center">
				<h2
					className={cn(
						"text-xl font-semibold",
						titleSize === "sm" && "text-sm",
						titleSize === "md" && "text-md",
						titleSize === "lg" && "text-lg",
						titleSize === "xl" && "text-xl",
					)}
				>
					{title}
				</h2>
				<div className="flex gap-3 ml-auto">{children}</div>
			</div>
			<Separator />
		</div>
	);
}
