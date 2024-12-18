"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, memo } from "react";
import { FieldProps } from "../types/field";
import { SingleFieldRenderer } from "./FormBuilder/SingleFieldRenderer";

interface VirtualizedFieldListProps {
  fields: FieldProps[];
  control: any;
  watch: any;
}

export const VirtualizedFieldList = memo(function VirtualizedFieldList({
  fields,
  control,
  watch,
}: VirtualizedFieldListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, 
    overscan: 5, 
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <SingleFieldRenderer
              field={fields[virtualRow.index]}
              control={control}
              watch={watch}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

