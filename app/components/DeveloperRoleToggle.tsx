import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useUserStore } from "~/stores";
import { switchDeveloperRole } from "~/lib/auth-api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";

export function DeveloperRoleToggle() {
	const { t } = useTranslation(["settings", "common", "error"]);
	const { user, hasDeveloperRole, setUser, clearUser } = useUserStore();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isDeveloper = hasDeveloperRole();

	const handleToggle = useCallback(
		async (checked: boolean) => {
			// If no user loaded yet, prevent toggle
			if (!user) {
				toast.error(t("error:unexpected_error"));
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await switchDeveloperRole(checked);

				if (!response.success) {
					const message =
						response.message ||
						t("settings:developer_role.error", {
							defaultValue: "Failed to update developer role",
						});
					setError(message);
					toast.error(message);
					return;
				}

				if (response.data) {
					setUser(response.data);
				}

				const successKey = checked
					? "settings:developer_role.activate_success"
					: "settings:developer_role.deactivate_success";

				toast.success(
					response.message ||
						t(successKey, {
							defaultValue: checked
								? "Developer role activated successfully"
								: "Developer role deactivated successfully",
						}),
				);
			} catch (err: any) {
				// Handle 401 Unauthorized - token invalid or expired
				if (isAxiosError(err) && err.response?.status === 401) {
					const message =
						err.response?.data?.message ||
						t("settings:developer_role.unauthorized", {
							defaultValue: "Your session has expired. Please log in again.",
						});
					setError(message);
					toast.error(message);
					// Clear user store and redirect to login
					clearUser();
					// The API interceptor should have already cleared the token
					// Redirect will happen via ProtectedRoute check
					setTimeout(() => {
						navigate("/login", { replace: true });
					}, 1500);
					return;
				}

				// Handle 400 Bad Request - validation errors
				if (isAxiosError(err) && err.response?.status === 400) {
					const message =
						err.response?.data?.message ||
						t("settings:developer_role.error", {
							defaultValue: "Failed to update developer role",
						});
					setError(message);
					toast.error(message);
					return;
				}

				// Handle network or unexpected errors
				const message =
					err?.response?.data?.message ||
					t("settings:developer_role.error", {
						defaultValue: "Failed to update developer role",
					});
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		},
		[user, setUser, clearUser, navigate, t],
	);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-sm">
							{t("settings:developer_role.title", {
								defaultValue: "Developer mode",
							})}
						</span>
						<Badge variant={isDeveloper ? "default" : "outline"}>
							{isDeveloper
								? t("settings:developer_role.active", {
										defaultValue: "Active",
									})
								: t("settings:developer_role.inactive", {
										defaultValue: "Inactive",
									})}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground max-w-md">
						{t("settings:developer_role.description", {
							defaultValue:
								"Enable developer role to manage themes (register and unregister).",
						})}
					</p>
				</div>

				<div className="flex flex-col items-end gap-2">
					<div className="flex items-center gap-3">
						<span className="text-xs text-muted-foreground">
							{isDeveloper
								? t("settings:developer_role.active_label", {
										defaultValue: "Developer mode enabled",
									})
								: t("settings:developer_role.inactive_label", {
										defaultValue: "Developer mode disabled",
									})}
						</span>
						<Switch
							checked={isDeveloper}
							onCheckedChange={handleToggle}
							disabled={isLoading || !user}
						/>
					</div>
					{isLoading && (
						<span className="text-[11px] text-muted-foreground">
							{t("common:buttons.loading")}
						</span>
					)}
				</div>
			</div>

			{error && (
				<div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
					<span>{error}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setError(null)}
						className="h-7 px-2 text-xs"
					>
						{t("common:buttons.dismiss", { defaultValue: "Dismiss" })}
					</Button>
				</div>
			)}
		</div>
	);
}
