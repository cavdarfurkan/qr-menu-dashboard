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

const formSchema = z.object({
	name: z.string().min(3, { error: "Name is required" }),
	selectedThemeId: z.number({ error: "Theme is required" }),
});

type FormData = z.infer<typeof formSchema>;

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
				message: errorResponse?.data?.message ?? "Failed to create menu",
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: "An unexpected error occured",
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

export default function MenuCreate() {
	const fetcher = useFetcher();
	const navigate = useNavigate();

	const [error, setError] = useState<string | null>(null);
	const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
	const isLoading = fetcher.state !== "idle";

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
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

	const onSubmit = (data: FormData) => {
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
										<FormLabel>Menu Name</FormLabel>
										<FormControl>
											<Input
												id="name"
												type="text"
												placeholder="Menu name"
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
										<FormLabel>Select a theme</FormLabel>
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
															? `Theme Selected: ${selectedThemeId}`
															: "Select a theme"}
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
									Cancel
								</Button>
								<Button type="submit" className="wfull" disabled={isLoading}>
									Submit
								</Button>
							</div>
						</Form>
					</FormProvider>
				</div>
			</div>
		</div>
	);
}
