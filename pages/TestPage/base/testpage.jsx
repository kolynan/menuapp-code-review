import React, { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/components/i18n";
import { Loader2 } from "lucide-react";

// TestPage — minimal fake page for pipeline smoke testing

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback((signal) => {
    setLoading(true);
    setError(null);
    fetch("/api/items", { signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadItems(controller.signal);
    return () => controller.abort();
  }, [loadItems]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{t('testpage.header.title')}</h1>
      {error && (
        <div className="text-red-500 mb-4" role="alert">
          <p>{t('common.error')}</p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => loadItems()}
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      {items.length === 0 && !error && <p>{t('testpage.state.no_items')}</p>}
      <ul>
        {items.map((item, index) => (
          <li key={item.id ?? index} className="py-2 border-b">{item.name ?? '—'}</li>
        ))}
      </ul>
    </div>
  );
}
