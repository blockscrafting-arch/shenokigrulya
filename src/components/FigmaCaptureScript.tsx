"use client";

import { useEffect } from "react";

export function FigmaCaptureScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    document.head.appendChild(script);
  }, []);

  return null;
}
