import type {
	FieldTemplateProps,
	FormContextType,
	RJSFSchema,
	StrictRJSFSchema,
	WidgetProps,
	ArrayFieldTemplateProps,
	ArrayFieldTemplateItemType,
} from "@rjsf/utils";
import { getTemplate, getUiOptions, titleId, descriptionId } from "@rjsf/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { PlusCircle, Trash, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Base Input Template
export function BaseInputTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
	const {
		id,
		placeholder,
		required,
		readonly,
		disabled,
		type,
		label,
		value,
		onChange,
		onBlur,
		onFocus,
		autofocus,
		options,
		schema,
		rawErrors = [],
		formContext,
		registry,
		uiSchema,
		hideError,
		...rest
	} = props;

	const inputType = options.inputType || type || "text";
	const inputProps = { ...rest };

	const _onChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) =>
		onChange(value === "" ? options.emptyValue : value);
	const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
		onBlur(id, value);
	const _onFocus = ({
		target: { value },
	}: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

	return (
		<Input
			id={id}
			placeholder={placeholder}
			disabled={disabled || readonly}
			autoFocus={autofocus}
			required={required}
			type={inputType}
			value={value || value === 0 ? value : ""}
			onChange={_onChange}
			onBlur={_onBlur}
			onFocus={_onFocus}
			{...inputProps}
		/>
	);
}

// Text Area Template
export function TextareaWidget<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
	const {
		id,
		placeholder,
		required,
		readonly,
		disabled,
		value,
		onChange,
		onBlur,
		onFocus,
		autofocus,
		options,
		rawErrors = [],
		...rest
	} = props;

	const _onChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLTextAreaElement>) =>
		onChange(value === "" ? options.emptyValue : value);
	const _onBlur = ({
		target: { value },
	}: React.FocusEvent<HTMLTextAreaElement>) => onBlur(id, value);
	const _onFocus = ({
		target: { value },
	}: React.FocusEvent<HTMLTextAreaElement>) => onFocus(id, value);

	return (
		<Textarea
			id={id}
			placeholder={placeholder}
			disabled={disabled || readonly}
			autoFocus={autofocus}
			required={required}
			value={value || value === 0 ? value : ""}
			onChange={_onChange}
			onBlur={_onBlur}
			onFocus={_onFocus}
			{...rest}
		/>
	);
}

// Checkbox Template
export function CheckboxWidget<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
	const {
		id,
		value,
		required,
		readonly,
		disabled,
		label,
		onChange,
		onBlur,
		onFocus,
		...rest
	} = props;

	const _onChange = (checked: boolean) => onChange(checked);
	const _onBlur = ({
		target: { checked },
	}: React.FocusEvent<HTMLInputElement>) => onBlur(id, checked);
	const _onFocus = ({
		target: { checked },
	}: React.FocusEvent<HTMLInputElement>) => onFocus(id, checked);

	return (
		<div className="flex items-center space-x-2">
			<Checkbox
				id={id}
				checked={typeof value === "undefined" ? false : value}
				disabled={disabled || readonly}
				required={required}
				onCheckedChange={(checked) => _onChange(!!checked)}
				onBlur={(e) => onBlur(id, (e.target as HTMLInputElement).checked)}
				onFocus={(e) => onFocus(id, (e.target as HTMLInputElement).checked)}
				{...rest}
			/>
			<label
				htmlFor={id}
				className={cn(
					"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				)}>
				{label}
			</label>
		</div>
	);
}

// Select Template
export function SelectWidget<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
	const {
		id,
		options,
		required,
		readonly,
		disabled,
		value,
		onChange,
		onBlur,
		onFocus,
		placeholder,
		...rest
	} = props;

	const { enumOptions, enumDisabled } = options;

	const _onChange = (value: string) => {
		onChange(value === "" ? options.emptyValue : value);
	};

	return (
		<Select
			disabled={disabled || readonly}
			required={required}
			value={value || value === 0 ? String(value) : ""}
			onValueChange={_onChange}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{placeholder && <SelectItem value="">{placeholder}</SelectItem>}
				{Array.isArray(enumOptions) &&
					enumOptions.map(({ value, label }, i) => {
						const isDisabled =
							Array.isArray(enumDisabled) && enumDisabled.indexOf(value) !== -1;
						return (
							<SelectItem key={i} value={String(value)} disabled={isDisabled}>
								{label}
							</SelectItem>
						);
					})}
			</SelectContent>
		</Select>
	);
}

// Field Template
export function FieldTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: FieldTemplateProps<T, S, F>) {
	const {
		id,
		label,
		children,
		errors,
		help,
		description,
		hidden,
		required,
		displayLabel,
		registry,
		uiSchema,
	} = props;

	if (hidden) {
		return <div className="hidden">{children}</div>;
	}

	return (
		<div className="mb-4">
			{displayLabel && label && (
				<label
					htmlFor={id}
					className={`capitalize block text-sm font-medium text-foreground ${
						required ? "required" : ""
					}`}>
					{label}
					{required ? "*" : null}
				</label>
			)}
			{description && (
				<div className="text-sm text-muted-foreground mt-1">{description}</div>
			)}
			<div className="mt-1">{children}</div>
			{errors && (
				<div className="text-sm font-medium text-destructive mt-1">
					{errors}
				</div>
			)}
			{help && <div className="text-xs text-muted-foreground mt-1">{help}</div>}
		</div>
	);
}

// Array Field Template
// export function ArrayFieldTemplate<
// 	T = any,
// 	S extends StrictRJSFSchema = RJSFSchema,
// 	F extends FormContextType = any,
// >(props: ArrayFieldTemplateProps<T, S, F>) {
// 	const {
// 		canAdd,
// 		disabled,
// 		idSchema,
// 		uiSchema,
// 		items,
// 		onAddClick,
// 		readonly,
// 		registry,
// 		required,
// 		schema,
// 		title,
// 	} = props;

// 	const uiOptions = getUiOptions<T, S, F>(uiSchema);
// 	const ArrayFieldDescriptionTemplate = getTemplate<
// 		"ArrayFieldDescriptionTemplate",
// 		T,
// 		S,
// 		F
// 	>("ArrayFieldDescriptionTemplate", registry, uiOptions);
// 	const ArrayFieldTitleTemplate = getTemplate<
// 		"ArrayFieldTitleTemplate",
// 		T,
// 		S,
// 		F
// 	>("ArrayFieldTitleTemplate", registry, uiOptions);

// 	return (
// 		<div className="mb-4">
// 			{title && (
// 				<ArrayFieldTitleTemplate
// 					idSchema={idSchema}
// 					title={title}
// 					required={required}
// 					schema={schema}
// 					uiSchema={uiSchema}
// 					registry={registry}
// 				/>
// 			)}

// 			<div className="space-y-2">
// 				{items.map((item) => (
// 					<ArrayFieldItemTemplate {...item} />
// 				))}
// 			</div>
// 			{canAdd && (
// 				<Button
// 					type="button"
// 					variant="outline"
// 					size="sm"
// 					onClick={onAddClick}
// 					disabled={disabled || readonly}
// 					className="mt-2"
// 				>
// 					<PlusCircle className="h-4 w-4 mr-2" />
// 					Add Item
// 				</Button>
// 			)}
// 		</div>
// 	);
// }

// Array Field Item Template
// export function ArrayFieldItemTemplate<
// 	T = any,
// 	S extends StrictRJSFSchema = RJSFSchema,
// 	F extends FormContextType = any,
// >(props: ArrayFieldTemplateItemType<T, S, F>) {
// 	const {
// 		children,
// 		disabled,
// 		hasToolbar,
// 		hasMoveUp,
// 		hasMoveDown,
// 		hasRemove,
// 		index,
// 		onDropIndexClick,
// 		onReorderClick,
// 		readonly,
// 		registry,
// 		uiSchema,
// 	} = props;

// 	return (
// 		<div className="border rounded-md p-4 relative">
// 			{children}
// 			{hasToolbar && (
// 				<div className="absolute top-2 right-2 flex space-x-1">
// 					{hasMoveUp && (
// 						<Button
// 							type="button"
// 							variant="ghost"
// 							size="sm"
// 							className="h-6 w-6 p-0"
// 							disabled={disabled || readonly}
// 							onClick={(event) => onReorderClick(index, index - 1)(event)}
// 						>
// 							<ChevronUp className="h-4 w-4" />
// 						</Button>
// 					)}
// 					{hasMoveDown && (
// 						<Button
// 							type="button"
// 							variant="ghost"
// 							size="sm"
// 							className="h-6 w-6 p-0"
// 							disabled={disabled || readonly}
// 							onClick={(event) => onReorderClick(index, index + 1)(event)}
// 						>
// 							<ChevronDown className="h-4 w-4" />
// 						</Button>
// 					)}
// 					{hasRemove && (
// 						<Button
// 							type="button"
// 							variant="ghost"
// 							size="sm"
// 							className="h-6 w-6 p-0 text-destructive hover:text-destructive/90"
// 							disabled={disabled || readonly}
// 							onClick={(event) => onDropIndexClick(index)(event)}
// 						>
// 							<Trash className="h-4 w-4" />
// 						</Button>
// 					)}
// 				</div>
// 			)}
// 		</div>
// 	);
// }

// Title Field Template
export function TitleFieldTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: { id: string; title: string; required: boolean }) {
	const { id, title, required } = props;
	return (
		<h5 id={id} className="text-lg font-medium mb-2">
			{title}
			{required && <span className="text-destructive ml-1">*</span>}
		</h5>
	);
}

// Description Field Template
export function DescriptionFieldTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: { id: string; description: string }) {
	const { id, description } = props;
	return (
		<div id={id} className="text-sm text-muted-foreground mb-4">
			{description}
		</div>
	);
}

// Array Field Title Template
export function ArrayFieldTitleTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: {
	idSchema: any;
	title: string;
	required: boolean;
	schema: S;
	uiSchema: any;
	registry: any;
}) {
	const { idSchema, title, required } = props;
	const id = titleId(idSchema);
	return (
		<h5 id={id} className="text-lg font-medium mb-2">
			{title}
			{required && <span className="text-destructive ml-1">*</span>}
		</h5>
	);
}

// Array Field Description Template
export function ArrayFieldDescriptionTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: {
	idSchema: any;
	description: string;
	schema: S;
	uiSchema: any;
	registry: any;
}) {
	const { idSchema, description } = props;
	const id = descriptionId(idSchema);
	return (
		<div id={id} className="text-sm text-muted-foreground mb-4">
			{description}
		</div>
	);
}

// Submit Button Template
export function SubmitButtonTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: { uiSchema?: any }) {
	const { t } = useTranslation(["common"]);
	const { uiSchema } = props;
	const uiOptions = getUiOptions(uiSchema);
	const submitText =
		uiOptions.submitButtonOptions?.submitText || t("common:buttons.submit");

	return (
		<Button type="submit" className="mt-4">
			{submitText}
		</Button>
	);
}

// Error List Template
export function ErrorListTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: { errors: { stack: string }[] }) {
	const { errors } = props;
	return (
		<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
			<h5 className="text-sm font-medium mb-1">Errors</h5>
			<ul className="list-disc pl-5 text-sm">
				{errors.map((error, i) => (
					<li key={i}>{error.stack}</li>
				))}
			</ul>
		</div>
	);
}

// Object Field Template
export function ObjectFieldTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any,
>(props: {
	title: string;
	description: string;
	properties: {
		content: React.ReactElement;
		name: string;
		disabled: boolean;
		readonly: boolean;
	}[];
	required: boolean;
	uiSchema: any;
	idSchema: any;
	schema: S;
	formData: T;
	onAddClick: (schema: S) => () => void;
	registry: any;
}) {
	const {
		title,
		description,
		properties,
		required,
		uiSchema,
		idSchema,
		schema,
		registry,
	} = props;

	const TitleFieldTemplate = getTemplate<"TitleFieldTemplate", T, S, F>(
		"TitleFieldTemplate",
		registry,
		uiSchema,
	);
	const DescriptionFieldTemplate = getTemplate<
		"DescriptionFieldTemplate",
		T,
		S,
		F
	>("DescriptionFieldTemplate", registry, uiSchema);

	return (
		<div>
			{title && (
				<TitleFieldTemplate
					id={titleId(idSchema)}
					title={title}
					required={required}
					schema={schema}
					registry={registry}
				/>
			)}
			{description && (
				<DescriptionFieldTemplate
					id={descriptionId(idSchema)}
					description={description}
					schema={schema}
					registry={registry}
				/>
			)}
			<div className="space-y-4">{properties.map((prop) => prop.content)}</div>
		</div>
	);
}

// Export all templates as a single object
export const templates = {
	BaseInputTemplate,
	FieldTemplate,
	// ArrayFieldTemplate,
	// ArrayFieldItemTemplate,
	TitleFieldTemplate,
	DescriptionFieldTemplate,
	// ArrayFieldTitleTemplate,
	// ArrayFieldDescriptionTemplate,
	// ObjectFieldTemplate,
	SubmitButtonTemplate,
	ErrorListTemplate,
	ButtonTemplates: {
		SubmitButton: SubmitButtonTemplate,
	},
};

export const widgets = {
	// TextareaWidget,
	CheckboxWidget,
	// SelectWidget,
};

export default templates;
