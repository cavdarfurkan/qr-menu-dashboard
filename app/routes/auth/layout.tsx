import { GalleryVerticalEnd } from "lucide-react";
import { Link, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

export default function AuthLayout() {
	const { t } = useTranslation(["common"]);

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link to="/" viewTransition>
						<div className="flex items-center gap-2 font-medium">
							<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
								<GalleryVerticalEnd className="size-4" />
							</div>
							{t("common:app_name")}
						</div>
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<Outlet />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="/placeholder.jpg"
					alt={t("common:images.alt.auth_layout")}
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
