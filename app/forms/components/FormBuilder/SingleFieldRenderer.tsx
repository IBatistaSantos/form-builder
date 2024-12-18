"use client";

import React, { useEffect, useMemo, useCallback, memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { FieldProps } from "../../types/field";
import { renderFieldFromRegistry } from "./FieldRegistry";

interface SingleFieldRendererProps {
  field: FieldProps;
  control: any;
  watch: (name: string) => any;
}

export const SingleFieldRenderer = memo(function SingleFieldRenderer({ 
  field, 
  control, 
  watch 
}: SingleFieldRendererProps) {

  const watchedValue = watch(field.id);


  const shouldRenderConditionals = useMemo(() => {
    if (!field.conditionals?.length) return false;
    return field.conditionals.some(cond => cond.labelValue === watchedValue);
  }, [field.conditionals, watchedValue]);

  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      if (endTime - startTime > 16.67) {
        console.warn(`Slow render for field "${field.label}":`, endTime - startTime);
      }
    };
  });

  const labelComponent = useMemo(() => {
    if (field.type === "disclaimer") return null;
    
    return (
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
  }, [field.label, field.required, field.info, field.type]);

  const fieldInput = useMemo(() => {
    return renderFieldFromRegistry(field.type, { field, control });
  }, [field, control]);

  const renderConditionalFields = useCallback(() => {
    if (!shouldRenderConditionals) return null;

    return field.conditionals?.map((cond, index) => {
      if (cond.labelValue !== watchedValue) return null;

      return (
        <div key={index} className="mt-4 pl-4 border-l-2 border-muted">
          {cond.fields.map((childField) => (
            <SingleFieldRenderer
              key={childField.id}
              field={childField}
              control={control}
              watch={watch}
            />
          ))}
        </div>
      );
    });
  }, [field.conditionals, watchedValue, control, watch, shouldRenderConditionals]);

  return (
    <div className="space-y-2">
      {labelComponent}
      {fieldInput}
      {shouldRenderConditionals && renderConditionalFields()}
    </div>
  );
});

