"use client";

import { useState } from "react";

interface CompositionBlockProps {
  content: string;
}

const PREVIEW_LINES = 6;

export function CompositionBlock({ content }: CompositionBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split("\n");
  const showButton = lines.length > PREVIEW_LINES;
  const displayLines = expanded ? lines : lines.slice(0, PREVIEW_LINES);
  const displayContent = displayLines.join("\n").trim();

  return (
    <div className="rounded-xl border border-black/10 bg-white/50 p-4">
      <h3 className="mb-2 font-medium text-primary">Состав и питательные вещества</h3>
      <div className="whitespace-pre-wrap text-sm text-text-muted">{displayContent}</div>
      {showButton && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-primary underline hover:no-underline"
        >
          {expanded ? "Свернуть" : "Развернуть состав"}
        </button>
      )}
    </div>
  );
}
