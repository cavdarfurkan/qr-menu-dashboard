import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

import RJSFForm from "@rjsf/shadcn";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

import { useEffect, useState } from "react";
import templates from "./RJSFTemplates";
import widgets from "./rjsf/Widgets";
import fields from "./rjsf/Fields";
import api, { type ApiResponse } from "~/lib/api";
import { useMenuStore } from "~/stores";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface NewContentDialogProps {
	children: React.ReactNode;
	schema: RJSFSchema;
	uiSchema: UiSchema | undefined;
	contentName: string | undefined;
}

export default function NewContentDialog({
	children,
	schema,
	uiSchema,
	contentName,
}: NewContentDialogProps) {
	const [formData, setFormData] = useState<any>(null);
	const navigate = useNavigate();
	const menuId = useMenuStore((state) => state.menuId);

	useEffect(() => {
		console.log(formData);
	}, [formData]);

	uiSchema = uiSchema || {};
	contentName = contentName || "";

	const handleChange = (data: any, id?: string) => {
		console.log(data.formData);
		// console.log(data.formData, id);
		setFormData(data.formData);
	};

	const onSubmit = (data: any, e: React.FormEvent<HTMLFormElement>) => {
		const formData = data.formData;
		console.log(contentName);
		console.log(formData);

		const body: { collection: string; content: Array<any> } = {
			collection: contentName,
			content: [formData],
		};

		api
			.post<ApiResponse>(`/v1/menu/${menuId}/content`, body)
			.then((response) => {
				console.log(response);
				toast.success("Content created successfully");
				navigate(`/menu/${menuId}/content/${contentName}`);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>New Content</DialogTitle>
				</DialogHeader>

				<RJSFForm
					schema={schema[contentName]}
					uiSchema={uiSchema[contentName]}
					validator={validator}
					formData={formData}
					onChange={handleChange}
					onSubmit={onSubmit}
					templates={templates}
					fields={fields}
					widgets={widgets}
				/>
			</DialogContent>
		</Dialog>
	);
}
