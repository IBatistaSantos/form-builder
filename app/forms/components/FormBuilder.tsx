'use client'

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FieldProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { maskCPF, maskCNPJ } from "../utils/mask";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface FormBuilderProps {
  fields: FieldProps[];
  onSubmit: (data: any) => void;
}

export function FormBuilder({ fields, onSubmit }: FormBuilderProps) {
  const { control, handleSubmit, watch } = useForm();

  const renderFieldLabel = (field: FieldProps) => (
    <div className="flex items-center gap-2 mb-2">
      <Label className="flex items-center gap-2">
        <span>{field.label}</span>
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {field.info && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{field.info}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  const renderField = (field: FieldProps) => {
    const commonProps = {
      id: field.id,
      "aria-label": field.label,
      required: field.required,
    };

    switch (field.type) {
      case "text":
      case "email":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue=""
            rules={{ required: field.required }}
            render={({ field: { onChange, value, ...rest } }) => (
              <Input
                {...rest}
                {...commonProps}
                type={field.type}
                placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
                onChange={onChange}
                value={value}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue=""
            rules={{ required: field.required }}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value || ""}>
                <SelectTrigger {...commonProps}>
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
        );

      case "checkbox":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={false}
            rules={{ required: field.required }}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                {...commonProps}
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />
        );

      case "cpf":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue=""
            rules={{ required: field.required }}
            render={({ field: { onChange, value, ...rest } }) => (
              <Input
                {...rest}
                {...commonProps}
                type="text"
                placeholder={field.placeholder || "Digite o CPF"}
                onChange={(e) => onChange(maskCPF(e.target.value))}
                value={value}
                maxLength={14}
              />
            )}
          />
        );

      case "cnpj":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue=""
            rules={{ required: field.required }}
            render={({ field: { onChange, value, ...rest } }) => (
              <Input
                {...rest}
                {...commonProps}
                type="text"
                placeholder={field.placeholder || "Digite o CNPJ"}
                onChange={(e) => onChange(maskCNPJ(e.target.value))}
                value={value}
                maxLength={18}
              />
            )}
          />
        );

      case "file":
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue=""
            rules={{ required: field.required }}
            render={({ field: { onChange, ...rest } }) => (
              <Input
                {...rest}
                {...commonProps}
                type="file"
                placeholder={field.placeholder || "Selecione um arquivo"}
                onChange={(e) => onChange(e.target.files?.[0])}
              />
            )}
          />
        );

      case "disclaimer":
        return (
          <p className="text-sm text-muted-foreground">
            {field.label}
          </p>
        );

      default:
        return null;
    }
  };

  const renderFields = (fieldsToRender: FieldProps[]) => {
    return fieldsToRender.map((field) => (
      <div key={field.id} className="space-y-2">
        {renderFieldLabel(field)}
        {renderField(field)}
        {field.conditionals?.map((cond, index) => {
          const watchedValue = watch(field.id);
          if (watchedValue === cond.labelValue) {
            return (
              <div key={index} className="mt-4 pl-4 border-l-2 border-muted">
                {renderFields(cond.fields)}
              </div>
            );
          }
          return null;
        })}
      </div>
    ));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {renderFields(fields)}
      <Button type="submit" className="mt-6">
        Enviar
      </Button>
    </form>
  );
}

