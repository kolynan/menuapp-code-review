import React, { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/components/i18n";
import { Loader2 } from "lucide-react";

// TestPage — minimal fake page for pipeline smoke testing

function normalizeItems(data) {
  if (!Array.isArray(data)) return null;
  return data.filter(
    (row) =>
      row != null &&
      typeof row === "object" &&
      !Array.isArray(row) &&
      (typeof row.id === "string" || typeof row.id === "number") &&
      (row.name == null || typeof row.name !== "object")
  ).map((row) => ({
    ...row,
    name: row.name != null ? String(row.name) : "—",
  }));
}

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const loadItems = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    fetch("/api/items", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const normalized = normalizeItems(data);
        if (normalized === null) {
          setError(t("testpage.error.invalid_response"));
          setLoading(false);
          return;
        }
        setItems(normalized);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    loadItems();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [loadItems]);

  const isInitialLoad = loading && items.length === 0 && !error;

  if (isInitialLoad) {
    return (
      <div className="p-8 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        {t("testpage.header.title")}
      </h1>
      {error && (
        <div className="text-red-500 mb-4" role="alert">
          <p>{t("common.error")}</p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 min-h-[44px] min-w-[44px]"
            onClick={() => loadItems()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
            ) : null}
            {t("common.retry")}
          </button>
        </div>
      )}
      {loading && items.length > 0 && (
        <div className="flex items-center gap-2 mb-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      )}
      {items.length === 0 && !error && !loading && (
        <p>{t("testpage.state.no_items")}</p>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id} className="py-2 border-b">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
