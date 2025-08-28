import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import type React from "react";
import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Link } from "react-router";

export interface StepProps {
	title: string;
	description?: string;
	isCompleted?: boolean;
	isActive?: boolean;
	content: React.ReactNode;
	stepIndex?: number;
}

const Step: React.FC<StepProps> = ({
	title,
	description,
	isCompleted,
	isActive,
	stepIndex,
}) => {
	const isUpcoming = !isActive && !isCompleted;
	//console.log(title, "isCompleted", isCompleted, "isActive", isActive, "isUpcoming", isUpcoming);

	return (
		<div className="flex items-center">
			<div
				className={cn(
					"h-8 w-8 rounded-full flex items-center justify-center",
					isCompleted && "bg-primary",
					isActive && "bg-primary-foreground border border-gray-500",
					isUpcoming && "bg-primary-foreground",
				)}
			>
				<span
					className={cn(
						"text-sm font-medium text-primary-foreground",
						isUpcoming && "text-primary",
						isActive && "text-primary",
					)}
				>
					{isCompleted && <Check size="16" strokeWidth="3" />}
					{!isCompleted && stepIndex && stepIndex}
				</span>
			</div>
			<p className="text-sm font-medium ml-2 flex-nowrap text-nowrap mx4">
				{title}
			</p>
		</div>
	);
};

export interface StepperProps {
	steps: Array<StepProps>;
	currentStep: number;
	onStepChange: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
	return (
		// <div className="flex flex-col wfull gap-5 mx-auto">
		<div className="flex mx-auto p-5 border rounded-sm borderprimary wfull maxwmd justifycenter">
			{steps.map((step, index) => (
				<div
					key={index}
					className="flex items-center"
					onClick={() => onStepChange(index)}
				>
					<Step
						title={step.title}
						description={step.description}
						isCompleted={index < currentStep}
						isActive={index === currentStep}
						content={step.content}
						stepIndex={index + 1}
					/>

					{index < steps.length - 1 && (
						<div className="mx-2 w-12">
							<Separator />
						</div>
					)}
				</div>
			))}
		</div>
		// </div>
	);
}

interface StepButtonProps {
	children: React.ReactNode;
	variant?: "ghost" | "link" | "default";
	type?: "button" | "submit" | "reset";
	onClick?: () => void;
}

export function StepButton({
	children,
	variant,
	onClick,
	type,
}: StepButtonProps) {
	if (!variant) variant = "default";
	if (!type) type = "button";

	return (
		<Button
			type={type}
			className="cursor-pointer"
			variant={variant}
			size="sm"
			onClick={onClick}
		>
			{children}
		</Button>
	);
}
