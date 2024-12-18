"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (options.length < 2) {
      setError("Precisa de no mínimo duas opções.");
    } else {
      setError("");
    }
  }, [options]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  }

  function addOption() {
    const val = inputValue.trim();
    if (val && !options.includes(val)) {
      const newOpts = [...options, val];
      onChange(newOpts);

      if (newOpts.length < 2) {
        setError("Precisa de no mínimo duas opções.");
      } else {
        setError("");
      }
    }
    setInputValue("");
  }

  function removeOption(opt: string) {
    const newOpts = options.filter((o) => o !== opt);

    if (newOpts.length < 2) {
      setError("Precisa de no mínimo duas opções.");
      return 
    }

    setError("");
    onChange(newOpts);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map((opt, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {opt}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4"
              onClick={() => removeOption(opt)}
            >
              x
            </Button>
          </Badge>
        ))}
      </div>

      <input
        type="text"
        className="border rounded w-full px-2 py-1 text-sm"
        placeholder="Digite a nova opção e pressione Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
