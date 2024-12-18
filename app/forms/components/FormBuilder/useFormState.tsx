"use client";

import { useMemo } from "react";
import { FieldProps } from "../../types/field";

export function useFormState(fields: FieldProps[]) {
  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};
    
    const initializeField = (field: FieldProps) => {
      values[field.id] = field.type === 'checkbox' ? false : '';
      
      if (field.conditionals) {
        field.conditionals.forEach(cond => {
          cond.fields.forEach(childField => {
            initializeField(childField);
          });
        });
      }
    };

    fields.forEach(initializeField);
    return values;
  }, [fields]);


  const formState = useMemo(() => {
    const fieldCount = fields.reduce((count, field) => {
      let total = 1;
      if (field.conditionals) {
        field.conditionals.forEach(cond => {
          total += cond.fields.length;
        });
      }
      return count + total;
    }, 0);

    return {
      totalFields: fieldCount,
      hasConditionals: fields.some(f => f.conditionals?.length),
    };
  }, [fields]);

  return { defaultValues, formState };
}

