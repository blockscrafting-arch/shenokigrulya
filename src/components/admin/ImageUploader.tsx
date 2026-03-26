"use client";

import { useState, useCallback } from "react";

interface ImageUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUploader({ urls, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        onChange([...urls, data.url]);
      } catch (err) {
        console.error(err);
        alert("Ошибка загрузки");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [urls, onChange]
  );

  const remove = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-black/10">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/20 text-sm text-text-muted hover:bg-black/5">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
          {uploading ? "…" : "+"}
        </label>
      </div>
    </div>
  );
}
