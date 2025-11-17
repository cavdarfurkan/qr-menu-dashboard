import Title from "~/components/Title";
import { useTranslation } from "react-i18next";

export default function Settings() {
	const { t } = useTranslation(["home", "common", "settings"]);
	return (
		<div className="flex flex-col gap-6">
			<Title title={t("home:settings")} />
			<div className="flex flex-col gap-2">
				<h1>{t("home:settings")}</h1>
				<h2>{t("settings:active_sessions")}</h2>
			</div>
		</div>
	);
}
