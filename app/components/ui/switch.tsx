import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "~/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
	return (
		<SwitchPrimitives.Root
			data-slot="switch"
			className={cn(
				"peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-input bg-input/60 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
				className,
			)}
			{...props}
		>
			<SwitchPrimitives.Thumb
				data-slot="switch-thumb"
				className={cn(
					"pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-background shadow ring-0 transition-transform data-[state=checked]:translate-x-4",
				)}
			/>
		</SwitchPrimitives.Root>
	);
}

export { Switch };
