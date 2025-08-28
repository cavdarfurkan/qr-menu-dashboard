import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

export function clientAction() {

}

export default function BackButton() {

	return (
		<Button variant="link" size="sm" asChild>
			<Link to="/" viewTransition>
				<ArrowLeft />
				<span>Back to dashboard</span>
			</Link>
		</Button>
	);
}
