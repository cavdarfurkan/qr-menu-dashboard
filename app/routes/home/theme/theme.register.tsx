import { useState } from "react";
import { Form, useFetcher } from "react-router";
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
import { Checkbox } from "~/components/ui/checkbox";
import api from "~/lib/api";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const formSchema = z.object({
	theme_file: z.any().refine(
		(file) => {
			if (!file || file.length === 0) return false;
			return (
				file.length === 1 &&
				file[0].type === "application/zip" &&
				file[0].size <= MAX_FILE_SIZE
			);
		},
		{
			error: "Please upload a zip file, and less than 5MB",
		},
	),
	image_file: z
		.any()
		.optional()
		.refine(
			(file) => {
				if (!file || file.length === 0) return true;
				return (
					file.length === 1 &&
					file[0].type.startsWith("image/") &&
					file[0].size <= MAX_FILE_SIZE
				);
			},
			{
				error: "Please upload an image file, and less than 5MB",
			},
		),
	data: z.object({
		is_free: z.boolean().nullish(),
	}),
});

type MyFormData = z.infer<typeof formSchema>;

export default function ThemeRegister() {
	const fetcher = useFetcher();

	const [error, setError] = useState<string | null>(null);
	const isLoading = fetcher.state !== "idle";

	const form = useForm<MyFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			data: {
				is_free: false,
			},
		},
	});

	const onSubmit = (data: MyFormData) => {
		const formData = new FormData();

		// Theme File
		formData.append("file", data.theme_file[0]);

		// Image File
		if (data.image_file?.length) {
			formData.append("image", data.image_file[0]);
		}

		// JSON Data
		formData.append(
			"data",
			new Blob([JSON.stringify({ is_free: data.data.is_free })], {
				type: "application/json",
			}),
		);

		setError(null);

		console.log(formData.get("data"));

		api
			.post("/v1/theme/register", formData)
			.then((res) => {
				toast.success("Theme registered successfully");
				form.reset();
			})
			.catch((err) => {
				toast.error(err.response?.data?.message || "Upload failed");
				setError(err.response?.data?.message || "Upload failed");
			});
	};

	return (
		<div>
			<div className="mb-5">
				<BackButton />
			</div>

			<div className="flex flex-col w-full max-w-xl gap5 mx-auto">
				<div className="p-5">
					<h1 className="text-xl font-semibold">Theme Register</h1>

					<FormProvider {...form}>
						<Form
							className=""
							method="post"
							replace
							viewTransition
							onSubmit={form.handleSubmit(onSubmit)}
							encType="multipart/form-data">
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
								name="theme_file"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Theme ZIP File</FormLabel>
										<FormControl>
											<Input
												type="file"
												name="file"
												accept=".zip"
												required
												disabled={isLoading}
												onChange={(e) => field.onChange(e.target.files)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="image_file"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Theme Preview Image (optional)</FormLabel>
										<FormControl>
											<Input
												type="file"
												name="image"
												accept="image/*"
												disabled={isLoading}
												onChange={(e) => field.onChange(e.target.files)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="data.is_free"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Is Free</FormLabel>
										<FormControl>
											<Checkbox
												name="is_free"
												disabled={isLoading}
												checked={field.value || false}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									type="reset"
									className="wfull"
									disabled={isLoading}>
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
