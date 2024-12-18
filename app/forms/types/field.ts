export type FieldType =
  | "text"
  | "checkbox"
  | "select"
  | "email"
  | "cpf"
  | "cnpj"
  | "file"
  | "disclaimer";

export interface Conditional {
  labelValue: string;
  fields: FieldProps[];
}

export interface FieldProps {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  conditionals?: Conditional[];
  placeholder?: string;
  info?: string;
}

export class Field {
  static reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  
  static findFieldById(fields: FieldProps[], id: string): FieldProps | null {
    for (const field of fields) {
      if (field.id === id) return field;
      if (field.conditionals) {
        for (const cond of field.conditionals) {
          const child = this.findFieldById(cond.fields, id);
          if (child) return child;
        }
      }
    }
    return null;
  }
  
  static updateFieldById(fields: FieldProps[], id: string, partial: Partial<FieldProps>): FieldProps[] {
    return fields.map((f) => {
      if (f.id === id) return { ...f, ...partial };
      if (f.conditionals) {
        const newConds = f.conditionals.map((cond) => ({
          ...cond,
          fields: this.updateFieldById(cond.fields, id, partial),
        }));
        return { ...f, conditionals: newConds };
      }
      return f;
    });
  }

  static addConditionalToField(fields: FieldProps[], id: string): FieldProps[] {
    return fields.map((f) => {
      if (f.id === id) {
        const conds = f.conditionals ? [...f.conditionals] : [];
        conds.push({ labelValue: "", fields: [] });
        return { ...f, conditionals: conds };
      }
      if (f.conditionals) {
        const newConds = f.conditionals.map((cond) => ({
          ...cond,
          fields: this.addConditionalToField(cond.fields, id),
        }));
        return { ...f, conditionals: newConds };
      }
      return f;
    });
  }


  
  static addChildFieldToConditional(fields: FieldProps[], parentId: string, condIndex: number, fieldType: FieldType): FieldProps[] {
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
          fields: this.addChildFieldToConditional(cond.fields, parentId, condIndex, fieldType),
        }));
        return { ...f, conditionals: updatedConds };
      }
      return f;
    });
  }
  

  static removeField(fields: FieldProps[], id: string): FieldProps[] {
    return fields.filter(f => f.id !== id).map(f => {
      if (f.conditionals) {
        return {
          ...f,
          conditionals: f.conditionals.map(cond => ({
            ...cond,
            fields: this.removeField(cond.fields, id)
          }))
        };
      }
      return f;
    });
  }

  static removeConditional(fields: FieldProps[], parentId: string, condIndex: number): FieldProps[] {
    return fields.map(f => {
      if (f.id === parentId && f.conditionals) {
        const newConds = [...f.conditionals];
        newConds.splice(condIndex, 1);
        return { ...f, conditionals: newConds };
      }
      if (f.conditionals) {
        return {
          ...f,
          conditionals: f.conditionals.map(cond => ({
            ...cond,
            fields: this.removeConditional(cond.fields, parentId, condIndex)
          }))
        };
      }
      return f;
    });
  }
}

