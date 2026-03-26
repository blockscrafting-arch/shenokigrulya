"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";

interface CompositionSectionProps {
  content: string;
}

interface Tab {
  id: string;
  label: string;
  content: string;
}

function parseComposition(raw: string): Tab[] {
  const tabs: Tab[] = [];
  const parts = raw.split(
    /\n(?=(?:Состав|Питательные вещества|Энергетическая ценность):)/
  );

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("Состав:")) {
      tabs.push({
        id: "composition",
        label: "Состав",
        content: trimmed.replace("Состав:", "").trim(),
      });
    } else if (trimmed.startsWith("Питательные вещества:")) {
      tabs.push({
        id: "nutrition",
        label: "Питательные вещества",
        content: trimmed.replace("Питательные вещества:", "").trim(),
      });
    } else if (trimmed.startsWith("Энергетическая ценность:")) {
      tabs.push({
        id: "energy",
        label: "Энергетическая ценность",
        content: trimmed.replace("Энергетическая ценность:", "").trim(),
      });
    } else {
      tabs.push({ id: "info", label: "Информация", content: trimmed });
    }
  }

  if (tabs.length === 0) {
    tabs.push({ id: "info", label: "Информация", content: raw });
  }

  return tabs;
}

export function CompositionSection({ content }: CompositionSectionProps) {
  const tabs = parseComposition(content);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "info");
  const activeContent =
    tabs.find((t) => t.id === activeTab)?.content ?? "";

  return (
    <section id="composition" className="bg-surface-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">
              Детали
            </p>
            <h2 className="font-heading text-3xl font-bold text-ink md:text-4xl">
              Состав и питательная ценность
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="mx-auto max-w-3xl">
            {/* Tabs */}
            {tabs.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-1.5 rounded-2xl bg-surface p-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-surface-card text-ink shadow-sm"
                        : "text-ink-muted hover:text-ink-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="rounded-2xl border border-line/50 bg-surface p-6 md:p-8">
              <div className="whitespace-pre-wrap text-[15px] leading-[1.8] text-ink-secondary">
                {activeContent}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
