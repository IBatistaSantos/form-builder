"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maskCPF, maskCNPJ } from "../../utils/mask";
import { FieldProps, FieldType } from "../../types/field";
import { JSX } from "react";

interface FieldRendererProps {
  field: FieldProps;
  control: any;
}

const createFieldRenderer = (Component: any, options: any = {}) => {
  const FieldRenderer = ({ field, control }: FieldRendererProps) => (
    <Controller
      name={field.id}
      control={control}
      defaultValue={options.defaultValue ?? ""}
      rules={{ required: field.required }}
      render={({ field: { onChange, value, ref, ...rest } }) => (
        <Component
          {...rest}
          {...options}
          ref={ref}
          value={value ?? options.defaultValue}
          onChange={options.onChangeWrapper ? (e: any) => onChange(options.onChangeWrapper(e)) : onChange}
          placeholder={field.placeholder || options.defaultPlaceholder?.(field)}
        />
      )}
    />
  );

  FieldRenderer.displayName = `FieldRenderer(${Component.displayName || Component.name || 'Component'})`;

  return FieldRenderer;
};

const fieldRenderers = {
  text: createFieldRenderer(Input, {
    type: "text",
    defaultValue: "",
    defaultPlaceholder: (field: FieldProps) => `Digite ${field.label.toLowerCase()}`,
  }),

  email: createFieldRenderer(Input, {
    type: "email",
    defaultValue: "",
    defaultPlaceholder: (field: FieldProps) => `Digite ${field.label.toLowerCase()}`,
  }),

  select: ({ field, control }: FieldRendererProps) => (
    <Controller
      name={field.id}
      control={control}
      defaultValue=""
      rules={{ required: field.required }}
      render={({ field: { onChange, value, ref, ...rest } }) => (
        <Select 
          defaultValue={value} 
          onValueChange={onChange}
          value={value || ""}
        >
          <SelectTrigger ref={ref} {...rest}>
            <SelectValue placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  ),

  checkbox: createFieldRenderer(Checkbox, {
    defaultValue: false,
    onChangeWrapper: (checked: boolean) => checked,
  }),

  cpf: createFieldRenderer(Input, {
    type: "text",
    defaultValue: "",
    maxLength: 14,
    onChangeWrapper: (e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e.target.value),
    defaultPlaceholder: () => "Digite o CPF",
  }),

  cnpj: createFieldRenderer(Input, {
    type: "text",
    defaultValue: "",
    maxLength: 18,
    onChangeWrapper: (e: React.ChangeEvent<HTMLInputElement>) => maskCNPJ(e.target.value),
    defaultPlaceholder: () => "Digite o CNPJ",
  }),

  file: createFieldRenderer(Input, {
    type: "file",
    defaultValue: "",
    onChangeWrapper: (e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0],
    defaultPlaceholder: () => "Selecione um arquivo",
  }),

  disclaimer: ({ field }: FieldRendererProps) => (
    <p className="text-sm text-muted-foreground">{field.label}</p>
  ),
};

export function renderFieldFromRegistry(
  type: FieldType,
  props: FieldRendererProps
): JSX.Element | null {
  const renderer = fieldRenderers[type];
  if (!renderer) {
    console.warn(`No renderer found for field type: ${type}`);
    return null;
  }
  return renderer(props);
}

