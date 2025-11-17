import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function clientAction() {

}

export default function BackButton() {
	const { t } = useTranslation("common");
	return (
		<Button variant="link" size="sm" asChild>
			<Link to="/" viewTransition>
				<ArrowLeft />
				<span>{t("common:buttons.back_to_dashboard")}</span>
			</Link>
		</Button>
	);
}
