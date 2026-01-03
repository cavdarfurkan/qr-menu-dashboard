import {
	useState,
	useEffect,
	useRef,
	useCallback,
	useLayoutEffect,
} from "react";
import { Form, useFetcher, useNavigate } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BackButton from "~/components/BackButton";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import SelectThemeDialog from "~/components/SelectThemeDialog";
import type { Route } from "./+types/menu.create";
import type { ApiResponse } from "~/lib/api";
import api from "~/lib/api";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

// Utility function to extract subdomain from user input
// Handles: protocol stripping, returns clean domain/subdomain
const extractSubdomain = (input: string): string => {
	if (!input) return "";

	// Trim whitespace
	let domain = input.trim();

	// Strip protocol (http:// or https://)
	domain = domain.replace(/^https?:\/\//i, "");

	// Remove trailing slash
	domain = domain.replace(/\/$/, "");

	// Return the clean domain/subdomain
	return domain.trim();
};

// Utility function to generate subdomain from menu name
const generateSubdomain = (menuName: string): string => {
	// Slugify menu name: lowercase, replace spaces with hyphens, remove special chars
	const slug = menuName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.substring(0, 30); // Limit length

	// Generate random 6-character suffix
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let randomSuffix = "";
	for (let i = 0; i < 6; i++) {
		randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return `${slug}-${randomSuffix}`;
};

const formSchema = (t: (key: string) => string) =>
	z.object({
		name: z.string().min(3, { error: t("validation:name_required") }),
		selectedThemeId: z.number({ error: t("validation:theme_required") }),
		customDomain: z.string().optional(),
	});

type FormData = z.infer<ReturnType<typeof formSchema>>;

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<ApiResponse> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as unknown as FormData & {
		customDomain?: string;
	};

	try {
		const payload: {
			menu_name: string;
			selected_theme_id: number;
			custom_domain?: string;
		} = {
			menu_name: data.name,
			selected_theme_id: data.selectedThemeId,
		};

		if (data.customDomain?.trim()) {
			// Data already formatted with suffix from form submission
			payload.custom_domain = data.customDomain.trim();
		}

		const response = await api.post("/v1/menu/create", payload);

		return {
			success: response.data.success,
			message: response.data.message,
			data: response.data.data,
			timestamp: response.data.timestamp,
		};
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message:
					errorResponse?.data?.message ?? i18n.t("error:failed_to_create_menu"),
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: i18n.t("error:unexpected_error"),
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

export default function MenuCreate() {
	const { t } = useTranslation(["menu", "common", "validation", "error"]);
	const fetcher = useFetcher();
	const navigate = useNavigate();

	const [error, setError] = useState<string | null>(null);
	const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
	const [customDomain, setCustomDomain] = useState<string>("");
	const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
	const [availabilityStatus, setAvailabilityStatus] = useState<
		"available" | "taken" | null
	>(null);
	const isLoading = fetcher.state !== "idle";

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t as (key: string) => string)),
		defaultValues: {
			name: "",
			customDomain: "",
		},
	});

	// Auto-generate domain when menu name changes
	useEffect(() => {
		const menuName = form.watch("name");
		if (menuName && menuName.length >= 3 && !customDomain) {
			const generated = generateSubdomain(menuName);
			setCustomDomain(generated);
			form.setValue("customDomain", generated);
		}
	}, [form.watch("name")]);

	const handleGenerateDomain = () => {
		const menuName = form.getValues("name");
		if (menuName && menuName.length >= 3) {
			const generated = generateSubdomain(menuName);
			setCustomDomain(generated);
			form.setValue("customDomain", generated);
			setAvailabilityStatus(null);
		}
	};

	const handleCheckAvailability = async () => {
		const subdomain = extractSubdomain(customDomain);
		if (!subdomain) {
			return;
		}

		setIsCheckingAvailability(true);
		setAvailabilityStatus(null);
		try {
			const response = await api.get("/v1/menu/domain/available", {
				params: { domain: subdomain },
			});

			if (response.data.success) {
				const isAvailable = response.data.data.available;
				setAvailabilityStatus(isAvailable ? "available" : "taken");
			} else {
				// Backend returned success: false with an error message
				const errorMessage =
					response.data.message || t("menu:error_checking_availability");
				setAvailabilityStatus("taken");
				toast.error(errorMessage);
			}
		} catch (error) {
			setAvailabilityStatus("taken");
			if (isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message ||
					error.message ||
					t("menu:error_checking_availability");
				toast.error(errorMessage);
			} else {
				toast.error(t("menu:error_checking_availability"));
			}
		} finally {
			setIsCheckingAvailability(false);
		}
	};

	useEffect(() => {
		const data = fetcher.data;

		if (!data) return;

		if (!data.success) {
			setError(data.message);
			return;
		}

		navigate("/menu", { replace: true });
	}, [fetcher.data, navigate]);

	const onSubmit = (data: z.infer<ReturnType<typeof formSchema>>) => {
		setError(null);
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("selectedThemeId", data.selectedThemeId.toString());
		if (data.customDomain?.trim()) {
			const subdomain = extractSubdomain(data.customDomain);
			if (subdomain) {
				// Send only subdomain to backend (no suffix)
				formData.append("customDomain", subdomain);
			}
		}
		fetcher.submit(formData, { method: "post" });
	};

	const handleThemeSelect = (id: number) => {
		setSelectedThemeId(id);
		form.setValue("selectedThemeId", id);
	};

	return (
		<div>
			<div className="mb-5">
				<BackButton />
			</div>

			<div className="flex flex-col w-full max-w-xl gap5 mx-auto">
				<div className="p-5 borde roundedsm">
					<FormProvider {...form}>
						<Form
							className=""
							method="post"
							replace
							viewTransition
							onSubmit={form.handleSubmit(onSubmit)}
						>
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
									{error}
								</div>
							)}
							{fetcher.data?.error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
									{fetcher.data.error}
								</div>
							)}

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("common:labels.menu_name")}</FormLabel>
										<FormControl>
											<Input
												id="name"
												type="text"
												placeholder={t("common:labels.menu_name")}
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="selectedThemeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("common:labels.select_theme")}</FormLabel>
										<FormControl>
											<div>
												<Input
													type="hidden"
													{...field}
													value={selectedThemeId || ""}
												/>
												<SelectThemeDialog
													content={{
														fetchUrl: "/v1/theme",
														onClick: handleThemeSelect,
													}}
												>
													<Button
														type="button"
														variant="outline"
														className="w-full"
													>
														{selectedThemeId
															? t("common:labels.theme_selected", {
																	id: selectedThemeId,
																})
															: t("common:labels.select_theme")}
													</Button>
												</SelectThemeDialog>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="customDomain"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("menu:domain_name")}</FormLabel>
										<FormControl>
											<div className="space-y-2">
												<div className="flex gap-2">
													<Input
														{...field}
														value={customDomain}
														onChange={(e) => {
															// Extract subdomain from user input (strip protocol)
															const subdomain = extractSubdomain(
																e.target.value,
															);
															setCustomDomain(subdomain);
															field.onChange(subdomain);
															setAvailabilityStatus(null);
														}}
														placeholder="new-menu-test"
														disabled={isLoading}
														className="flex-1"
													/>
													<Button
														type="button"
														variant="outline"
														onClick={handleGenerateDomain}
														disabled={isLoading}
													>
														{t("menu:generate_domain")}
													</Button>
												</div>
												<div className="flex gap-2">
													<Button
														type="button"
														variant="outline"
														onClick={handleCheckAvailability}
														disabled={
															isLoading ||
															isCheckingAvailability ||
															!customDomain.trim()
														}
														className="flex-1"
													>
														{isCheckingAvailability
															? t("menu:checking_availability")
															: t("menu:check_availability")}
													</Button>
												</div>
												{availabilityStatus && (
													<div
														className={`text-sm ${
															availabilityStatus === "available"
																? "text-green-600"
																: "text-red-600"
														}`}
													>
														{availabilityStatus === "available"
															? t("menu:domain_available")
															: t("menu:domain_taken")}
													</div>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* <FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<Input
												id="content"
												type="text"
												placeholder="place"
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/> */}

							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									type="reset"
									className="wfull"
									disabled={isLoading}
								>
									{t("common:buttons.cancel")}
								</Button>
								<Button type="submit" className="wfull" disabled={isLoading}>
									{t("common:buttons.submit")}
								</Button>
							</div>
						</Form>
					</FormProvider>
				</div>
			</div>
		</div>
	);
}
