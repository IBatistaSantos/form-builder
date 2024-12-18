import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FieldProps } from "../types/field";

interface FieldsListProps {
  fields: FieldProps[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onRemoveField: (id: string) => void;
}

export function TopLevelFieldsList(props: FieldsListProps) {
  return <FieldsList {...props} />;
}

export function FieldsList({ fields, selectedFieldId, onSelectField, onRemoveField }: FieldsListProps) {
  const renderFields = (fieldsToRender: FieldProps[], isNested: boolean = false) => (
    <div className={`space-y-2 ${isNested ? 'ml-4' : ''}`}>
      {fieldsToRender.map((field, index) => (
        <Draggable key={field.id} draggableId={field.id} index={index} isDragDisabled={isNested}>
          {(provided) => (
            <Card
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`${field.id === selectedFieldId ? "border-primary" : ""}`}
            >
              <CardContent className="p-2">
                <Collapsible defaultOpen>
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger
                      onClick={() => onSelectField(field.id)}
                      className="flex-grow text-left"
                    >
                      <span className="font-medium">
                        {field.label} ({field.type})
                      </span>
                    </CollapsibleTrigger>
                    <div className="flex items-center space-x-2">
                      {!isNested && (
                        <span {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical size={16} />
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveField(field.id);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent className="pl-4 border-l ml-2 mt-2 space-y-2">
                    {field.conditionals?.map((cond, cIndex) => (
                      <div key={cIndex} className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Condicional: {cond.labelValue}</p>
                        {renderFields(cond.fields, true)}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}
        </Draggable>
      ))}
    </div>
  );

  return (
    <Droppable droppableId="root">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {renderFields(fields)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

