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

const formSchema = (t: (key: string) => string) =>
	z.object({
		name: z.string().min(3, { error: t("validation:name_required") }),
		selectedThemeId: z.number({ error: t("validation:theme_required") }),
	});

type FormData = z.infer<ReturnType<typeof formSchema>>;

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<ApiResponse> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as unknown as FormData;

	try {
		const response = await api.post("/v1/menu/create", {
			menu_name: data.name,
			selected_theme_id: data.selectedThemeId,
		});

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
	const isLoading = fetcher.state !== "idle";

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t as (key: string) => string)),
		defaultValues: {
			name: "",
		},
	});

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
		fetcher.submit(data, { method: "post" });
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
