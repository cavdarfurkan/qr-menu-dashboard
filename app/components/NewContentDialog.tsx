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

import { useTranslation } from "react-i18next";

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

	const { t } = useTranslation("content");

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

	// TODO: Add relations to body
	const onSubmit = (data: any, e: React.FormEvent<HTMLFormElement>) => {
		const formData = data.formData;
		console.log(contentName);
		console.log(formData);

		const body: { collection: string; content: any } = {
			collection: contentName,
			content: formData,
		};

		api
			.post<ApiResponse>(`/v1/menu/${menuId}/content`, body)
			.then((response) => {
				console.log(response);
				toast.success(t("content:new_content_dialog.success"));
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
					<DialogTitle>{t("content:new_content_dialog.title")}</DialogTitle>
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
