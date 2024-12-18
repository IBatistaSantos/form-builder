"use client";

import React, { useCallback,  Suspense } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldProps } from "../../types/field";

import { Skeleton } from "@/components/ui/skeleton";
import { useFormState } from "./useFormState";
import { VirtualizedFieldList } from "../VirtualizedFieldList";


interface FormBuilderProps {
  fields: FieldProps[];
  onSubmit: (data: any) => void;
}

const FormSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

export const FormBuilder = React.memo(function FormBuilder({
  fields,
  onSubmit,
}: FormBuilderProps) {

  const { defaultValues } = useFormState(fields);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  // Memoize the submit handler
  const onSubmitHandler = useCallback(
    async (data: any) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <Suspense fallback={<FormSkeleton />}>
        <VirtualizedFieldList fields={fields} control={control} watch={watch} />
      </Suspense>

      <Button type="submit" className="mt-6" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
});

