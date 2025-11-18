interface LoaderProps {
	size?: "small" | "medium" | "large";
	color?: string;
	fullScreen?: boolean;
	message?: string;
}

export default function Loader({
	size = "medium",
	color = "#3b82f6", // blue-500
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

	const spinnerStyle = {
		width,
		height,
		borderWidth,
		borderColor: `${color}20`, // Very light version of the color
		borderTopColor: color,
	};

	const containerStyle = fullScreen
		? {
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "rgba(255, 255, 255, 0.8)",
				zIndex: 9999,
			}
		: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
			};

	return (
		<div style={containerStyle as React.CSSProperties}>
			<div
				style={{
					...spinnerStyle,
					borderRadius: "50%",
					borderStyle: "solid",
					animation: "spin 1s linear infinite",
				}}
			/>
			{message && (
				<p
					style={{
						marginTop: "1rem",
						color: "#6b7280", // gray-500
						fontSize: size === "small" ? "0.875rem" : "1rem",
					}}
				>
					{message}
				</p>
			)}
			<style>
				{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
			</style>
		</div>
	);
}
