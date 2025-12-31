import Title from "~/components/Title";
import { useTranslation } from "react-i18next";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { useSettingsStore } from "~/stores";
import { type Theme } from "~/stores/useSettingsStore";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "~/components/ui/select";
import { useTheme } from "next-themes";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import api from "~/lib/api";

import { languages } from "~/constants/languages";
import { THEME_VALUES } from "~/constants/themes";

export default function Settings() {
	const { t } = useTranslation(["home", "common", "settings"]);

	const {
		activeSection,
		setActiveSection,
		cancelChanges,
		saveChanges,
		hasUnsavedChanges,
	} = useSettingsStore();

	interface SettingsSection {
		label: string;
		value: string;
		content: React.ReactNode;
	}

	const settingsSections: SettingsSection[] = [
		{
			label: t("settings:account_details.title"),
			value: "account_details",
			content: <AccountDetailsSection t={t} />,
		},
		{
			label: t("settings:organization.title"),
			value: "organization",
			content: <OrganizationSection t={t} />,
		},
		{
			label: t("settings:security.title"),
			value: "security",
			content: <SecuritySection t={t} />,
		},
		{
			label: t("settings:privacy.title"),
			value: "privacy",
			content: <PrivacySection t={t} />,
		},
		{
			label: t("settings:billing_and_subscription.title"),
			value: "billing_and_subscription",
			content: <BillingSection t={t} />,
		},
		{
			label: t("settings:appearance.title"),
			value: "appearance",
			content: <AppearanceSection t={t} />,
		},
		{
			label: t("settings:language.title"),
			value: "language",
			content: <LanguageSection t={t} />,
		},
		{
			label: t("settings:notifications.title"),
			value: "notifications",
			content: <NotificationsSection t={t} />,
		},
	];

	return (
		<div className="flex h-[calc(100svh-7rem)] md:h-[calc(100svh-5rem)] flex-col overflow-hidden">
			<div className="shrink-0">
				<Title title={t("home:settings")} />
			</div>

			{/* Mobile Select - Hidden on md and up */}
			<div className="md:hidden flex flex-1 min-h-0 flex-col gap-4 mt-4 overflow-hidden">
				<div className="shrink-0">
					<Select value={activeSection} onValueChange={setActiveSection}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{settingsSections.map((section) => (
								<SelectItem key={section.value} value={section.value}>
									{section.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex-1 min-h-0 overflow-hidden rounded-lg border bg-card">
					<ScrollArea className="h-full w-full">
						<div className="p-4">
							{settingsSections.find((s) => s.value === activeSection)?.content}
						</div>
					</ScrollArea>
				</div>
			</div>

			{/* Desktop Tabs - Hidden on mobile */}
			<Tabs
				value={activeSection}
				onValueChange={setActiveSection}
				className="hidden md:flex mt-6 flex-1 min-h-0 flex-col overflow-hidden"
			>
				<div className="shrink-0 overflow-x-auto pb-1">
					<TabsList>
						{settingsSections.map((section) => (
							<TabsTrigger
								key={section.value}
								value={section.value}
								className="text-sm flex-none"
							>
								{section.label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<div className="flex-1 min-h-0 overflow-hidden">
					{settingsSections.map((section) => (
						<TabsContent
							key={section.value}
							value={section.value}
							className="h-full data-[state=active]:flex flex-col p-0 m-0"
						>
							<div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-card">
								<ScrollArea className="h-full w-full">
									<div className="p-6">{section.content}</div>
								</ScrollArea>
							</div>
						</TabsContent>
					))}
				</div>
			</Tabs>

			<div className="flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t pt-4 md:pt-6 mt-4 md:mt-6">
				<Button
					variant="outline"
					onClick={cancelChanges}
					disabled={!hasUnsavedChanges()}
					className="w-full sm:w-auto"
				>
					{t("common:buttons.cancel")}
				</Button>
				<Button
					onClick={saveChanges}
					disabled={!hasUnsavedChanges()}
					className="w-full sm:w-auto"
				>
					{t("common:buttons.save")}
				</Button>
			</div>
		</div>
	);
}

function AccountDetailsSection({ t }: { t: any }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2">
				<Label>{t("settings:email")}</Label>
				<Input
					type="email"
					placeholder={t("settings:email_placeholder")}
					className="w-full md:max-w-md"
				/>
			</div>
			{/* Empty space */}
			<div className="flex flex-col gap-4">
				<div className="h-48 md:h-96 bg-gray-100 dark:bg-gray-900" />
				<div className="h-48 md:h-96 bg-gray-100 dark:bg-gray-900" />
				<div className="h-48 md:h-96 bg-gray-100 dark:bg-gray-900" />
			</div>
		</div>
	);
}

function OrganizationSection({ t }: { t: any }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2">
				<Label>{t("settings:organization_name")}</Label>
				<Input
					type="text"
					placeholder={t("settings:organization_name_placeholder")}
					className="w-full md:max-w-md"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label>{t("settings:organization_type")}</Label>
				<Input
					type="text"
					placeholder={t("settings:organization_type_placeholder")}
					className="w-full md:max-w-md"
				/>
			</div>
		</div>
	);
}

function SecuritySection({ t }: { t: any }) {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = (t: (key: string) => string) =>
		z
			.object({
				currentPassword: z
					.string()
					.min(1, { message: t("validation:password_min") }),
				newPassword: z
					.string()
					.min(8, { message: t("validation:password_min") }),
				confirmPassword: z
					.string()
					.min(8, { message: t("validation:confirm_password_min") }),
			})
			.refine((data) => data.newPassword === data.confirmPassword, {
				error: t("validation:passwords_dont_match"),
				path: ["confirmPassword"],
			});

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t as (key: string) => string)),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
		setError(null);
		setSuccess(null);
		setIsLoading(true);

		try {
			const response = await api.post("/v1/auth/change-password", {
				old_password: data.currentPassword,
				new_password: data.newPassword,
			});

			if (response.data.success) {
				setSuccess(t("settings:change_password.success"));
				form.reset();
			} else {
				setError(response.data.message || t("settings:change_password.error"));
			}
		} catch (error: any) {
			console.error(error);
			setError(
				error.response?.data?.message || t("settings:change_password.error"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
					{error}
				</div>
			)}
			{success && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
					{success}
				</div>
			)}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="currentPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex flex-col gap-2">
									<FormLabel>{t("settings:current_password")}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder={t("settings:current_password_placeholder")}
											className="w-full md:max-w-md"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex flex-col gap-2">
									<FormLabel>{t("settings:new_password")}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder={t("settings:new_password_placeholder")}
											className="w-full md:max-w-md"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex flex-col gap-2">
									<FormLabel>{t("settings:confirm_password")}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder={t("settings:confirm_password_placeholder")}
											className="w-full md:max-w-md"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full md:w-auto"
					>
						{isLoading
							? t("common:buttons.saving")
							: t("settings:change_password.submit")}
					</Button>
				</form>
			</Form>
		</div>
	);
}

function PrivacySection({ t }: { t: any }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex flex-col flex-1">
					<Label>{t("settings:data_sharing")}</Label>
					<span className="text-xs sm:text-sm text-muted-foreground">
						{t("settings:data_sharing_description")}
					</span>
				</div>
				<Checkbox className="self-start sm:self-center" />
			</div>
		</div>
	);
}

function BillingSection({ t }: { t: any }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2">
				<Label>{t("settings:current_plan")}</Label>
				<div className="p-3 bg-muted rounded-md w-full md:max-w-md">
					<span className="font-medium text-sm md:text-base">
						{t("settings:free_plan")}
					</span>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<Label>{t("settings:billing_email")}</Label>
				<Input
					type="email"
					placeholder={t("settings:billing_email_placeholder")}
					className="w-full md:max-w-md"
				/>
			</div>
		</div>
	);
}

function AppearanceSection({ t }: { t: any }) {
	const { theme, setTheme } = useTheme();

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="space-y-3">
				<div className="space-y-1">
					<Label className="text-sm md:text-base font-medium">
						{t("settings:appearance.title")}
					</Label>
					<p className="text-xs md:text-sm text-muted-foreground">
						{t("settings:appearance.description")}
					</p>
				</div>
				<div className="w-full sm:max-w-xs">
					<Select
						value={theme}
						onValueChange={(value: Theme) => setTheme(value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue
								placeholder={t("settings:appearance.select_theme")}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={THEME_VALUES.LIGHT}>
								{t("settings:appearance.light")}
							</SelectItem>
							<SelectItem value={THEME_VALUES.DARK}>
								{t("settings:appearance.dark")}
							</SelectItem>
							<SelectItem value={THEME_VALUES.SYSTEM}>
								{t("settings:appearance.system")}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

function LanguageSection({ t }: { t: any }) {
	const { setLanguage, selectedLanguage, setSelectedLanguage } =
		useSettingsStore();

	const handleLanguageChange = (value: keyof typeof languages) => {
		setSelectedLanguage(value);
		setLanguage(value);
	};

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="space-y-3">
				<div className="space-y-1">
					<Label className="text-sm md:text-base font-medium">
						{t("settings:language.title")}
					</Label>
					<p className="text-xs md:text-sm text-muted-foreground">
						{t("settings:language.description")}
					</p>
				</div>
				<div className="w-full sm:max-w-xs">
					<Select
						defaultValue={selectedLanguage}
						value={selectedLanguage}
						onValueChange={(value: keyof typeof languages) =>
							handleLanguageChange(value)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue
								placeholder={t("settings:language.select_language")}
							/>
						</SelectTrigger>
						<SelectContent>
							{Object.entries(languages).map(([code, name]) => (
								<SelectItem key={code} value={code}>
									<div className="flex items-center gap-2">
										<span className="text-xs sm:text-sm font-medium">
											{name}
										</span>
										<span className="text-[10px] sm:text-xs text-muted-foreground uppercase">
											{code}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

function NotificationsSection({ t }: { t: any }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex flex-col flex-1">
					<Label>{t("settings:email_notifications")}</Label>
					<span className="text-xs sm:text-sm text-muted-foreground">
						{t("settings:email_notifications_description")}
					</span>
				</div>
				<Checkbox className="self-start sm:self-center" />
			</div>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex flex-col flex-1">
					<Label>{t("settings:push_notifications")}</Label>
					<span className="text-xs sm:text-sm text-muted-foreground">
						{t("settings:push_notifications_description")}
					</span>
				</div>
				<Checkbox className="self-start sm:self-center" />
			</div>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex flex-col flex-1">
					<Label>{t("settings:marketing_emails")}</Label>
					<span className="text-xs sm:text-sm text-muted-foreground">
						{t("settings:marketing_emails_description")}
					</span>
				</div>
				<Checkbox className="self-start sm:self-center" />
			</div>
		</div>
	);
}
