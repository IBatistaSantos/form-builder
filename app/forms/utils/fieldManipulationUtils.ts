import { FieldProps, FieldType } from "../types/field";

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function findFieldById(fields: FieldProps[], id: string): FieldProps | null {
  for (const field of fields) {
    if (field.id === id) return field;
    if (field.conditionals) {
      for (const cond of field.conditionals) {
        const child = findFieldById(cond.fields, id);
        if (child) return child;
      }
    }
  }
  return null;
}

export function updateFieldById(fields: FieldProps[], id: string, partial: Partial<FieldProps>): FieldProps[] {
  return fields.map((f) => {
    if (f.id === id) return { ...f, ...partial };
    if (f.conditionals) {
      const newConds = f.conditionals.map((cond) => ({
        ...cond,
        fields: updateFieldById(cond.fields, id, partial),
      }));
      return { ...f, conditionals: newConds };
    }
    return f;
  });
}

export function addConditionalToField(fields: FieldProps[], id: string): FieldProps[] {
  return fields.map((f) => {
    if (f.id === id) {
      const conds = f.conditionals ? [...f.conditionals] : [];
      conds.push({ labelValue: "", fields: [] });
      return { ...f, conditionals: conds };
    }
    if (f.conditionals) {
      const newConds = f.conditionals.map((cond) => ({
        ...cond,
        fields: addConditionalToField(cond.fields, id),
      }));
      return { ...f, conditionals: newConds };
    }
    return f;
  });
}

export function addChildFieldToConditional(
  fields: FieldProps[],
  parentId: string,
  condIndex: number,
  fieldType: FieldType
): FieldProps[] {
  return fields.map((f) => {
    if (f.id === parentId && f.conditionals) {
      const newConds = [...f.conditionals];
      const targetCond = newConds[condIndex];
      const child: FieldProps = {
        id: crypto.randomUUID(),
        type: fieldType,
        label: `Novo ${fieldType}`,
        conditionals: [],
      };
      newConds[condIndex] = { ...targetCond, fields: [...targetCond.fields, child] };
      return { ...f, conditionals: newConds };
    }
    if (f.conditionals) {
      const updatedConds = f.conditionals.map((cond) => ({
        ...cond,
        fields: addChildFieldToConditional(cond.fields, parentId, condIndex, fieldType),
      }));
      return { ...f, conditionals: updatedConds };
    }
    return f;
  });
}

/**
 * Remove Field completamente (inclusive de dentro de conditionals aninhadas).
 */
export function removeField(fields: FieldProps[], fieldId: string): FieldProps[] {
  const newFields: FieldProps[] = [];
  for (let f of fields) {
    if (f.id === fieldId) {
      continue; // Skip
    }
    // Recursivamente remover de conditionals
    if (f.conditionals && f.conditionals.length > 0) {
      const newConds = f.conditionals.map((cond) => ({
        ...cond,
        fields: removeField(cond.fields, fieldId),
      }));
      f = { ...f, conditionals: newConds };
    }
    newFields.push(f);
  }
  return newFields;
}

/**
 * Remove condicional do array de conditionals.
 */
export function removeConditional(
  fields: FieldProps[],
  parentId: string,
  condIndex: number
): FieldProps[] {
  return fields.map((f) => {
    if (f.id === parentId && f.conditionals) {
      const newConds = [...f.conditionals];
      newConds.splice(condIndex, 1);
      return { ...f, conditionals: newConds };
    } else if (f.conditionals) {
      const updatedConds = f.conditionals.map((cond) => ({
        ...cond,
        fields: removeConditional(cond.fields, parentId, condIndex),
      }));
      return { ...f, conditionals: updatedConds };
    }
    return f;
  });
}

