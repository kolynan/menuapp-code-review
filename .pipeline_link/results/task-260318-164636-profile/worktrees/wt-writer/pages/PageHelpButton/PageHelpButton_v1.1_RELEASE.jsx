// Version: 1.1-RELEASE | Updated: 2026-02-21 | Session: 21 | Source: BASE v1.1 + 7 patches (Claude)
// Patches applied:
//   PATCH-1: ### heading support in markdown renderer
//   PATCH-2: Numbered list support (1. 2. 3.)
//   PATCH-3: Italic support (_text_)
//   PATCH-4: Block javascript: protocol in URL validation
//   PATCH-5: Query limit:1 for PageHelp filter
//   PATCH-6: Touch target h-11 w-11 (project standard, WCAG 2.5.5)
//   PATCH-7: aria-hidden on Info icon for accessibility

import React, { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/components/i18n";
import { base44 } from "@/api/base44Client";

// Safe markdown renderer (MVP, no libraries)
function renderMarkdown(markdown) {
  if (!markdown) return "";

  // Step 1: Escape HTML entities
  let text = String(markdown)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Step 2: Apply markdown transforms
  const lines = text.split("\n");
  const result = [];
  let inList = false;      // unordered list
  let inOlList = false;    // PATCH-2: ordered list

  for (let line of lines) {
    // PATCH-1: ### Headings (check longest prefix first)
    if (line.startsWith("### ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      if (inOlList) { result.push("</ol>"); inOlList = false; }
      result.push(`<h3 class="text-base font-semibold mt-3 mb-1">${line.slice(4)}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      if (inOlList) { result.push("</ol>"); inOlList = false; }
      result.push(`<h2 class="text-lg font-semibold mt-4 mb-2">${line.slice(3)}</h2>`);
    } else if (line.startsWith("# ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      if (inOlList) { result.push("</ol>"); inOlList = false; }
      result.push(`<h1 class="text-xl font-bold mt-4 mb-2">${line.slice(2)}</h1>`);
    } else if (line.startsWith("- ")) {
      // Bullet lists
      if (inOlList) { result.push("</ol>"); inOlList = false; }
      if (!inList) {
        result.push('<ul class="list-disc ml-6 space-y-1">');
        inList = true;
      }
      let content = line.slice(2);
      content = applyInlineFormatting(content);
      result.push(`<li>${content}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      // PATCH-2: Numbered lists (e.g. "1. First item")
      if (inList) { result.push("</ul>"); inList = false; }
      if (!inOlList) {
        result.push('<ol class="list-decimal ml-6 space-y-1">');
        inOlList = true;
      }
      let content = line.replace(/^\d+\.\s/, "");
      content = applyInlineFormatting(content);
      result.push(`<li>${content}</li>`);
    } else {
      // Close lists if needed
      if (inList) { result.push("</ul>"); inList = false; }
      if (inOlList) { result.push("</ol>"); inOlList = false; }

      // Regular paragraph
      if (line.trim()) {
        const formatted = applyInlineFormatting(line);
        result.push(`<p class="mb-2">${formatted}</p>`);
      } else {
        result.push("<br />");
      }
    }
  }

  // Close any open list
  if (inList) { result.push("</ul>"); }
  if (inOlList) { result.push("</ol>"); }

  return result.join("\n");
}

function applyInlineFormatting(text) {
  // Bold: **text** → <strong>text</strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // PATCH-3: Italic: _text_ → <em>text</em> (single underscores, not inside words)
  text = text.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  // Links: [text](url) → <a href="url" target="_blank" rel="noopener noreferrer">text</a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    // PATCH-4: Block javascript: protocol + basic URL validation
    if (url && (url.startsWith("http://") || url.startsWith("https://")) && !url.toLowerCase().startsWith("javascript:")) {
      // Sanitize URL: escape quotes to prevent attribute injection
      const safeUrl = url.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">${linkText}</a>`;
    }
    // Invalid URL - render as plain text
    return `${linkText}`;
  });

  return text;
}

export default function PageHelpButton({ pageKey }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState({ type: "initial" }); // initial | loading | content | fallback
  const [isDesktop, setIsDesktop] = useState(true);

  // Responsive detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mediaQuery.matches);

    const handleChange = (e) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Reset state when pageKey changes (e.g. navigation without unmount)
  useEffect(() => {
    setState({ type: "initial" });
  }, [pageKey]);

  // Lazy load help content when Sheet opens
  useEffect(() => {
    if (!isOpen || state.type !== "initial") return;

    let cancelled = false;

    const loadHelp = async () => {
      setState({ type: "loading" });

      try {
        // PATCH-5: Add limit:1 — we only use the first record anyway
        const results = await base44.entities.PageHelp.filter({
          pageKey: pageKey,
          isActive: true,
          _limit: 1,
        });

        if (cancelled) return;

        if (results && results.length > 0) {
          const record = results[0];
          setState({
            type: "content",
            title: record.title,
            markdown: record.markdown,
          });
        } else {
          setState({ type: "fallback" });
        }
      } catch (err) {
        console.error("Failed to load page help:", err);
        if (!cancelled) {
          setState({ type: "fallback" });
        }
      }
    };

    loadHelp();

    return () => {
      cancelled = true;
    };
  }, [isOpen, state.type, pageKey]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* PATCH-6: Touch target h-11 w-11 (44px, WCAG 2.5.5 minimum) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpen}
              aria-label={t("help.button", "Помощь")}
              className="h-11 w-11 p-0"
            >
              {/* PATCH-7: aria-hidden on decorative icon */}
              <Info className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("help.button", "Помощь")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className="max-h-[80vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {state.type === "content" && state.title
                ? state.title
                : t("help.title", "Справка")}
            </SheetTitle>
            <SheetDescription>
              {t("help.description", "Инструкция по текущей странице")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {state.type === "loading" && (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("help.loading", "Загрузка...")}</span>
              </div>
            )}

            {state.type === "content" && (() => {
              try {
                return (
                  <div
                    className="space-y-2 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(state.markdown) }}
                  />
                );
              } catch {
                return (
                  <p className="text-sm text-slate-500 whitespace-pre-wrap">
                    {state.markdown}
                  </p>
                );
              }
            })()}

            {state.type === "fallback" && (
              <p className="text-sm text-slate-500">
                {t("help.noContent", "Инструкция скоро будет.")}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
