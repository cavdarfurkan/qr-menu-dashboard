interface LoaderProps {
	size?: "small" | "medium" | "large";
	fullScreen?: boolean;
	message?: string;
}

export default function Loader({
	size = "medium",
	fullScreen = false,
	message,
}: LoaderProps) {
	// Size mapping
	const sizeMap = {
		small: {
			width: "1.5rem",
			height: "1.5rem",
			borderWidth: "2px",
		},
		medium: {
			width: "2.5rem",
			height: "2.5rem",
			borderWidth: "3px",
		},
		large: {
			width: "3.5rem",
			height: "3.5rem",
			borderWidth: "4px",
		},
	};

	const { width, height, borderWidth } = sizeMap[size];

	const containerClass = fullScreen
		? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]"
		: "flex flex-col items-center justify-center p-4";

	const spinnerClass = `rounded-full border-solid animate-spin border-primary/20`;
	const spinnerTopClass = "border-t-primary";

	return (
		<div className={containerClass}>
			<div
				className={`${spinnerClass} ${spinnerTopClass}`}
				style={{
					width,
					height,
					borderWidth,
				}}
			/>
			{message && (
				<p
					className="mt-4 text-muted-foreground"
					style={{
						fontSize: size === "small" ? "0.875rem" : "1rem",
					}}
				>
					{message}
				</p>
			)}
		</div>
	);
}
