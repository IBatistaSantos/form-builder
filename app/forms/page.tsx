"use client";

import React, { useState } from "react";
import { FormBuilder } from "./components/FormBuilder";
import { OptionsEditor } from "./components/OptionsEditor";
import { Button } from "@/components/ui/button";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, Eye, X } from 'lucide-react';
import { TopLevelFieldsList } from "./components/TopLevelFieldsList";
import {  FieldProps, FieldType, Field  } from "./types/field";


const ALL_FIELD_TYPES: FieldType[] = [
  "text",
  "checkbox",
  "select",
  "email",
  "file",
  "cpf",
  "cnpj",
  "disclaimer",
];

const AVAILABLE_FIELDS: Omit<FieldProps, "id" | "conditionals">[] = [
  { type: "text", label: "Campo Texto" },
  { type: "email", label: "Campo Email" },
  { type: "checkbox", label: "Checkbox" },
  { type: "select", label: "Select", options: ["Opção A", "Opção B"] },
  { type: "cpf", label: "CPF" },
  { type: "cnpj", label: "CNPJ" },
  { type: "file", label: "File Upload" },
  { type: "disclaimer", label: "Disclaimer" },
];

export default function BuilderPage() {
  const [fields, setFields] = useState<FieldProps[]>([]); // Updated type
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  function handleAddField(template: Omit<FieldProps, "id" | "conditionals">) { // Updated function signature
    const newField: FieldProps = { // Updated type
      id: crypto.randomUUID(),
      ...template,
      conditionals: [],
    };
    setFields((prev) => [...prev, newField]);
  }

  function onSelectField(fieldId: string) {
    setSelectedFieldId(fieldId);
  }

  function handleFieldChange<K extends keyof FieldProps>(key: K, value: FieldProps[K]) { // Updated type
    if (!selectedFieldId) return;
    setFields((prev) => Field.updateFieldById(prev, selectedFieldId, { [key]: value }));
  }

  function handleOptionsChange(newOpts: string[]) {
    if (!selectedFieldId) return;
    handleFieldChange("options", newOpts);
  }

  function handleAddConditional() {
    if (!selectedFieldId) return;
    const field = Field.findFieldById(fields, selectedFieldId);
    if (!field) return;

    if (field.type !== "select") return;
    if (!field.options || field.options.length < 2) {
      alert("Precisa de no mínimo 2 opções para adicionar condicional!");
      return;
    }
    setFields((prev) => Field.addConditionalToField(prev, selectedFieldId));
  }

  function handleChangeCondValue(condIndex: number, value: string) {
    if (!selectedFieldId) return;
    const selectedField = Field.findFieldById(fields, selectedFieldId);
    if (!selectedField || !selectedField.conditionals) return;

    const cond = selectedField.conditionals[condIndex];
    if (!cond) return;

    const updatedConds = [...selectedField.conditionals];
    updatedConds[condIndex] = { ...cond, labelValue: value };
    setFields((prev) => Field.updateFieldById(prev, selectedFieldId, { conditionals: updatedConds }));
  }

  function handleAddChildField(condIndex: number, fieldType: FieldType) {
    if (!selectedFieldId) return;
    setFields((prev) => Field.addChildFieldToConditional(prev, selectedFieldId, condIndex, fieldType));
  }

  // Drag end - reorder em todos os níveis
  function handleDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    setFields((prevFields) => Field.reorder(prevFields, source.index, destination.index));
  }

  function handleRemoveField(fieldId: string) {
    setFields((prev) => Field.removeField(prev, fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }
  
  function handleRemoveConditional(parentId: string, condIndex: number) {
    setFields((prev) => Field.removeConditional(prev, parentId, condIndex));
  }
  

  function renderEditPanel() {
    if (!selectedFieldId) return <p className="mt-2 text-sm text-gray-500">Selecione um campo</p>;
    const selectedField = Field.findFieldById(fields, selectedFieldId);
    if (!selectedField) return null;

    return (
      <div className="mt-4 space-y-4">
        <h3 className="font-semibold">Propriedades</h3>
        <div>
          <label className="block text-sm font-medium">Label</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1 text-sm"
            value={selectedField.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
          />
        </div>

        {selectedField.type !== "disclaimer" && selectedField.type !== "checkbox" && (
          <div>
            <label className="block text-sm font-medium">Placeholder</label>
            <input
              type="text"
              className="border rounded w-full px-2 py-1 text-sm"
              value={selectedField.placeholder || ""}
              onChange={(e) => handleFieldChange("placeholder", e.target.value)}
              placeholder="Digite o placeholder do campo"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Informativo</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1 text-sm"
            value={selectedField.info || ""}
            onChange={(e) => handleFieldChange("info", e.target.value)}
            placeholder="Digite o texto informativo"
          />
        </div>

        {selectedField.type === "select" && (
          <div>
            <label className="block text-sm font-medium">Opções</label>
            <OptionsEditor
              options={selectedField.options || []}
              onChange={handleOptionsChange}
            />
          </div>
        )}


        {selectedField.type !== "disclaimer" && (
          <div className="flex items-center gap-2">
          <input
            id="required-checkbox"
            type="checkbox"
            checked={!!selectedField.required}
            onChange={(e) => handleFieldChange("required", e.target.checked)}
          />
          <label htmlFor="required-checkbox" className="text-sm">
            Required
          </label>
        </div>
        )}

        

        <Button variant="destructive" size="sm" onClick={() => handleRemoveField(selectedField.id)}>
          Remover Campo
        </Button>

        {selectedField.type === "select" && (
          <>
            <hr className="my-2" />
            <h3 className="font-semibold mb-2">Condicionais</h3>
            <Button variant="default" size="sm" onClick={handleAddConditional}>
              + Adicionar Condicional
            </Button>

            {selectedField.conditionals?.map((cond, condIndex) => {
              const parentOptions = selectedField.options || [];
              return (
                <div key={condIndex} className="border p-2 mt-2 rounded space-y-2 text-sm bg-white">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Valor do pai que ativa esta condicional</label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConditional(selectedField.id, condIndex)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <select
                    className="border rounded w-full px-2 py-1 text-sm"
                    value={cond.labelValue}
                    onChange={(e) => handleChangeCondValue(condIndex, e.target.value)}
                  >
                    <option value="">-- Selecione --</option>
                    {parentOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">Adicionar Campo-Filho:</label>
                    <select
                      className="border rounded text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value as FieldType;
                        if (val) handleAddChildField(condIndex, val);
                        e.target.value = "";
                      }}
                    >
                      <option value="">-- Selecione um tipo --</option>
                      {ALL_FIELD_TYPES.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  {cond.fields.map((childField) => (
                    <div
                      key={childField.id}
                      className="p-2 border rounded mt-2 bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedFieldId(childField.id)}
                    >
                      <div className="text-sm font-medium">
                        {childField.label} ({childField.type})
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 container mx-auto py-6">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">
              <Settings className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="builder" className="border-none p-0">
            <div className="flex gap-6">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4">Field Library</h2>
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_FIELDS.map((tmpl, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full text-sm justify-start"
                          onClick={() => handleAddField(tmpl)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {tmpl.label}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4">Form Structure</h2>
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <TopLevelFieldsList
                        fields={fields}
                        selectedFieldId={selectedFieldId}
                        onSelectField={onSelectField}
                        onRemoveField={handleRemoveField}
                      />
                    </DragDropContext>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4">Field Properties</h2>
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {renderEditPanel()}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="border-none p-0">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Form Preview</h2>
                <FormBuilder
                  fields={fields}
                  onSubmit={(vals) => {
                    alert("Form Submitted:\n" + JSON.stringify(vals, null, 2));
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="json" className="border-none p-0">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">JSON Output</h2>
                <pre className="bg-secondary p-4 rounded-md overflow-auto">
                  {JSON.stringify(fields, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

